'use server';

import { randomBytes } from 'node:crypto';
import { redirect } from 'next/navigation';
import type { Where } from 'payload';

import { getCurrentUser } from '@/lib/auth/currentUser';
import { getPayloadClient } from '@/lib/data/payload';

import { createOrderReference } from './orderReference';
import { calculatePrice } from './pricing';
import { normalizePromoCode, validatePromoCode } from './promoCodes';
import { getPaymentProvider } from './registry';
import { paymentTiers, type PaymentTier } from './types';

type CheckoutError =
  | 'alreadyPurchased'
  | 'checkoutUnavailable'
  | 'invalidEmail'
  | 'invalidPromoCode'
  | 'invalidTier'
  | 'minimumAmount'
  | 'upgradeUnavailable';

export type CheckoutResult = { error: CheckoutError } | { redirectUrl: string };

export type CheckoutInput = {
  courseSlug: string;
  email?: string;
  locale: 'en' | 'ru';
  promoCode?: string;
  tier: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isPaymentTier = (tier: string): tier is PaymentTier =>
  paymentTiers.includes(tier as PaymentTier);

const hasPurchase = async (
  payload: Awaited<ReturnType<typeof getPayloadClient>>,
  userId: number,
  courseId: number,
  tier?: PaymentTier
) => {
  const filters: Where[] = [
    { user: { equals: userId } },
    { course: { equals: courseId } },
    { status: { equals: 'paid' } }
  ];

  if (tier) {
    filters.push({ tier: { equals: tier } });
  }

  const purchases = await payload.find({
    collection: 'purchases',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { and: filters }
  });

  return purchases.totalDocs > 0;
};

const findOrCreateUser = async (
  payload: Awaited<ReturnType<typeof getPayloadClient>>,
  email: string
) => {
  const users = await payload.find({
    collection: 'users',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { email: { equals: email } }
  });

  if (users.docs[0]) {
    return { created: false, user: users.docs[0] };
  }

  const user = await payload.create({
    collection: 'users',
    data: {
      email,
      password: randomBytes(24).toString('base64url'),
      role: 'student'
    },
    overrideAccess: true
  });

  return { created: true, user };
};

export const createCheckout = async ({
  courseSlug,
  email: submittedEmail,
  locale,
  promoCode: submittedPromoCode,
  tier: submittedTier
}: CheckoutInput): Promise<CheckoutResult> => {
  const provider = getPaymentProvider();

  if (!provider) {
    return { error: 'checkoutUnavailable' };
  }

  if (!isPaymentTier(submittedTier)) {
    return { error: 'invalidTier' };
  }

  const currentUser = await getCurrentUser();
  const email = (currentUser?.email || submittedEmail || '').trim().toLowerCase();

  if (!emailPattern.test(email)) {
    return { error: 'invalidEmail' };
  }

  const payload = await getPayloadClient();
  const courses = await payload.find({
    collection: 'courses',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: {
      and: [{ slug: { equals: courseSlug } }, { status: { equals: 'published' } }]
    }
  });
  const course = courses.docs[0];

  if (!course) {
    return { error: 'invalidTier' };
  }

  const { created, user } = await findOrCreateUser(payload, email);

  if (submittedTier !== 'feedback_upgrade' && (await hasPurchase(payload, user.id, course.id))) {
    return { error: 'alreadyPurchased' };
  }

  if (submittedTier === 'feedback_upgrade') {
    const hasStandard = await hasPurchase(payload, user.id, course.id, 'standard');
    const hasUpgrade = await hasPurchase(payload, user.id, course.id, 'feedback_upgrade');

    if (!hasStandard || hasUpgrade) {
      return { error: 'upgradeUnavailable' };
    }
  }

  let promo: { id: number; discountType: 'fixed' | 'percent'; value: number } | undefined;

  if (submittedPromoCode?.trim()) {
    const codes = await payload.find({
      collection: 'promoCodes',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: { code: { equals: normalizePromoCode(submittedPromoCode) } }
    });
    const candidate = codes.docs[0];
    const validation = validatePromoCode(candidate);

    if (!validation.ok) {
      return { error: 'invalidPromoCode' };
    }

    promo = {
      discountType: validation.discount.discountType,
      id: candidate.id,
      value: validation.discount.value
    };
  }

  const pricing = calculatePrice(
    { feedback: course.priceFeedback, standard: course.priceStandard },
    submittedTier,
    promo
  );

  if (!pricing.ok) {
    return { error: pricing.code === 'minimumAmount' ? 'minimumAmount' : 'invalidPromoCode' };
  }

  const orderReference = createOrderReference();
  const postPaymentToken = created ? randomBytes(32).toString('base64url') : undefined;
  const postPaymentTokenExpiresAt = created
    ? new Date(Date.now() + 60 * 60 * 1000).toISOString()
    : undefined;

  await payload.create({
    collection: 'purchases',
    data: {
      amount: pricing.amount,
      course: course.id,
      currency: course.currency,
      orderReference,
      postPaymentToken,
      postPaymentTokenExpiresAt,
      promoCode: promo?.id,
      provider: provider.name,
      status: 'pending',
      tier: submittedTier,
      user: user.id
    },
    overrideAccess: true
  });

  const checkout = provider.createCheckout({
    amount: pricing.amount,
    currency: course.currency,
    locale,
    orderReference,
    postPaymentToken
  });

  return { redirectUrl: checkout.redirectUrl };
};

export async function checkoutAction(
  _previousState: CheckoutResult | null,
  formData: FormData
): Promise<CheckoutResult> {
  const result = await createCheckout({
    courseSlug: String(formData.get('courseSlug') || ''),
    email: String(formData.get('email') || ''),
    locale: formData.get('locale') === 'ru' ? 'ru' : 'en',
    promoCode: String(formData.get('promoCode') || ''),
    tier: String(formData.get('tier') || '')
  });

  if ('redirectUrl' in result) {
    redirect(result.redirectUrl);
  }

  return result;
}

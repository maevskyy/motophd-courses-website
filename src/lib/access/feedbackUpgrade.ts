import type { PurchaseHistoryItem } from '@/lib/data/purchases';

export type FeedbackUpgradeCandidate = Pick<PurchaseHistoryItem, 'courseSlug' | 'status' | 'tier'>;

const feedbackTiers: ReadonlyArray<PurchaseHistoryItem['tier']> = ['feedback', 'feedback_upgrade'];

// Кнопка «докупить обратную связь» в кабинете: у курса есть paid standard и нет
// paid feedback / feedback_upgrade. Считается на сервере из истории покупок и
// уезжает в клиент списком slug'ов. Это зеркало проверки в createCheckout —
// та всё равно отклонит лишний upgrade, здесь решаем только, показывать ли кнопку.
export const getFeedbackUpgradeCourseSlugs = (purchases: FeedbackUpgradeCandidate[]) => {
  const paid = purchases.filter(({ courseSlug, status }) => courseSlug && status === 'paid');
  const withFeedback = new Set(
    paid.filter(({ tier }) => feedbackTiers.includes(tier)).map(({ courseSlug }) => courseSlug)
  );
  const standardOnly = paid
    .filter(({ courseSlug, tier }) => tier === 'standard' && !withFeedback.has(courseSlug))
    .map(({ courseSlug }) => courseSlug);

  return [...new Set(standardOnly)];
};

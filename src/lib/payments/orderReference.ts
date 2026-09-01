import { randomBytes } from 'node:crypto';

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789._-';
const orderReferencePattern = /^[A-Za-z0-9._-]+$/;

export const isOrderReference = (value: string) => orderReferencePattern.test(value);

export const createOrderReference = () => {
  const bytes = randomBytes(18);
  const value = [...bytes].map((byte) => alphabet[byte % alphabet.length]).join('');

  if (!isOrderReference(value)) {
    throw new Error('Generated invalid order reference');
  }

  return value;
};

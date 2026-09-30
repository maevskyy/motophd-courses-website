import { randomInt } from 'node:crypto';

// Без похожих символов (0/O, 1/l/I): пароль из письма переписывают руками,
// в том числе с телефона на компьютер.
const ALPHABET = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';

// Три группы по четыре символа через дефис: ~69 бит, читается и диктуется.
export const generatePassword = () =>
  Array.from({ length: 3 }, () =>
    Array.from({ length: 4 }, () => ALPHABET[randomInt(ALPHABET.length)]).join('')
  ).join('-');

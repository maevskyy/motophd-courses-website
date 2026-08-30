// Живёт отдельно от account.ts: файл с 'use server' может экспортировать
// только async-функции, объект-константа там роняет страницу в рантайме.
export type UpdateProfileFormState = {
  status: 'error' | 'idle' | 'success';
};

export const initialUpdateProfileFormState: UpdateProfileFormState = {
  status: 'idle'
};

// Минимум длины держим на сервере и в форме из одной константы.
export const MIN_PASSWORD_LENGTH = 8;

export type ChangePasswordFormState = {
  status: 'error' | 'idle' | 'mismatch' | 'success' | 'tooShort' | 'wrongCurrent';
};

export const initialChangePasswordFormState: ChangePasswordFormState = {
  status: 'idle'
};

export type DeleteAccountFormState = {
  status: 'confirmMismatch' | 'error' | 'idle';
};

export const initialDeleteAccountFormState: DeleteAccountFormState = {
  status: 'idle'
};

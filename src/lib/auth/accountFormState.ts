// Живёт отдельно от account.ts: файл с 'use server' может экспортировать
// только async-функции, объект-константа там роняет страницу в рантайме.
export type UpdateProfileFormState = {
  status: 'error' | 'idle' | 'success';
};

export const initialUpdateProfileFormState: UpdateProfileFormState = {
  status: 'idle'
};

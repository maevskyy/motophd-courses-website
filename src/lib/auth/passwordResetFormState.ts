export type ForgotPasswordFormState = {
  status: 'idle' | 'rateLimited' | 'sent';
};

export const initialForgotPasswordFormState: ForgotPasswordFormState = {
  status: 'idle'
};

export type ResetPasswordFormState = {
  status: 'idle' | 'invalidToken' | 'mismatch' | 'tooShort';
};

export const initialResetPasswordFormState: ResetPasswordFormState = {
  status: 'idle'
};

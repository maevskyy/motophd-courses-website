export type LoginFormState = {
  error: boolean;
  rateLimited?: boolean;
};

export const initialLoginFormState: LoginFormState = {
  error: false
};

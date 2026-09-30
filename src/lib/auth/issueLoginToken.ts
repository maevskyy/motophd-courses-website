import { createLocalReq, getFieldsToSign, jwtSign, type Payload } from 'payload';
import { addSessionToUser } from 'payload/shared';

import { keepOnlyCurrentSession } from './singleSession';

/*
  Вход без пароля — для автовхода после оплаты. Раньше сессию получали через
  forgotPassword + resetPassword со случайным паролем: пароль, который
  покупатель получает письмом, тут же переставал подходить.

  Повторяет то, что Payload делает при входе (resetPassword/login): новая
  сессия в users_sessions, JWT с её sid, afterLogin-хук «одна сессия».
*/
export const issueLoginToken = async (payload: Payload, userId: number) => {
  const collectionConfig = payload.collections.users.config;
  const req = await createLocalReq({}, payload);
  const user = await payload.db.findOne<{ email: string; id: number }>({
    collection: 'users',
    req,
    where: { id: { equals: userId } }
  });

  if (!user) {
    return null;
  }

  const { sid } = await addSessionToUser({ collectionConfig, payload, req, user: user as never });
  const fieldsToSign = getFieldsToSign({
    collectionConfig,
    email: user.email,
    sid,
    user: user as never
  });
  const { token } = await jwtSign({
    fieldsToSign,
    secret: payload.secret,
    tokenExpiration: collectionConfig.auth.tokenExpiration
  });

  await keepOnlyCurrentSession({
    collection: collectionConfig,
    context: {},
    req,
    token,
    user: user as never
  });

  return token;
};

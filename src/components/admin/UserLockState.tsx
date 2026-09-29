import type { Payload } from 'payload';

interface Props {
  data?: { email?: string; id?: number | string };
  i18n?: { language?: string };
  payload: Payload;
}

const copy = {
  en: {
    attempts: 'Failed sign-in attempts',
    locked: 'Signing in is blocked until',
    unlock: 'lift it with the Force Unlock button above',
    unlocked: 'Signing in works'
  },
  ru: {
    attempts: 'Неудачных попыток входа',
    locked: 'Вход заблокирован до',
    unlock: 'снять блокировку — кнопкой Force Unlock выше',
    unlocked: 'Вход работает'
  }
};

/*
  Payload запирает аккаунт после пяти неверных паролей на десять минут, но
  loginAttempts и lockUntil помечены hidden: ни в API, ни в карточке их не
  видно. Кнопка Force Unlock у Payload своя и висит всегда — по ней не понять,
  заперт ли аккаунт, поэтому админ менял пароль, вход всё равно не работал, и
  причина читалась только SQL-запросом на сервере (MOT-95).

  Поле серверное: значения берём через payload с showHiddenFields, наружу, в
  REST-ответ пользователя, они по-прежнему не уезжают.
*/
export async function UserLockState({ data, i18n, payload }: Props) {
  const id = data?.id;

  if (id === undefined) {
    return null;
  }

  const user = await payload.findByID({
    collection: 'users',
    id,
    showHiddenFields: true
  });

  const words = i18n?.language === 'ru' ? copy.ru : copy.en;
  const lockUntil = user.lockUntil ? new Date(user.lockUntil) : null;
  const locked = lockUntil !== null && lockUntil.getTime() > Date.now();
  const language = i18n?.language === 'ru' ? 'ru-RU' : 'en-GB';

  return (
    <div className="field-type">
      <div>
        {words.attempts}: {user.loginAttempts ?? 0}
      </div>
      <div>
        <strong>
          {locked && lockUntil
            ? `${words.locked} ${lockUntil.toLocaleString(language)} — ${words.unlock}`
            : words.unlocked}
        </strong>
      </div>
    </div>
  );
}

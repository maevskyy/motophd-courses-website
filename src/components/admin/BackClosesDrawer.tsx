'use client';

import { useModal } from '@payloadcms/ui';
import { type ReactNode, useEffect, useRef } from 'react';

/*
  «Назад» в браузере при открытой панели (выбор обложки, «+» у видео и
  любые другие drawer'ы Payload) закрывает панель, а не уходит со страницы.
  Панели открываются на весь экран и выглядят как отдельная страница, их
  закрывают свайпом «назад» — и теряли всё несохранённое в форме: Payload
  не спрашивает «сохранить?» при навигации кнопкой браузера.

  Как: на открытие панели кладём в историю запись с тем же адресом. «Назад»
  снимает её — ловим popstate раньше роутера Next (capture) и закрываем
  панели. Панель закрыли сами (крестик, Esc, выбор файла) — убираем нашу
  запись history.back(), и этот popstate роутеру тоже не отдаём.
*/
const MARK = 'motophdDrawer';

export function BackClosesDrawer({ children }: { children?: ReactNode }) {
  const { closeAllModals, oneModalIsOpen } = useModal();
  const pushed = useRef(false);
  const ignoreNextPop = useRef(false);

  useEffect(() => {
    const onPopState = (event: PopStateEvent) => {
      if (ignoreNextPop.current) {
        ignoreNextPop.current = false;
        event.stopImmediatePropagation();
        return;
      }

      if (pushed.current) {
        pushed.current = false;
        event.stopImmediatePropagation();
        closeAllModals();
      }
    };

    window.addEventListener('popstate', onPopState, true);

    return () => window.removeEventListener('popstate', onPopState, true);
  }, [closeAllModals]);

  useEffect(() => {
    if (oneModalIsOpen && !pushed.current) {
      // Копия состояния роутера Next: запись для него неотличима от текущей.
      window.history.pushState({ ...window.history.state, [MARK]: true }, '');
      pushed.current = true;
    } else if (!oneModalIsOpen && pushed.current) {
      pushed.current = false;

      if (window.history.state?.[MARK]) {
        ignoreNextPop.current = true;
        window.history.back();
      }
    }
  }, [oneModalIsOpen]);

  return children;
}

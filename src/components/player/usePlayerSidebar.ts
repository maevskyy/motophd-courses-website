'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// На этой ширине и уже оглавление — drawer поверх урока (см. CoursePlayer.module.scss).
export const NARROW_QUERY = '(max-width: 1024px)';

// Состояние оглавления плеера. На десктопе колонка открыта всегда: сворачивать
// её незачем, а три одинаковые кнопки «назад» в одном экране путали. На узких
// экранах вместо колонки — drawer: закрывается по Escape, по клику вне
// (backdrop) и при смене урока, фокус возвращается на кнопку «Оглавление»
// (паттерн — меню в layout/Nav).
export const usePlayerSidebar = (activeOrder: number) => {
  const [narrow, setNarrow] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const previousOrder = useRef(activeOrder);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') {
      return;
    }

    const query = window.matchMedia(NARROW_QUERY);
    const update = () => setNarrow(query.matches);

    update();
    query.addEventListener('change', update);

    return () => query.removeEventListener('change', update);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    toggleRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!drawerOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeDrawer();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => document.removeEventListener('keydown', onKeyDown);
  }, [closeDrawer, drawerOpen]);

  useEffect(() => {
    if (previousOrder.current === activeOrder) {
      return;
    }

    previousOrder.current = activeOrder;

    if (drawerOpen) {
      closeDrawer();
    }
  }, [activeOrder, closeDrawer, drawerOpen]);

  const toggleDrawer = () => setDrawerOpen((open) => !open);

  return { closeDrawer, drawerOpen, narrow, toggleDrawer, toggleRef };
};

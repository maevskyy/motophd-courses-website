'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export const SIDEBAR_STORAGE_KEY = 'motophd:player:sidebar';
// На этой ширине и уже оглавление — drawer поверх урока (см. CoursePlayer.module.scss).
export const NARROW_QUERY = '(max-width: 1024px)';

type SidebarState = 'open' | 'collapsed';

// Хранилище может бросить (приватный режим, запрет cookies) — тогда
// состояние живёт до перезагрузки.
const readCollapsed = () => {
  try {
    return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'collapsed';
  } catch {
    return false;
  }
};

const writeState = (state: SidebarState) => {
  try {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, state);
  } catch {
    // См. readCollapsed.
  }
};

// Состояние оглавления плеера. Свёрнутость читаем из localStorage после
// монтирования, чтобы разметка совпала с серверной. На узких экранах вместо
// колонки — drawer: закрывается по Escape, по клику вне (backdrop) и при смене
// урока, фокус возвращается на кнопку «Оглавление» (паттерн — меню в layout/Nav).
export const usePlayerSidebar = (activeOrder: number) => {
  const [collapsed, setCollapsed] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const previousOrder = useRef(activeOrder);

  useEffect(() => {
    setCollapsed(readCollapsed());
  }, []);

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

  const toggleCollapsed = () => {
    const next = !collapsed;

    writeState(next ? 'collapsed' : 'open');
    setCollapsed(next);
  };

  const toggleDrawer = () => setDrawerOpen((open) => !open);

  return { closeDrawer, collapsed, drawerOpen, narrow, toggleCollapsed, toggleDrawer, toggleRef };
};

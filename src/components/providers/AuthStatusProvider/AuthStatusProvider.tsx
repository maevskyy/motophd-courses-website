'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

// Маркетинговые страницы статичны (ISR) и не могут читать куки на сервере,
// поэтому статус логина добирается клиентским запросом к Payload.
const AuthStatusContext = createContext(false);

interface Props {
  children: React.ReactNode;
  initialLoggedIn?: boolean;
}

export function AuthStatusProvider({ children, initialLoggedIn }: Props) {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(initialLoggedIn ?? false);

  // Перепроверка на каждой смене пути: логин через server action — мягкая
  // навигация внутри того же layout, ремаунта провайдера не происходит.
  useEffect(() => {
    if (initialLoggedIn !== undefined) {
      return;
    }

    const controller = new AbortController();

    fetch('/api/users/me', { credentials: 'same-origin', signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((body) => {
        setIsLoggedIn(Boolean(body?.user));
      })
      .catch(() => {});

    return () => controller.abort();
  }, [initialLoggedIn, pathname]);

  return <AuthStatusContext.Provider value={isLoggedIn}>{children}</AuthStatusContext.Provider>;
}

export const useAuthStatus = () => useContext(AuthStatusContext);

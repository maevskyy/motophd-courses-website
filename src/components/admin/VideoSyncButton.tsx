'use client';

import { Button, useConfig, useTranslation } from '@payloadcms/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const copy = {
  en: {
    button: 'Sync from Stream',
    failed: 'Sync failed',
    hint: 'Adds videos uploaded outside the admin (Cloudflare dashboard, scripts) and refreshes statuses.',
    result: (created: number, missing: number, total: number) =>
      `In Stream: ${total}. New here: ${created}. Gone from Stream: ${missing}.`
  },
  ru: {
    button: 'Подтянуть из Stream',
    failed: 'Не удалось подтянуть',
    hint: 'Добавит в список видео, залитые мимо админки (дашборд Cloudflare, скрипты), и обновит статусы.',
    result: (created: number, missing: number, total: number) =>
      `В Stream: ${total}. Добавлено в список: ${created}. Пропало из Stream: ${missing}.`
  }
};

export function VideoSyncButton() {
  const { i18n } = useTranslation();
  const words = i18n.language === 'ru' ? copy.ru : copy.en;
  const {
    config: {
      routes: { api },
      serverURL
    }
  } = useConfig();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const sync = async () => {
    setBusy(true);
    setMessage(null);

    try {
      const response = await fetch(`${serverURL}${api}/videos/sync`, {
        credentials: 'include',
        method: 'POST'
      });
      const body = (await response.json()) as {
        created?: number;
        errors?: { message?: string }[];
        missing?: number;
        total?: number;
      };

      if (!response.ok) {
        throw new Error(body.errors?.[0]?.message || String(response.status));
      }

      setMessage(words.result(body.created ?? 0, body.missing ?? 0, body.total ?? 0));
      router.refresh();
    } catch (error) {
      setMessage(`${words.failed}: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <Button buttonStyle="secondary" disabled={busy} onClick={() => void sync()} size="small">
        {words.button}
      </Button>
      <p style={{ color: 'var(--theme-elevation-500)', margin: '4px 0 0' }}>
        {message || words.hint}
      </p>
    </div>
  );
}

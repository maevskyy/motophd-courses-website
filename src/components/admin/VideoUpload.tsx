'use client';

import {
  Button,
  useConfig,
  useDocumentInfo,
  useField,
  useForm,
  useTranslation
} from '@payloadcms/ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Upload } from 'tus-js-client';

import { uidFromUploadUrl } from '@/lib/video/uploadUrl';

// Кусок кратен 256 КиБ (требование Stream); 50 МБ — как в scripts/stream-upload.mjs.
const CHUNK_SIZE = 50 * 1024 * 1024;
const POLL_MS = 15_000;

const copy = {
  en: {
    cancel: 'Cancel',
    choose: 'Choose a video file',
    done: 'Uploaded. Saving…',
    failed: 'Upload failed',
    hint: 'Large files are uploaded in parts: if the connection drops, choose the same file again and the upload continues where it stopped. Do not close the page until it finishes.',
    leave: 'The video is still uploading. Leave the page?',
    processing:
      'Stream is processing the video, usually a few minutes. The status updates by itself.',
    ready: 'Ready: the video can be picked in a lesson.',
    refresh: 'Refresh status',
    retry: 'Try again',
    uploading: 'Uploading'
  },
  ru: {
    cancel: 'Отменить',
    choose: 'Выбрать видеофайл',
    done: 'Загружено. Сохраняю…',
    failed: 'Загрузка не удалась',
    hint: 'Большие файлы грузятся кусками: если связь оборвалась, выберите тот же файл ещё раз — загрузка продолжится с того же места. Не закрывайте страницу до конца загрузки.',
    leave: 'Видео ещё загружается. Уйти со страницы?',
    processing: 'Stream обрабатывает видео, обычно несколько минут. Статус обновится сам.',
    ready: 'Готово: видео можно выбрать в уроке.',
    refresh: 'Обновить статус',
    retry: 'Попробовать ещё раз',
    uploading: 'Загружается'
  }
};

const megabytes = (bytes: number) => `${Math.round(bytes / 1048576)} MB`;

const errorMessage = (error: unknown) => {
  const response = (error as { originalResponse?: { getBody?: () => string } }).originalResponse;
  const body = response?.getBody?.();

  try {
    return (JSON.parse(body || '') as { errors?: { message?: string }[] }).errors?.[0]?.message;
  } catch {
    return error instanceof Error ? error.message : String(error);
  }
};

type Progress = { sent: number; total: number };

export function VideoUpload() {
  const { i18n } = useTranslation();
  const words = i18n.language === 'ru' ? copy.ru : copy.en;
  const {
    config: {
      routes: { api },
      serverURL
    }
  } = useConfig();
  const { id } = useDocumentInfo();
  const { submit } = useForm();
  const title = useField<string>({ path: 'title' });
  const streamUid = useField<string>({ path: 'streamUid' });
  const status = useField<string>({ path: 'status' });
  const durationSec = useField<number>({ path: 'durationSec' });
  const isProtected = useField<boolean>({ path: 'protected' });
  const uploadRef = useRef<Upload | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const apiUrl = `${serverURL}${api}`;

  // Сохраняем, когда uid уже попал в состояние формы: иначе required-проверка
  // streamUid увидит пустое поле.
  useEffect(() => {
    if (saving && streamUid.value) {
      void submit({ overrides: { status: 'processing', streamUid: streamUid.value } });
      setSaving(false);
    }
  }, [saving, streamUid.value, submit]);

  useEffect(() => {
    if (!progress) {
      return;
    }

    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = words.leave;
    };

    window.addEventListener('beforeunload', warn);

    return () => window.removeEventListener('beforeunload', warn);
  }, [progress, words.leave]);

  const refresh = useCallback(async () => {
    if (!id) {
      return;
    }

    setRefreshing(true);
    setError(null);

    try {
      const response = await fetch(`${apiUrl}/videos/${id}/refresh`, {
        credentials: 'include',
        method: 'POST'
      });
      const body = (await response.json()) as {
        doc?: { durationSec?: number | null; protected?: boolean | null; status?: string | null };
        errors?: { message?: string }[];
      };

      if (!response.ok || !body.doc) {
        throw new Error(body.errors?.[0]?.message || String(response.status));
      }

      // Значения уже сохранены на сервере: форму не помечаем изменённой.
      status.setValue(body.doc.status, true);
      durationSec.setValue(body.doc.durationSec, true);
      isProtected.setValue(body.doc.protected, true);
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : String(refreshError));
    } finally {
      setRefreshing(false);
    }
    // setValue у useField стабилен между рендерами, сами объекты — нет.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiUrl, id]);

  const inProgress = status.value === 'uploading' || status.value === 'processing';

  useEffect(() => {
    if (!id || !inProgress) {
      return;
    }

    const timer = window.setInterval(() => void refresh(), POLL_MS);

    return () => window.clearInterval(timer);
  }, [id, inProgress, refresh]);

  const start = async (file: File) => {
    const name = title.value?.trim() || file.name.replace(/\.[^.]+$/, '');

    title.setValue(name);
    setError(null);
    setProgress({ sent: 0, total: file.size });

    const upload = new Upload(file, {
      chunkSize: CHUNK_SIZE,
      endpoint: `${apiUrl}/videos/upload`,
      metadata: { filename: file.name, filetype: file.type, name },
      onError: (uploadError) => {
        uploadRef.current = null;
        setProgress(null);
        setError(errorMessage(uploadError) || words.failed);
      },
      onProgress: (sent, total) => setProgress({ sent, total }),
      onSuccess: () => {
        const uid = uidFromUploadUrl(upload.url);

        uploadRef.current = null;
        setProgress(null);

        if (!uid) {
          setError(words.failed);
          return;
        }

        streamUid.setValue(uid);
        status.setValue('processing');
        setSaving(true);
      },
      removeFingerprintOnSuccess: true,
      retryDelays: [0, 3000, 10000, 30000, 60000]
    });

    uploadRef.current = upload;

    // Тот же файл после обрыва — докачка с места остановки.
    const previous = await upload.findPreviousUploads();

    if (previous[0]) {
      upload.resumeFromPreviousUpload(previous[0]);
    }

    upload.start();
  };

  const cancel = () => {
    void uploadRef.current?.abort();
    uploadRef.current = null;
    setProgress(null);
  };

  if (id) {
    return (
      <div className="field-type" style={{ marginBottom: 24 }}>
        <p>
          {status.value === 'ready' ? words.ready : null}
          {inProgress ? words.processing : null}
        </p>
        <Button
          buttonStyle="secondary"
          disabled={refreshing}
          onClick={() => void refresh()}
          size="small"
        >
          {words.refresh}
        </Button>
        {error ? <p style={{ color: 'var(--theme-error-500)' }}>{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="field-type" style={{ marginBottom: 24 }}>
      {progress ? (
        <>
          <p>
            {words.uploading}: {Math.floor((progress.sent / Math.max(progress.total, 1)) * 100)}% ·{' '}
            {megabytes(progress.sent)} / {megabytes(progress.total)}
          </p>
          <progress max={progress.total} style={{ width: '100%' }} value={progress.sent} />
          <Button buttonStyle="secondary" onClick={cancel} size="small">
            {words.cancel}
          </Button>
        </>
      ) : saving || streamUid.value ? (
        <p>{words.done}</p>
      ) : (
        <>
          <label className="btn btn--style-primary btn--size-medium" style={{ cursor: 'pointer' }}>
            {error ? words.retry : words.choose}
            <input
              accept="video/*"
              hidden
              onChange={(event) => {
                const file = event.target.files?.[0];

                event.target.value = '';

                if (file) {
                  void start(file);
                }
              }}
              type="file"
            />
          </label>
          <p style={{ color: 'var(--theme-elevation-500)' }}>{words.hint}</p>
        </>
      )}
      {error ? (
        <p style={{ color: 'var(--theme-error-500)' }}>
          {words.failed}: {error}
        </p>
      ) : null}
    </div>
  );
}

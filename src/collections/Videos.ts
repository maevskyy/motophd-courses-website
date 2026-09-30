import { APIError, type CollectionConfig, type Payload, type PayloadRequest } from 'payload';

import { locales } from '@/i18n/locales';
import { isAdminUser } from '@/lib/access/hasPaidAccess';
import {
  createStreamUpload,
  deleteStreamVideo,
  getStreamVideo,
  isStreamApiConfigured,
  listStreamVideos,
  type StreamVideo
} from '@/lib/video/streamApi';

/*
  Библиотека видео из Cloudflare Stream. Раньше видео заливали в дашборде
  Cloudflare, руками включали защиту и копировали 32-символьный ID в урок:
  забыли защиту — видео смотрят бесплатно, перепутали ID — у урока чужое видео.

  Теперь файл грузится отсюда: сервер создаёт в Stream загрузку уже с защитой,
  браузер шлёт файл кусками напрямую в Stream, ID записывается сам. Удаление
  здесь удаляет и в Stream. Урок выбирает видео из этого списка (lessons.video).
*/

// Stream принимает до 30 ГБ на файл.
const MAX_UPLOAD_BYTES = 30 * 1024 ** 3;

const forbidden = () => Response.json({ errors: [{ message: 'Forbidden' }] }, { status: 403 });

const errorResponse = (error: unknown, status = 502) =>
  Response.json(
    { errors: [{ message: error instanceof Error ? error.message : String(error) }] },
    { status }
  );

// tus Upload-Metadata: «ключ base64,ключ base64». Берём имя, которое браузер
// предлагает для видео в Stream.
export const readUploadName = (metadata: string | null) => {
  const pairs = new Map(
    (metadata || '')
      .split(',')
      .map((pair) => pair.trim().split(' '))
      .filter(([key]) => key)
      .map(([key, value]) => [key, value ? Buffer.from(value, 'base64').toString('utf8') : ''])
  );

  return (pairs.get('name') || pairs.get('filename') || 'video').slice(0, 200);
};

const toVideoFields = (video: StreamVideo) => ({
  durationSec: video.durationSec,
  protected: video.protected,
  status: video.status
});

// Уроки, где стоит видео, на любом языке: у каждого языка своё видео.
export const findLessonsUsingVideo = async (
  payload: Payload,
  videoId: number | string,
  req?: PayloadRequest
) => {
  const found = new Map<number, string>();

  for (const locale of locales) {
    const lessons = await payload.find({
      collection: 'lessons',
      depth: 0,
      fallbackLocale: false,
      limit: 100,
      locale,
      overrideAccess: true,
      pagination: false,
      req,
      where: { video: { equals: videoId } }
    });

    for (const lesson of lessons.docs) {
      found.set(lesson.id, `№${lesson.order ?? '?'} «${lesson.title || lesson.id}» (${locale})`);
    }
  }

  return [...found.entries()].map(([id, label]) => ({ id, label }));
};

export const Videos: CollectionConfig = {
  slug: 'videos',
  labels: {
    singular: {
      en: 'Video',
      ru: 'Видео'
    },
    plural: {
      en: 'Videos',
      ru: 'Видео'
    }
  },
  admin: {
    components: {
      beforeListTable: ['/components/admin/VideoSyncButton#VideoSyncButton']
    },
    defaultColumns: ['title', 'status', 'durationSec', 'protected', 'createdAt'],
    listSearchableFields: ['title', 'streamUid'],
    useAsTitle: 'title'
  },
  defaultSort: '-createdAt',
  access: {
    create: ({ req: { user } }) => isAdminUser(user),
    delete: ({ req: { user } }) => isAdminUser(user),
    read: ({ req: { user } }) => isAdminUser(user),
    update: ({ req: { user } }) => isAdminUser(user)
  },
  hooks: {
    beforeDelete: [
      async ({ id, req }) => {
        const lessons = await findLessonsUsingVideo(req.payload, id, req);

        if (lessons.length > 0) {
          throw new APIError(
            `Видео стоит в уроках: ${lessons.map((lesson) => lesson.label).join(', ')}. ` +
              'Сначала уберите или замените его в этих уроках.',
            400,
            undefined,
            true
          );
        }
      }
    ],
    // Внутри транзакции удаления: Stream не удалил — запись тоже остаётся,
    // и видео не повиснет в Stream невидимым для админки.
    afterDelete: [
      async ({ doc, req }) => {
        if (!doc.streamUid) {
          return;
        }

        if (!isStreamApiConfigured()) {
          req.payload.logger.warn(
            `Stream не настроен: видео ${doc.streamUid} удалено только из админки`
          );
          return;
        }

        await deleteStreamVideo(doc.streamUid);
      }
    ]
  },
  endpoints: [
    // tus creation для загрузчика в админке (tus-js-client шлёт сюда POST с
    // Upload-Length). В ответ — Location одноразовой ссылки Stream: файл идёт
    // из браузера прямо туда, наш сервер его не видит.
    {
      handler: async (req) => {
        if (!isAdminUser(req.user)) {
          return forbidden();
        }

        const size = Number(req.headers.get('upload-length'));

        if (!Number.isInteger(size) || size <= 0 || size > MAX_UPLOAD_BYTES) {
          return Response.json(
            { errors: [{ message: 'Upload-Length: нужен размер файла до 30 ГБ' }] },
            { status: 400 }
          );
        }

        try {
          const { uid, uploadUrl } = await createStreamUpload({
            name: readUploadName(req.headers.get('upload-metadata')),
            size
          });

          return new Response(null, {
            headers: {
              'Access-Control-Expose-Headers': 'Location, Stream-Media-Id',
              Location: uploadUrl,
              'Stream-Media-Id': uid,
              'Tus-Resumable': '1.0.0'
            },
            status: 201
          });
        } catch (error) {
          return errorResponse(error);
        }
      },
      method: 'post',
      path: '/upload'
    },
    // Статус из Stream: после загрузки видео несколько минут перекодируется.
    {
      handler: async (req) => {
        if (!isAdminUser(req.user)) {
          return forbidden();
        }

        const id = req.routeParams?.id;

        if (typeof id !== 'string' && typeof id !== 'number') {
          return Response.json({ errors: [{ message: 'Not found' }] }, { status: 404 });
        }

        try {
          const doc = await req.payload.findByID({ collection: 'videos', depth: 0, id, req });
          const video = await getStreamVideo(doc.streamUid);
          const updated = await req.payload.update({
            collection: 'videos',
            data: video ? toVideoFields(video) : { status: 'missing' },
            depth: 0,
            id: doc.id,
            req
          });

          return Response.json({ doc: updated });
        } catch (error) {
          return errorResponse(error);
        }
      },
      method: 'post',
      path: '/:id/refresh'
    },
    // «Подтянуть из Stream»: всё, что лежит в Stream, появляется в списке
    // (залитое в дашборде или скриптом), у известных — свежий статус. Чего в
    // Stream больше нет — помечается «нет в Stream».
    {
      handler: async (req) => {
        if (!isAdminUser(req.user)) {
          return forbidden();
        }

        try {
          const streamVideos = await listStreamVideos();
          const existing = await req.payload.find({
            collection: 'videos',
            depth: 0,
            limit: 0,
            pagination: false,
            req
          });
          const byUid = new Map(existing.docs.map((doc) => [doc.streamUid, doc]));
          const inStream = new Set(streamVideos.map((video) => video.uid));
          let created = 0;
          let missing = 0;

          for (const video of streamVideos) {
            const doc = byUid.get(video.uid);

            if (doc) {
              await req.payload.update({
                collection: 'videos',
                data: toVideoFields(video),
                depth: 0,
                id: doc.id,
                req
              });
            } else {
              await req.payload.create({
                collection: 'videos',
                data: {
                  streamUid: video.uid,
                  title: video.name || video.uid,
                  ...toVideoFields(video)
                },
                depth: 0,
                req
              });
              created += 1;
            }
          }

          for (const doc of existing.docs) {
            if (!inStream.has(doc.streamUid) && doc.status !== 'missing') {
              await req.payload.update({
                collection: 'videos',
                data: { status: 'missing' },
                depth: 0,
                id: doc.id,
                req
              });
              missing += 1;
            }
          }

          return Response.json({ created, missing, total: streamVideos.length });
        } catch (error) {
          return errorResponse(error);
        }
      },
      method: 'post',
      path: '/sync'
    }
  ],
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: {
        en: 'Title',
        ru: 'Название'
      },
      admin: {
        description: {
          en: 'How the video is listed here, e.g. «lean · lesson 03 · RU». Students do not see it.',
          ru: 'Как видео называется в этом списке, например «lean · урок 03 · RU». Ученики его не видят.'
        }
      }
    },
    {
      name: 'upload',
      type: 'ui',
      admin: {
        components: {
          Field: '/components/admin/VideoUpload#VideoUpload'
        }
      }
    },
    {
      name: 'streamUid',
      type: 'text',
      index: true,
      required: true,
      unique: true,
      label: {
        en: 'Stream ID',
        ru: 'ID в Stream'
      },
      admin: {
        readOnly: true,
        description: {
          en: 'Filled in automatically after the upload.',
          ru: 'Заполняется сам после загрузки.'
        }
      }
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'uploading',
      options: [
        { label: { en: 'Uploading', ru: 'Загружается' }, value: 'uploading' },
        { label: { en: 'Processing', ru: 'Обрабатывается' }, value: 'processing' },
        { label: { en: 'Ready', ru: 'Готово' }, value: 'ready' },
        { label: { en: 'Error', ru: 'Ошибка' }, value: 'error' },
        { label: { en: 'Not in Stream', ru: 'Нет в Stream' }, value: 'missing' }
      ],
      label: {
        en: 'Status',
        ru: 'Статус'
      },
      admin: {
        readOnly: true
      }
    },
    {
      name: 'durationSec',
      type: 'number',
      label: {
        en: 'Duration, sec',
        ru: 'Длительность, сек'
      },
      admin: {
        readOnly: true
      }
    },
    {
      name: 'protected',
      type: 'checkbox',
      defaultValue: true,
      label: {
        en: 'Protected (buyers only)',
        ru: 'Защищено (только для купивших)'
      },
      admin: {
        readOnly: true
      }
    },
    {
      name: 'usage',
      type: 'ui',
      admin: {
        components: {
          Field: '/components/admin/VideoUsage#VideoUsage'
        }
      }
    }
  ]
};

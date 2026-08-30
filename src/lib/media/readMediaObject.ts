import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';

import { getR2StorageConfig, isR2StorageEnabled } from './r2';

const localMediaDirectory = path.resolve(process.cwd(), 'media');

const getSafeFilename = (filename: string) => {
  const safeFilename = path.basename(filename);

  // path.basename('..') === '..', поэтому явно отсекаем обход каталогов.
  if (!safeFilename || safeFilename !== filename || safeFilename === '.' || safeFilename === '..') {
    throw new Error('Invalid media filename');
  }

  return safeFilename;
};

const toWebStream = (body: Readable) => Readable.toWeb(body) as ReadableStream<Uint8Array>;

// Один клиент на процесс: каждый new S3Client поднимает собственный пул
// сокетов с keep-alive, а destroy() никто не звал — на VPS это утечка.
let cachedClient: S3Client | null = null;

const getClient = () => {
  cachedClient = cachedClient || new S3Client(getR2StorageConfig());

  return cachedClient;
};

export const readMediaObject = async (filename: string): Promise<ReadableStream<Uint8Array>> => {
  const safeFilename = getSafeFilename(filename);

  if (!isR2StorageEnabled()) {
    const localPath = path.join(localMediaDirectory, safeFilename);

    // createReadStream не бросает синхронно: без этой проверки отсутствующий
    // файл уходил клиенту как 200 с оборванным телом.
    await stat(localPath);

    return toWebStream(createReadStream(localPath));
  }

  const response = await getClient().send(
    new GetObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: safeFilename
    })
  );

  if (!response.Body) {
    throw new Error('Media object has no body');
  }

  return response.Body.transformToWebStream();
};

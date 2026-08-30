import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';

import { getR2StorageConfig, isR2StorageEnabled } from './r2';

const localMediaDirectory = path.resolve(process.cwd(), 'media');

const getSafeFilename = (filename: string) => {
  const safeFilename = path.basename(filename);

  if (!safeFilename || safeFilename !== filename) {
    throw new Error('Invalid media filename');
  }

  return safeFilename;
};

const toWebStream = (body: Readable) => Readable.toWeb(body) as ReadableStream<Uint8Array>;

export const readMediaObject = async (filename: string): Promise<ReadableStream<Uint8Array>> => {
  const safeFilename = getSafeFilename(filename);

  if (!isR2StorageEnabled()) {
    return toWebStream(createReadStream(path.join(localMediaDirectory, safeFilename)));
  }

  const client = new S3Client(getR2StorageConfig());
  const response = await client.send(
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

import type { S3ClientConfig } from '@aws-sdk/client-s3';

const hasValue = (value: string | undefined) => Boolean(value?.trim());

export const isR2StorageEnabled = () =>
  hasValue(process.env.R2_ACCESS_KEY_ID) &&
  hasValue(process.env.R2_SECRET_ACCESS_KEY) &&
  hasValue(process.env.R2_BUCKET);

export const getR2StorageConfig = (): S3ClientConfig => ({
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || ''
  },
  endpoint: process.env.R2_ENDPOINT || '',
  forcePathStyle: true,
  region: 'auto',
  requestChecksumCalculation: 'WHEN_REQUIRED'
});

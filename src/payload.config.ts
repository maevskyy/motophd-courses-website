import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { buildConfig, type SharpDependency } from 'payload';
import sharp from 'sharp';

import { Courses } from './collections/Courses';
import { LegalPages } from './collections/LegalPages';
import { Lessons } from './collections/Lessons';
import { Media } from './collections/Media';
import { Purchases } from './collections/Purchases';
import { Users } from './collections/Users';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    importMap: {
      baseDir: path.resolve(dirname, 'app/(payload)'),
      importMapFile: path.resolve(dirname, 'app/(payload)/admin/importMap.js')
    },
    user: Users.slug
  },
  collections: [Users, Media, Courses, Lessons, LegalPages, Purchases],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI
    }
  }),
  editor: lexicalEditor(),
  localization: {
    defaultLocale: 'en',
    fallback: true,
    locales: ['en', 'ru']
  },
  secret: process.env.PAYLOAD_SECRET || '',
  sharp: sharp as unknown as SharpDependency,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts')
  }
});

import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."_locales" ADD VALUE 'uk';
  ALTER TYPE "public"."enum_purchases_locale" ADD VALUE 'uk';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media_locales" ALTER COLUMN "_locale" SET DATA TYPE text;
  ALTER TABLE "courses_outcomes" ALTER COLUMN "_locale" SET DATA TYPE text;
  ALTER TABLE "courses_locales" ALTER COLUMN "_locale" SET DATA TYPE text;
  ALTER TABLE "lessons_locales" ALTER COLUMN "_locale" SET DATA TYPE text;
  ALTER TABLE "legal_pages_locales" ALTER COLUMN "_locale" SET DATA TYPE text;
  DROP TYPE "public"."_locales";
  CREATE TYPE "public"."_locales" AS ENUM('en', 'ru');
  ALTER TABLE "media_locales" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "courses_outcomes" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "courses_locales" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "lessons_locales" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "legal_pages_locales" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "purchases" ALTER COLUMN "locale" SET DATA TYPE text;
  ALTER TABLE "purchases" ALTER COLUMN "locale" SET DEFAULT 'en'::text;
  DROP TYPE "public"."enum_purchases_locale";
  CREATE TYPE "public"."enum_purchases_locale" AS ENUM('en', 'ru');
  ALTER TABLE "purchases" ALTER COLUMN "locale" SET DEFAULT 'en'::"public"."enum_purchases_locale";
  ALTER TABLE "purchases" ALTER COLUMN "locale" SET DATA TYPE "public"."enum_purchases_locale" USING "locale"::"public"."enum_purchases_locale";`)
}

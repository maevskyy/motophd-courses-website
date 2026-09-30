import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "courses" DROP COLUMN "currency";
  ALTER TABLE "courses_locales" DROP COLUMN "key_point";
  ALTER TABLE "courses_locales" DROP COLUMN "common_mistakes";
  ALTER TABLE "courses_locales" DROP COLUMN "what_you_should_feel";
  ALTER TABLE "courses_locales" DROP COLUMN "teaser_video_id";
  ALTER TABLE "purchases" DROP COLUMN "locale";
  DROP TYPE "public"."enum_courses_currency";
  DROP TYPE "public"."enum_purchases_locale";`);

  // Длительность урока теперь только для чтения и берётся из видео: заменяем
  // то, что вписывали руками, длительностью из Stream. Видео у каждого языка
  // своё, а длительность у урока одна — берём английское, если оно есть.
  await db.execute(sql`
  UPDATE "lessons" l
  SET "duration_sec" = src."duration_sec"
  FROM (
    SELECT DISTINCT ON (ll."_parent_id") ll."_parent_id", v."duration_sec"
    FROM "lessons_locales" ll
    JOIN "videos" v ON v."id" = ll."video_id"
    WHERE v."duration_sec" IS NOT NULL
    ORDER BY ll."_parent_id", (ll."_locale" = 'en') DESC
  ) src
  WHERE src."_parent_id" = l."id";`);
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_courses_currency" AS ENUM('EUR');
  CREATE TYPE "public"."enum_purchases_locale" AS ENUM('en', 'ru', 'uk');
  ALTER TABLE "courses" ADD COLUMN "currency" "enum_courses_currency" DEFAULT 'EUR' NOT NULL;
  ALTER TABLE "courses_locales" ADD COLUMN "key_point" varchar;
  ALTER TABLE "courses_locales" ADD COLUMN "common_mistakes" varchar;
  ALTER TABLE "courses_locales" ADD COLUMN "what_you_should_feel" varchar;
  ALTER TABLE "courses_locales" ADD COLUMN "teaser_video_id" varchar;
  ALTER TABLE "purchases" ADD COLUMN "locale" "enum_purchases_locale" DEFAULT 'en' NOT NULL;`);
}

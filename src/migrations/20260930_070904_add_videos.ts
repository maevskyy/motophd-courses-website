import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_videos_status" AS ENUM('uploading', 'processing', 'ready', 'error', 'missing');
  CREATE TABLE "videos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"stream_uid" varchar NOT NULL,
  	"status" "enum_videos_status" DEFAULT 'uploading',
  	"duration_sec" numeric,
  	"protected" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "lessons_locales" ADD COLUMN "video_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "videos_id" integer;
  CREATE UNIQUE INDEX "videos_stream_uid_idx" ON "videos" USING btree ("stream_uid");
  CREATE INDEX "videos_updated_at_idx" ON "videos" USING btree ("updated_at");
  CREATE INDEX "videos_created_at_idx" ON "videos" USING btree ("created_at");
  ALTER TABLE "lessons_locales" ADD CONSTRAINT "lessons_locales_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_videos_fk" FOREIGN KEY ("videos_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "lessons_video_idx" ON "lessons_locales" USING btree ("video_id","_locale");
  CREATE INDEX "payload_locked_documents_rels_videos_id_idx" ON "payload_locked_documents_rels" USING btree ("videos_id");`);

  // Видео, чьи ID уже вставлены в уроки руками, становятся записями раздела
  // «Видео», а уроки на них ссылаются: после миграции у каждого урока с
  // видео заполнено поле «Видео». Статус «готово» — предположение; кнопка
  // «Подтянуть из Stream» сверит его и подтянет остальное из Stream.
  await db.execute(sql`
   INSERT INTO "videos" ("title", "stream_uid", "status", "protected")
  SELECT DISTINCT ON (ll."stream_video_id")
    concat_ws(' · ', c."slug", 'урок ' || lpad(l."order"::text, 2, '0'), upper(ll."_locale"::text)),
    ll."stream_video_id",
    'ready',
    true
  FROM "lessons_locales" ll
  JOIN "lessons" l ON l."id" = ll."_parent_id"
  JOIN "courses" c ON c."id" = l."course_id"
  WHERE ll."stream_video_id" IS NOT NULL AND ll."stream_video_id" <> ''
  ORDER BY ll."stream_video_id", l."id", ll."_locale";
  UPDATE "lessons_locales" ll SET "video_id" = v."id"
  FROM "videos" v
  WHERE v."stream_uid" = ll."stream_video_id";`);
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "videos" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "videos" CASCADE;
  ALTER TABLE "lessons_locales" DROP CONSTRAINT "lessons_locales_video_id_videos_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_videos_fk";
  
  DROP INDEX "lessons_video_idx";
  DROP INDEX "payload_locked_documents_rels_videos_id_idx";
  ALTER TABLE "lessons_locales" DROP COLUMN "video_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "videos_id";
  DROP TYPE "public"."enum_videos_status";`);
}

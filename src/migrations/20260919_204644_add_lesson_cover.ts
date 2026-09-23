import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "lessons_locales" ADD COLUMN "cover_id" integer;
  ALTER TABLE "lessons_locales" ADD CONSTRAINT "lessons_locales_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "lessons_cover_idx" ON "lessons_locales" USING btree ("cover_id","_locale");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "lessons_locales" DROP CONSTRAINT "lessons_locales_cover_id_media_id_fk";
  
  DROP INDEX "lessons_cover_idx";
  ALTER TABLE "lessons_locales" DROP COLUMN "cover_id";`)
}

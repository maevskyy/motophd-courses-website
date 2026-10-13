import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "courses_locales" ADD COLUMN "teaser_id" integer;
  ALTER TABLE "courses_locales" ADD CONSTRAINT "courses_locales_teaser_id_videos_id_fk" FOREIGN KEY ("teaser_id") REFERENCES "public"."videos"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "courses_teaser_idx" ON "courses_locales" USING btree ("teaser_id","_locale");`);
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "courses_locales" DROP CONSTRAINT "courses_locales_teaser_id_videos_id_fk";
  
  DROP INDEX "courses_teaser_idx";
  ALTER TABLE "courses_locales" DROP COLUMN "teaser_id";`);
}

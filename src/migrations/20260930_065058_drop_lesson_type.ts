import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "lessons" DROP COLUMN "type";
  DROP TYPE "public"."enum_lessons_type";`);
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_lessons_type" AS ENUM('video', 'pdf', 'text');
  ALTER TABLE "lessons" ADD COLUMN "type" "enum_lessons_type" DEFAULT 'video' NOT NULL;`);
}

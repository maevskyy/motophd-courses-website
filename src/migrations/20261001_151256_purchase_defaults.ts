import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "purchases" ALTER COLUMN "amount" SET DEFAULT 0;
  ALTER TABLE "purchases" ALTER COLUMN "status" SET DEFAULT 'paid';`);
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "purchases" ALTER COLUMN "status" SET DEFAULT 'pending';
  ALTER TABLE "purchases" ALTER COLUMN "amount" DROP DEFAULT;`);
}

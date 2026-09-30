import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_promo_codes_tiers" AS ENUM('standard', 'feedback', 'feedback_upgrade');
  CREATE TABLE "promo_codes_tiers" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_promo_codes_tiers",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "promo_codes_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"courses_id" integer
  );
  
  ALTER TABLE "promo_codes_tiers" ADD CONSTRAINT "promo_codes_tiers_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."promo_codes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "promo_codes_rels" ADD CONSTRAINT "promo_codes_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."promo_codes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "promo_codes_rels" ADD CONSTRAINT "promo_codes_rels_courses_fk" FOREIGN KEY ("courses_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "promo_codes_tiers_order_idx" ON "promo_codes_tiers" USING btree ("order");
  CREATE INDEX "promo_codes_tiers_parent_idx" ON "promo_codes_tiers" USING btree ("parent_id");
  CREATE INDEX "promo_codes_rels_order_idx" ON "promo_codes_rels" USING btree ("order");
  CREATE INDEX "promo_codes_rels_parent_idx" ON "promo_codes_rels" USING btree ("parent_id");
  CREATE INDEX "promo_codes_rels_path_idx" ON "promo_codes_rels" USING btree ("path");
  CREATE INDEX "promo_codes_rels_courses_id_idx" ON "promo_codes_rels" USING btree ("courses_id");`);
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "promo_codes_tiers" CASCADE;
  DROP TABLE "promo_codes_rels" CASCADE;
  DROP TYPE "public"."enum_promo_codes_tiers";`);
}

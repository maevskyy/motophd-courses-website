import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_promo_codes_discount_type" AS ENUM('percent', 'fixed');
  CREATE TABLE "promo_codes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"code" varchar NOT NULL,
  	"discount_type" "enum_promo_codes_discount_type" NOT NULL,
  	"value" numeric NOT NULL,
  	"max_uses" numeric,
  	"used_count" numeric DEFAULT 0 NOT NULL,
  	"valid_from" timestamp(3) with time zone,
  	"valid_to" timestamp(3) with time zone,
  	"active" boolean DEFAULT true NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "purchases" ADD COLUMN "order_reference" varchar;
  ALTER TABLE "purchases" ADD COLUMN "promo_code_id" integer;
  ALTER TABLE "purchases" ADD COLUMN "paid_at" timestamp(3) with time zone;
  ALTER TABLE "purchases" ADD COLUMN "provider_payload" jsonb;
  ALTER TABLE "purchases" ADD COLUMN "post_payment_token" varchar;
  ALTER TABLE "purchases" ADD COLUMN "post_payment_token_expires_at" timestamp(3) with time zone;
  ALTER TABLE "purchases" ADD COLUMN "post_payment_token_used_at" timestamp(3) with time zone;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "promo_codes_id" integer;
  CREATE UNIQUE INDEX "promo_codes_code_idx" ON "promo_codes" USING btree ("code");
  CREATE INDEX "promo_codes_updated_at_idx" ON "promo_codes" USING btree ("updated_at");
  CREATE INDEX "promo_codes_created_at_idx" ON "promo_codes" USING btree ("created_at");
  ALTER TABLE "purchases" ADD CONSTRAINT "purchases_promo_code_id_promo_codes_id_fk" FOREIGN KEY ("promo_code_id") REFERENCES "public"."promo_codes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_promo_codes_fk" FOREIGN KEY ("promo_codes_id") REFERENCES "public"."promo_codes"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "purchases_order_reference_idx" ON "purchases" USING btree ("order_reference");
  CREATE INDEX "purchases_promo_code_idx" ON "purchases" USING btree ("promo_code_id");
  CREATE INDEX "purchases_post_payment_token_idx" ON "purchases" USING btree ("post_payment_token");
  CREATE INDEX "payload_locked_documents_rels_promo_codes_id_idx" ON "payload_locked_documents_rels" USING btree ("promo_codes_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "promo_codes" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "promo_codes" CASCADE;
  ALTER TABLE "purchases" DROP CONSTRAINT "purchases_promo_code_id_promo_codes_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_promo_codes_fk";
  
  DROP INDEX "purchases_order_reference_idx";
  DROP INDEX "purchases_promo_code_idx";
  DROP INDEX "purchases_post_payment_token_idx";
  DROP INDEX "payload_locked_documents_rels_promo_codes_id_idx";
  ALTER TABLE "purchases" DROP COLUMN "order_reference";
  ALTER TABLE "purchases" DROP COLUMN "promo_code_id";
  ALTER TABLE "purchases" DROP COLUMN "paid_at";
  ALTER TABLE "purchases" DROP COLUMN "provider_payload";
  ALTER TABLE "purchases" DROP COLUMN "post_payment_token";
  ALTER TABLE "purchases" DROP COLUMN "post_payment_token_expires_at";
  ALTER TABLE "purchases" DROP COLUMN "post_payment_token_used_at";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "promo_codes_id";
  DROP TYPE "public"."enum_promo_codes_discount_type";`)
}

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "auto_faq" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "faqs_algo" JSONB;

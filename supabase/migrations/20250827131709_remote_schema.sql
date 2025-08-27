drop extension if exists "pg_net";

drop trigger if exists "update_reviews_updated_at" on "public"."reviews";

drop policy "Reviewers can manage checklist items" on "public"."review_checklist_items";

drop policy "Users can view checklist items for accessible reviews" on "public"."review_checklist_items";

drop policy "Reviewers can create reviews" on "public"."reviews";

drop policy "Reviewers can update their own reviews" on "public"."reviews";

drop policy "Users can view reviews for accessible projects" on "public"."reviews";

drop function if exists "public"."update_reviews_updated_at"();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();



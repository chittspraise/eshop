CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();


create policy "app-images 1rugihw_0"
on "storage"."objects"
as permissive
for select
to authenticated
using ((bucket_id = 'app-images'::text));


create policy "app-images 1rugihw_1"
on "storage"."objects"
as permissive
for insert
to authenticated
with check ((bucket_id = 'app-images'::text));


create policy "app-images 1rugihw_2"
on "storage"."objects"
as permissive
for update
to authenticated
using ((bucket_id = 'app-images'::text));


create policy "app-images 1rugihw_3"
on "storage"."objects"
as permissive
for delete
to authenticated
using ((bucket_id = 'app-images'::text));




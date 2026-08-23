from supabase import create_client, Client
from app.core.config import settings

# service_role client — bypasses RLS by design. Server-side only.
supabase_admin: Client = create_client(settings.supabase_url, settings.supabase_service_role_key)

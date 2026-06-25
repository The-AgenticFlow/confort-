"""Supabase database client initialization."""

import os
from supabase import create_client


def get_supabase_client():
    """Create and return Supabase client using service role key."""
    url = os.getenv("SUPABASE_URL")
    service_key = os.getenv("SUPABASE_SERVICE_KEY")

    if not url or not service_key:
        raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set")

    return create_client(url, service_key)

import os
from supabase import create_client, Client
from django.conf import settings

def get_supabase_client() -> Client:
    """Get Supabase client instance"""
    url = settings.SUPABASE_URL
    key = settings.SUPABASE_KEY
    
    if not url or not key:
        raise ValueError("Supabase credentials not configured")
    
    return create_client(url, key)

def get_supabase_service_client() -> Client:
    """Get Supabase service client (admin privileges)"""
    url = settings.SUPABASE_URL
    key = settings.SUPABASE_SERVICE_KEY
    
    if not url or not key:
        raise ValueError("Supabase service credentials not configured")
    
    return create_client(url, key)

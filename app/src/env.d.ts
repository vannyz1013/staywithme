/// <reference types="vite/client" />

// Injected by vite.config.mjs from app/src/config/supabase.json.
// Both are empty strings when that file does not exist.
declare const __SUPABASE_URL__: string;
declare const __SUPABASE_ANON_KEY__: string;

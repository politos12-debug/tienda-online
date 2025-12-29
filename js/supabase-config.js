// Configuración de Supabase
// Usar variables de entorno en Vercel, fallback a valores de desarrollo
const SUPABASE_URL = 'https://tvzvuotqdtwmssxfnyqc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_-XIdhOUa5OOaLbF45xNgzg_72CYzEw3';

// Esperar a que Supabase esté disponible
function initSupabase() {
    if (typeof supabase === 'undefined') {
        setTimeout(initSupabase, 100);
        return;
    }
    
    // Crear cliente de Supabase
    window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

// Iniciar cuando esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSupabase);
} else {
    initSupabase();
}

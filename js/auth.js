// Autenticación - Versión Simplificada
console.log('=== AUTH.JS CARGADO ===');
let supabase = null;
let currentUser = null;
let userRole = null;

// Funciones globales del modal
window.openLoginModal = function() {
    console.log('openLoginModal llamada!');
    const modal = document.getElementById('login-modal');
    console.log('Modal encontrado:', !!modal);
    if (modal) {
        modal.style.display = 'flex';
        console.log('Modal visible ahora');
    }
};

window.closeLoginModal = function() {
    console.log('closeLoginModal llamada!');
    const modal = document.getElementById('login-modal');
    if (modal) modal.style.display = 'none';
    const form = document.getElementById('login-form');
    if (form) form.reset();
};

window.logout = async function() {
    if (supabase) {
        await supabase.auth.signOut();
    }
    currentUser = null;
    userRole = null;
    window.location.href = '/';
};

// Inicializar
function init() {
    // Esperar Supabase
    if (!window.supabaseClient) {
        setTimeout(init, 100);
        return;
    }
    
    supabase = window.supabaseClient;
    
    // Formulario login
    const form = document.getElementById('login-form');
    if (form) {
        form.addEventListener('submit', handleLogin);
    }
    
    // Cerrar modal al clickear afuera
    const modal = document.getElementById('login-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) window.closeLoginModal();
        });
    }
    
    // Verificar sesión
    checkSession();
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const btn = this.querySelector('button[type="submit"]');
    
    btn.disabled = true;
    btn.textContent = 'Cargando...';
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        
        if (error) throw error;
        
        currentUser = data.user;
        
        // Obtener rol
        const { data: role } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', currentUser.id)
            .single();
        
        userRole = role?.role;
        
        if (userRole === 'admin') {
            window.location.href = '/admin.html';
        } else {
            window.closeLoginModal();
            updateAuthUI();
        }
    } catch (error) {
        alert('Error: ' + error.message);
    } finally {
        btn.disabled = false;
        btn.textContent = 'Iniciar Sesión';
    }
}

async function checkSession() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
            currentUser = session.user;
            const { data: role } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', currentUser.id)
                .single();
            userRole = role?.role;
        }
        
        updateAuthUI();
    } catch (error) {
        console.error('Error verificando sesión:', error);
    }
}

function updateAuthUI() {
    const authBtn = document.getElementById('auth-button');
    if (!authBtn) return;
    
    if (currentUser) {
        authBtn.innerHTML = `
            <div class="user-menu">
                <button id="user-info-btn" class="btn-usuario">👤 ${currentUser.email.split('@')[0]}</button>
                <div id="user-dropdown" class="user-dropdown" style="display:none;">
                    ${userRole === 'admin' ? '<a href="/admin.html">Panel Admin</a>' : ''}
                    <button onclick="window.logout()">Cerrar Sesión</button>
                </div>
            </div>
        `;
        
        document.getElementById('user-info-btn').addEventListener('click', function(e) {
            e.stopPropagation();
            const dd = document.getElementById('user-dropdown');
            dd.style.display = dd.style.display === 'none' ? 'block' : 'none';
        });
        
        document.addEventListener('click', function(e) {
            const dd = document.getElementById('user-dropdown');
            if (dd && !e.target.closest('.user-menu')) {
                dd.style.display = 'none';
            }
        });
    } else {
        authBtn.innerHTML = `<button onclick="window.openLoginModal()" class="btn-login">Iniciar Sesión</button>`;
    }
}

// Iniciar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

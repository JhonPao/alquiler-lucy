// =====================================================
// auth.js — Autenticación y protección de rutas
// Maneja login con Firebase Auth y redirige al panel
// =====================================================

import { auth } from './firebase-config.js';
import {
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// ── Detectar en qué página estamos ──
const isLoginPage = window.location.pathname.includes('login.html');
const isAdminPage = window.location.pathname.includes('adminlucy.html');

// ══════════════════════════════════════════════════════
// OBSERVADOR DE ESTADO DE AUTENTICACIÓN
// ══════════════════════════════════════════════════════
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Usuario autenticado
        if (isLoginPage) {
            // Si ya está logueado y está en login, redirigir al panel
            window.location.href = 'adminlucy.html';
        }
        if (isAdminPage) {
            // Mostrar el contenido protegido del panel
            mostrarPanelAdmin(user);
        }
    } else {
        // No autenticado
        if (isAdminPage) {
            // Si intenta acceder al panel sin login, redirigir
            window.location.href = 'login.html';
        }
        if (isLoginPage) {
            // Mostrar formulario de login
            ocultarCargaInicial();
        }
    }
});

// ══════════════════════════════════════════════════════
// LÓGICA DE LOGIN (login.html)
// ══════════════════════════════════════════════════════
if (isLoginPage) {
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const loginError = document.getElementById('loginError');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('loginPassword');

    // Toggle mostrar/ocultar contraseña
    if (togglePassword) {
        togglePassword.addEventListener('click', () => {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            togglePassword.innerHTML = isPassword
                ? '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>'
                : '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>';
        });
    }

    // Submit del formulario
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;

            if (!email || !password) {
                mostrarError('Por favor, complete todos los campos.');
                return;
            }

            // Estado de carga
            loginBtn.classList.add('loading');
            loginBtn.disabled = true;
            ocultarError();

            try {
                await signInWithEmailAndPassword(auth, email, password);
                // onAuthStateChanged se encargará de redirigir
            } catch (error) {
                console.error('Error de login:', error.code);
                const mensajeError = traducirErrorFirebase(error.code);
                mostrarError(mensajeError);
                loginBtn.classList.remove('loading');
                loginBtn.disabled = false;
            }
        });
    }

    function mostrarError(mensaje) {
        if (loginError) {
            loginError.textContent = mensaje;
            loginError.classList.add('visible');
        }
    }

    function ocultarError() {
        if (loginError) {
            loginError.classList.remove('visible');
        }
    }
}

// ══════════════════════════════════════════════════════
// LÓGICA DE PANEL ADMIN (adminlucy.html)
// ══════════════════════════════════════════════════════
function mostrarPanelAdmin(user) {
    // Mostrar el contenido del panel
    const adminContent = document.getElementById('adminContent');
    if (adminContent) {
        adminContent.style.display = 'block';
    }

    // Ocultar pantalla de carga
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
    }

    // Mostrar datos del usuario en el sidebar
    const userEmail = document.getElementById('userEmail');
    if (userEmail) {
        userEmail.textContent = user.email;
    }

    const userName = document.getElementById('userName');
    if (userName) {
        userName.textContent = user.displayName || 'Administrador';
    }
}

function ocultarCargaInicial() {
    // Para login.html — nada especial, el form ya es visible
}

// ══════════════════════════════════════════════════════
// CERRAR SESIÓN (disponible globalmente)
// ══════════════════════════════════════════════════════
export async function cerrarSesion() {
    try {
        await signOut(auth);
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        alert('Error al cerrar sesión. Intente de nuevo.');
    }
}

// Hacer la función accesible globalmente (para onclick en HTML)
window.cerrarSesion = cerrarSesion;

// ══════════════════════════════════════════════════════
// TRADUCCIÓN DE ERRORES DE FIREBASE
// ══════════════════════════════════════════════════════
function traducirErrorFirebase(codigoError) {
    const errores = {
        'auth/invalid-email': 'El correo electrónico no es válido.',
        'auth/user-disabled': 'Esta cuenta ha sido deshabilitada.',
        'auth/user-not-found': 'No existe una cuenta con ese correo.',
        'auth/wrong-password': 'La contraseña es incorrecta.',
        'auth/invalid-credential': 'Credenciales inválidas. Verifique su correo y contraseña.',
        'auth/too-many-requests': 'Demasiados intentos fallidos. Espere unos minutos.',
        'auth/network-request-failed': 'Error de conexión. Verifique su internet.',
        'auth/internal-error': 'Error interno del servidor. Intente más tarde.'
    };
    return errores[codigoError] || 'Error inesperado. Intente de nuevo.';
}

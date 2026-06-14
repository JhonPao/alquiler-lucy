// =====================================================
// firebase-config.js — Configuración e inicialización de Firebase
// SDK Modular v10 (importado desde CDN)
// =====================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Configuración del proyecto Firebase — Gestor de Vestimentas Lucy
const firebaseConfig = {
    apiKey: "AIzaSyBhtb5MiY8j7dFFboeAmNt5nMKxTNXYOuA",
    authDomain: "gestordevestimentas.firebaseapp.com",
    projectId: "gestordevestimentas",
    storageBucket: "gestordevestimentas.firebasestorage.app",
    messagingSenderId: "481657693752",
    appId: "1:481657693752:web:e3f401e52d734ed9a8e8cd",
    measurementId: "G-YRQCW98F5F"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar servicios para uso en otros módulos
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export default app;

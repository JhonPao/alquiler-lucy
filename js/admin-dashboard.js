// =====================================================
// admin-dashboard.js — Dashboard y Reportes Mensuales
// Calcula métricas del mes actual y alimenta las
// stat cards y la tabla resumen del dashboard.
// =====================================================

import { db } from './firebase-config.js';
import {
    collection, getDocs, query, where, orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ── Referencias del DOM ──
const statTotalVestimentas = document.getElementById('statTotalVestimentas');
const statAlquileresMes = document.getElementById('statAlquileresMes');
const statPendientes = document.getElementById('statPendientes');
const statDevueltos = document.getElementById('statDevueltos');
const dashboardTableBody = document.getElementById('dashboardTableBody');

// ══════════════════════════════════════════════════════
// INICIALIZACIÓN
// ══════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    // Pequeño delay para que Firebase se inicialice
    setTimeout(() => {
        cargarDashboard();
    }, 500);
});

// ══════════════════════════════════════════════════════
// CARGAR DASHBOARD COMPLETO
// ══════════════════════════════════════════════════════
async function cargarDashboard() {
    try {
        // Cargar vestimentas y alquileres en paralelo
        const [vestimentas, alquileres] = await Promise.all([
            cargarVestimentasCount(),
            cargarAlquileresMes()
        ]);

        // Calcular métricas
        const totalVestimentas = vestimentas.length;
        const mesActual = getMesAnioActual();

        const alquileresMes = alquileres.filter(a => a.mes_anio_registro === mesActual);
        const pendientes = alquileres.filter(a => a.estado === 'Alquilado');
        const devueltosMes = alquileresMes.filter(a => a.estado === 'Devuelto');

        // Actualizar stat cards con animación de conteo
        animarContador(statTotalVestimentas, totalVestimentas);
        animarContador(statAlquileresMes, alquileresMes.length);
        animarContador(statPendientes, pendientes.length);
        animarContador(statDevueltos, devueltosMes.length);

        // Renderizar tabla resumen (últimos 5 alquileres)
        renderTablaResumen(alquileres.slice(0, 5));

    } catch (error) {
        console.error('Error al cargar dashboard:', error);
        cargarDashboardDemo();
    }
}

// ══════════════════════════════════════════════════════
// CARGAR DATOS
// ══════════════════════════════════════════════════════
async function cargarVestimentasCount() {
    const vestimentasRef = collection(db, 'vestimentas');
    const q = query(vestimentasRef, where('activo', '==', true));
    const snapshot = await getDocs(q);

    const lista = [];
    snapshot.forEach(docSnap => {
        lista.push({ id: docSnap.id, ...docSnap.data() });
    });
    return lista;
}

async function cargarAlquileresMes() {
    const alquileresRef = collection(db, 'alquileres');
    const q = query(alquileresRef, orderBy('fecha_creacion', 'desc'));
    const snapshot = await getDocs(q);

    const lista = [];
    snapshot.forEach(docSnap => {
        lista.push({ id: docSnap.id, ...docSnap.data() });
    });
    return lista;
}

// ══════════════════════════════════════════════════════
// TABLA RESUMEN (Dashboard)
// ══════════════════════════════════════════════════════
function renderTablaResumen(alquileres) {
    if (alquileres.length === 0) {
        dashboardTableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center; color: var(--text-muted); padding: 40px;">
                    No hay alquileres registrados aún.
                </td>
            </tr>`;
        return;
    }

    dashboardTableBody.innerHTML = alquileres.map(alquiler => {
        const cliente = alquiler.cliente || {};
        const prenda = alquiler.detalle_prendas?.[0] || {};
        const fechas = alquiler.fechas || {};

        const nombreCompleto = `${cliente.nombres || ''} ${cliente.apellidos || ''}`.trim() || 'Sin datos';
        const fechaInicio = formatearFecha(fechas.inicio);

        const estadoClass = {
            'Alquilado': 'alquilado',
            'Devuelto': 'devuelto',
            'Cancelado': 'cancelado'
        }[alquiler.estado] || 'alquilado';

        const estadoEmoji = {
            'Alquilado': '',
            'Devuelto': '',
            'Cancelado': ''
        }[alquiler.estado] || '';

        return `
            <tr>
                <td style="color: var(--text-primary); font-weight: 500;">${nombreCompleto}</td>
                <td>${prenda.nombre || '—'}</td>
                <td>${prenda.talla || '—'}</td>
                <td>${fechaInicio}</td>
                <td><span class="status-badge ${estadoClass}">${estadoEmoji} ${alquiler.estado}</span></td>
            </tr>
        `;
    }).join('');
}

// ══════════════════════════════════════════════════════
// DATOS DEMO DEL DASHBOARD
// ══════════════════════════════════════════════════════
function cargarDashboardDemo() {
    animarContador(statTotalVestimentas, 5);
    animarContador(statAlquileresMes, 3);
    animarContador(statPendientes, 2);
    animarContador(statDevueltos, 1);

    const hoy = new Date();
    const hace2Dias = new Date(hoy); hace2Dias.setDate(hoy.getDate() - 2);

    const demo = [
        {
            cliente: { nombres: 'María', apellidos: 'García López' },
            detalle_prendas: [{ nombre: 'Traje de Marinera Norteña', talla: 'M' }],
            fechas: { inicio: hace2Dias },
            estado: 'Alquilado'
        },
        {
            cliente: { nombres: 'Carlos', apellidos: 'Pérez Ruiz' },
            detalle_prendas: [{ nombre: 'Traje de Huayno Cusqueño', talla: 'L' }],
            fechas: { inicio: hoy },
            estado: 'Devuelto'
        },
        {
            cliente: { nombres: 'Ana', apellidos: 'Torres Medina' },
            detalle_prendas: [{ nombre: 'Vestido de Festejo', talla: 'S' }],
            fechas: { inicio: hoy },
            estado: 'Alquilado'
        }
    ];

    renderTablaResumen(demo);
}

// ══════════════════════════════════════════════════════
// UTILIDADES
// ══════════════════════════════════════════════════════

// Animación de conteo para las stat cards
function animarContador(elemento, valorFinal, duracion = 800) {
    if (!elemento) return;

    const valorInicial = 0;
    const incremento = valorFinal / (duracion / 16);
    let valorActual = valorInicial;

    function step() {
        valorActual += incremento;
        if (valorActual >= valorFinal) {
            elemento.textContent = valorFinal;
            return;
        }
        elemento.textContent = Math.floor(valorActual);
        requestAnimationFrame(step);
    }

    if (valorFinal === 0) {
        elemento.textContent = '0';
        return;
    }

    requestAnimationFrame(step);
}

function getMesAnioActual() {
    const hoy = new Date();
    return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;
}

function formatearFecha(valor) {
    if (!valor) return '—';
    if (valor.toDate) {
        return valor.toDate().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    const date = new Date(valor);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

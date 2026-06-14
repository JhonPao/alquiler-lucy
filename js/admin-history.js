// =====================================================
// admin-history.js — Historial de Alquileres
// Lista contratos, permite ver detalles, cambiar estado
// y retorna stock al inventario al marcar "Devuelto".
// =====================================================

import { db } from './firebase-config.js';
import {
    collection, getDocs, doc, updateDoc, getDoc,
    increment, query, orderBy, serverTimestamp, Timestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ── Referencias del DOM ──
const tableBody = document.getElementById('historialTableBody');
const filtroEstado = document.getElementById('filtroEstadoHistorial');

// ── Estado ──
let alquileresList = [];

// ══════════════════════════════════════════════════════
// INICIALIZACIÓN
// ══════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    cargarHistorial();
    initFiltroEstado();
});

// ══════════════════════════════════════════════════════
// CARGAR HISTORIAL DESDE FIRESTORE
// ══════════════════════════════════════════════════════
export async function cargarHistorial() {
    try {
        const alquileresRef = collection(db, 'alquileres');
        const q = query(alquileresRef, orderBy('fecha_creacion', 'desc'));
        const snapshot = await getDocs(q);

        alquileresList = [];
        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            alquileresList.push({ id: docSnap.id, ...data });
        });

        renderHistorial(alquileresList);
    } catch (error) {
        console.error('Error al cargar historial:', error);
        // Datos demo
        alquileresList = getDatosDemo();
        renderHistorial(alquileresList);
    }
}

// ══════════════════════════════════════════════════════
// RENDERIZAR TABLA DE HISTORIAL
// ══════════════════════════════════════════════════════
function renderHistorial(lista) {
    // Aplicar filtro de estado
    const filtro = filtroEstado?.value || 'all';
    let filtrada = lista;
    if (filtro !== 'all') {
        filtrada = lista.filter(a => a.estado === filtro);
    }

    if (filtrada.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align:center; color: var(--text-muted); padding: 40px;">
                    ${filtro !== 'all' ? 'No hay alquileres con estado "' + filtro + '".' : 'No hay alquileres registrados.'}
                </td>
            </tr>`;
        return;
    }

    tableBody.innerHTML = filtrada.map(alquiler => {
        const cliente = alquiler.cliente || {};
        const prenda = alquiler.detalle_prendas?.[0] || {};
        const fechas = alquiler.fechas || {};

        const nombreCompleto = `${cliente.nombres || ''} ${cliente.apellidos || ''}`.trim() || 'Sin datos';
        const fechaInicio = formatearFecha(fechas.inicio);
        const fechaDevolucion = formatearFecha(fechas.devolucion_acordada);

        // Clases y label del estado
        const estadoClass = {
            'Alquilado': 'alquilado',
            'Devuelto': 'devuelto',
            'Cancelado': 'cancelado'
        }[alquiler.estado] || 'alquilado';

        const estadoEmoji = {
            'Alquilado': '⏳',
            'Devuelto': '✅',
            'Cancelado': '❌'
        }[alquiler.estado] || '❓';

        // Botones de acción según estado
        let acciones = '';
        if (alquiler.estado === 'Alquilado') {
            acciones = `
                <button class="btn btn-secondary btn-sm btn-devolver" data-id="${alquiler.id}" title="Marcar como devuelto"
                        style="border-color: rgba(39,174,96,0.3); color: #27AE60; font-size: 0.75rem;">
                    ✅ Devolver
                </button>
                <button class="btn btn-secondary btn-sm btn-cancelar-alquiler" data-id="${alquiler.id}" title="Cancelar alquiler"
                        style="border-color: rgba(239,68,68,0.2); font-size: 0.75rem;">
                    ❌
                </button>
            `;
        } else {
            acciones = `<span style="color: var(--text-muted); font-size: 0.8rem;">—</span>`;
        }

        return `
            <tr>
                <td style="color: var(--text-primary); font-weight: 500;">${nombreCompleto}</td>
                <td>${cliente.dni || '—'}</td>
                <td>${prenda.nombre || '—'}</td>
                <td>${prenda.talla || '—'}</td>
                <td>${prenda.cantidad || 1}</td>
                <td>${fechaInicio}</td>
                <td>${fechaDevolucion}</td>
                <td><span class="status-badge ${estadoClass}">${estadoEmoji} ${alquiler.estado}</span></td>
                <td>
                    <div style="display: flex; gap: 4px;">
                        ${acciones}
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    // Asignar eventos a botones
    tableBody.querySelectorAll('.btn-devolver').forEach(btn => {
        btn.addEventListener('click', () => marcarDevuelto(btn.dataset.id));
    });

    tableBody.querySelectorAll('.btn-cancelar-alquiler').forEach(btn => {
        btn.addEventListener('click', () => cancelarAlquiler(btn.dataset.id));
    });
}

// ══════════════════════════════════════════════════════
// FILTRO POR ESTADO
// ══════════════════════════════════════════════════════
function initFiltroEstado() {
    if (filtroEstado) {
        filtroEstado.addEventListener('change', () => {
            renderHistorial(alquileresList);
        });
    }
}

// ══════════════════════════════════════════════════════
// MARCAR COMO DEVUELTO — Retornar stock al inventario
// ══════════════════════════════════════════════════════
async function marcarDevuelto(alquilerId) {
    const alquiler = alquileresList.find(a => a.id === alquilerId);
    if (!alquiler) return;

    const prenda = alquiler.detalle_prendas?.[0];
    const cliente = alquiler.cliente || {};
    const nombreCliente = `${cliente.nombres || ''} ${cliente.apellidos || ''}`.trim();

    showConfirmDialog(
        '✅',
        '¿Marcar como devuelto?',
        `Se registrará la devolución de "${prenda?.nombre}" por ${nombreCliente} y se retornará el stock al inventario.`,
        async () => {
            try {
                // 1. Actualizar estado del alquiler
                const alquilerRef = doc(db, 'alquileres', alquilerId);
                await updateDoc(alquilerRef, {
                    estado: 'Devuelto',
                    'fechas.devolucion_real': new Date()
                });

                // 2. Retornar stock al inventario
                if (prenda && prenda.id_vestimenta) {
                    const vestimentaRef = doc(db, 'vestimentas', prenda.id_vestimenta);
                    const campoTalla = `tallas.${prenda.talla}`;
                    await updateDoc(vestimentaRef, {
                        [campoTalla]: increment(prenda.cantidad || 1)
                    });
                }

                showToast('✅ Alquiler marcado como devuelto. Stock actualizado.');
                await cargarHistorial();

            } catch (error) {
                console.error('Error al marcar devuelto:', error);
                showToast('❌ Error al actualizar. Revise la consola.');
            }
        }
    );
}

// ══════════════════════════════════════════════════════
// CANCELAR ALQUILER — Retornar stock al inventario
// ══════════════════════════════════════════════════════
async function cancelarAlquiler(alquilerId) {
    const alquiler = alquileresList.find(a => a.id === alquilerId);
    if (!alquiler) return;

    const prenda = alquiler.detalle_prendas?.[0];

    showConfirmDialog(
        '❌',
        '¿Cancelar este alquiler?',
        'Se cancelará el contrato y se retornará el stock al inventario. Esta acción no se puede deshacer.',
        async () => {
            try {
                // 1. Actualizar estado
                const alquilerRef = doc(db, 'alquileres', alquilerId);
                await updateDoc(alquilerRef, {
                    estado: 'Cancelado'
                });

                // 2. Retornar stock
                if (prenda && prenda.id_vestimenta) {
                    const vestimentaRef = doc(db, 'vestimentas', prenda.id_vestimenta);
                    const campoTalla = `tallas.${prenda.talla}`;
                    await updateDoc(vestimentaRef, {
                        [campoTalla]: increment(prenda.cantidad || 1)
                    });
                }

                showToast('❌ Alquiler cancelado. Stock retornado.');
                await cargarHistorial();

            } catch (error) {
                console.error('Error al cancelar alquiler:', error);
                showToast('❌ Error al cancelar. Revise la consola.');
            }
        }
    );
}

// ══════════════════════════════════════════════════════
// UTILIDADES
// ══════════════════════════════════════════════════════
function formatearFecha(valor) {
    if (!valor) return '—';
    // Firestore Timestamp
    if (valor.toDate) {
        return valor.toDate().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    // Date object o string
    const date = new Date(valor);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function showToast(message, duration = 4000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

function showConfirmDialog(icon, title, message, onConfirm) {
    const overlay = document.getElementById('confirmOverlay');
    document.getElementById('confirmIcon').textContent = icon;
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    overlay.classList.add('active');

    const cancelBtn = document.getElementById('confirmCancel');
    const acceptBtn = document.getElementById('confirmAccept');

    const newCancel = cancelBtn.cloneNode(true);
    const newAccept = acceptBtn.cloneNode(true);
    cancelBtn.replaceWith(newCancel);
    acceptBtn.replaceWith(newAccept);

    newCancel.addEventListener('click', () => overlay.classList.remove('active'));
    newAccept.addEventListener('click', async () => {
        overlay.classList.remove('active');
        await onConfirm();
    });
}

// ── Datos demo ──
function getDatosDemo() {
    const hoy = new Date();
    const hace3Dias = new Date(hoy); hace3Dias.setDate(hoy.getDate() - 3);
    const hace7Dias = new Date(hoy); hace7Dias.setDate(hoy.getDate() - 7);
    const enAdelante = new Date(hoy); enAdelante.setDate(hoy.getDate() + 2);

    return [
        {
            id: 'alq1',
            cliente: { nombres: 'María', apellidos: 'García López', dni: '12345678', telefono: '987654321', direccion: 'Lima' },
            fechas: { inicio: hace3Dias, devolucion_acordada: enAdelante, devolucion_real: null },
            detalle_prendas: [{ id_vestimenta: 'demo1', nombre: 'Traje de Marinera Norteña', talla: 'M', cantidad: 1 }],
            estado: 'Alquilado',
            mes_anio_registro: `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`
        },
        {
            id: 'alq2',
            cliente: { nombres: 'Carlos', apellidos: 'Pérez Ruiz', dni: '87654321', telefono: '912345678', direccion: 'Cusco' },
            fechas: { inicio: hace7Dias, devolucion_acordada: hace3Dias, devolucion_real: hace3Dias },
            detalle_prendas: [{ id_vestimenta: 'demo3', nombre: 'Traje de Huayno Cusqueño', talla: 'L', cantidad: 1 }],
            estado: 'Devuelto',
            mes_anio_registro: `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`
        },
        {
            id: 'alq3',
            cliente: { nombres: 'Ana', apellidos: 'Torres Medina', dni: '45678901', telefono: '945678901', direccion: 'Trujillo' },
            fechas: { inicio: hace3Dias, devolucion_acordada: enAdelante, devolucion_real: null },
            detalle_prendas: [{ id_vestimenta: 'demo2', nombre: 'Vestido de Festejo', talla: 'S', cantidad: 2 }],
            estado: 'Alquilado',
            mes_anio_registro: `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`
        }
    ];
}

// Exportar para el dashboard
export { alquileresList };

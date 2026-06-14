// =====================================================
// admin-rent.js — Módulo "Alquilar"
// Registra contratos de alquiler, descuenta stock
// y carga las vestimentas disponibles en el selector.
// =====================================================

import { db } from './firebase-config.js';
import {
    collection, getDocs, addDoc, doc, updateDoc, getDoc,
    increment, query, where, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ── Referencias del DOM ──
const formAlquiler = document.getElementById('formAlquiler');
const selectPrenda = document.getElementById('selectPrenda');
const selectTalla = document.getElementById('selectTalla');
const inputCantidad = document.getElementById('cantidad');
const btnRegistrar = document.getElementById('btnRegistrarAlquiler');

// ── Estado ──
let vestimentasDisponibles = [];
let prendaSeleccionada = null;

// ══════════════════════════════════════════════════════
// INICIALIZACIÓN
// ══════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    cargarVestimentasParaSelector();
    initSelectPrenda();
    initFormAlquiler();
    setFechasDefault();
});

// ══════════════════════════════════════════════════════
// CARGAR VESTIMENTAS EN EL SELECTOR
// ══════════════════════════════════════════════════════
async function cargarVestimentasParaSelector() {
    try {
        const vestimentasRef = collection(db, 'vestimentas');
        const q = query(vestimentasRef, where('activo', '==', true));
        const snapshot = await getDocs(q);

        vestimentasDisponibles = [];
        snapshot.forEach(docSnap => {
            vestimentasDisponibles.push({ id: docSnap.id, ...docSnap.data() });
        });
    } catch (error) {
        console.error('Error al cargar vestimentas para selector:', error);
        // Datos demo
        vestimentasDisponibles = [
            { id: 'demo1', nombre: 'Traje de Marinera Norteña', region: 'Costa', danza: 'Marinera Norteña', tallas: { S: 2, M: 3, L: 1, XL: 0 } },
            { id: 'demo2', nombre: 'Vestido de Festejo', region: 'Costa', danza: 'Festejo', tallas: { S: 1, M: 2, L: 2 } },
            { id: 'demo3', nombre: 'Traje de Huayno Cusqueño', region: 'Sierra', danza: 'Huayno', tallas: { M: 4, L: 3, XL: 1 } },
            { id: 'demo4', nombre: 'Traje de Diablada Puneña', region: 'Sierra', danza: 'Diablada', tallas: { M: 2, L: 1 } },
            { id: 'demo5', nombre: 'Traje de Buri Buriti', region: 'Selva', danza: 'Buri Buriti', tallas: { S: 3, M: 2, L: 1 } },
        ];
    }

    renderSelectorPrendas();
}

function renderSelectorPrendas() {
    selectPrenda.innerHTML = '<option value="">Seleccionar prenda...</option>';

    // Agrupar por región para facilitar la selección
    const regiones = { 'Costa': [], 'Sierra': [], 'Selva': [] };

    vestimentasDisponibles.forEach(v => {
        const stockTotal = Object.values(v.tallas || {}).reduce((s, c) => s + c, 0);
        if (stockTotal > 0) {
            const region = v.region || 'Otro';
            if (!regiones[region]) regiones[region] = [];
            regiones[region].push(v);
        }
    });

    Object.entries(regiones).forEach(([region, prendas]) => {
        if (prendas.length === 0) return;
        const emojis = { 'Costa': '🌊', 'Sierra': '⛰️', 'Selva': '🌿' };
        const optgroup = document.createElement('optgroup');
        optgroup.label = `${emojis[region] || '📍'} ${region}`;

        prendas.forEach(p => {
            const option = document.createElement('option');
            option.value = p.id;
            option.textContent = `${p.nombre} (${p.danza})`;
            optgroup.appendChild(option);
        });

        selectPrenda.appendChild(optgroup);
    });
}

// ══════════════════════════════════════════════════════
// INTERACCIÓN DEL SELECTOR DE PRENDA → TALLAS
// ══════════════════════════════════════════════════════
function initSelectPrenda() {
    selectPrenda.addEventListener('change', () => {
        const id = selectPrenda.value;
        prendaSeleccionada = vestimentasDisponibles.find(v => v.id === id) || null;

        selectTalla.innerHTML = '';
        selectTalla.disabled = true;
        inputCantidad.max = '';
        inputCantidad.value = 1;

        if (!prendaSeleccionada) {
            selectTalla.innerHTML = '<option value="">Seleccione prenda primero</option>';
            return;
        }

        // Poblar tallas con stock
        const tallasConStock = Object.entries(prendaSeleccionada.tallas || {})
            .filter(([, cant]) => cant > 0);

        if (tallasConStock.length === 0) {
            selectTalla.innerHTML = '<option value="">Sin stock disponible</option>';
            return;
        }

        selectTalla.disabled = false;
        selectTalla.innerHTML = '<option value="">Seleccionar talla...</option>';

        tallasConStock.forEach(([talla, cant]) => {
            const option = document.createElement('option');
            option.value = talla;
            option.textContent = `${talla} — ${cant} disponible${cant > 1 ? 's' : ''}`;
            option.dataset.stock = cant;
            selectTalla.appendChild(option);
        });
    });

    // Cuando cambia la talla, limitar cantidad máxima
    selectTalla.addEventListener('change', () => {
        const selectedOption = selectTalla.options[selectTalla.selectedIndex];
        const stockDisponible = parseInt(selectedOption?.dataset?.stock || '1', 10);
        inputCantidad.max = stockDisponible;
        inputCantidad.value = 1;
    });
}

// ══════════════════════════════════════════════════════
// FECHAS POR DEFECTO
// ══════════════════════════════════════════════════════
function setFechasDefault() {
    const hoy = new Date();
    const fechaInicioInput = document.getElementById('fechaInicio');
    const fechaDevolucionInput = document.getElementById('fechaDevolucion');

    // Fecha de inicio = hoy
    fechaInicioInput.value = formatDate(hoy);

    // Fecha de devolución = hoy + 3 días (por defecto)
    const devolucion = new Date(hoy);
    devolucion.setDate(devolucion.getDate() + 3);
    fechaDevolucionInput.value = formatDate(devolucion);

    // Validar que la devolución sea posterior al inicio
    fechaInicioInput.addEventListener('change', () => {
        fechaDevolucionInput.min = fechaInicioInput.value;
        if (fechaDevolucionInput.value < fechaInicioInput.value) {
            const nueva = new Date(fechaInicioInput.value);
            nueva.setDate(nueva.getDate() + 1);
            fechaDevolucionInput.value = formatDate(nueva);
        }
    });
}

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

// ══════════════════════════════════════════════════════
// REGISTRAR ALQUILER
// ══════════════════════════════════════════════════════
function initFormAlquiler() {
    formAlquiler.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validaciones
        if (!prendaSeleccionada) {
            showToast('⚠️ Seleccione una vestimenta');
            return;
        }

        const tallaSeleccionada = selectTalla.value;
        if (!tallaSeleccionada) {
            showToast('⚠️ Seleccione una talla');
            return;
        }

        const cantidadLlevar = parseInt(inputCantidad.value, 10);
        if (isNaN(cantidadLlevar) || cantidadLlevar < 1) {
            showToast('⚠️ La cantidad debe ser al menos 1');
            return;
        }

        // Verificar stock disponible
        const stockActual = prendaSeleccionada.tallas?.[tallaSeleccionada] || 0;
        if (cantidadLlevar > stockActual) {
            showToast(`⚠️ Solo hay ${stockActual} unidad(es) disponibles en talla ${tallaSeleccionada}`);
            return;
        }

        const dni = document.getElementById('clienteDni').value.trim();
        if (dni.length !== 8 || !/^\d{8}$/.test(dni)) {
            showToast('⚠️ El DNI debe tener exactamente 8 dígitos');
            return;
        }

        const fechaInicio = document.getElementById('fechaInicio').value;
        const fechaDevolucion = document.getElementById('fechaDevolucion').value;
        if (fechaDevolucion <= fechaInicio) {
            showToast('⚠️ La fecha de devolución debe ser posterior a la de inicio');
            return;
        }

        // Desactivar botón
        btnRegistrar.disabled = true;
        btnRegistrar.innerHTML = '⏳ Registrando...';

        try {
            // Recolectar datos del cliente
            const nombres = document.getElementById('clienteNombres').value.trim();
            const apellidos = document.getElementById('clienteApellidos').value.trim();
            const telefono = document.getElementById('clienteTelefono').value.trim();
            const direccion = document.getElementById('clienteDireccion').value.trim();

            // Construir el mes-año para reportes
            const fechaActual = new Date();
            const mesAnio = `${fechaActual.getFullYear()}-${String(fechaActual.getMonth() + 1).padStart(2, '0')}`;

            const nuevoAlquiler = {
                cliente: {
                    nombres,
                    apellidos,
                    dni,
                    telefono,
                    direccion
                },
                fechas: {
                    inicio: new Date(fechaInicio),
                    devolucion_acordada: new Date(fechaDevolucion),
                    devolucion_real: null
                },
                detalle_prendas: [
                    {
                        id_vestimenta: prendaSeleccionada.id,
                        nombre: prendaSeleccionada.nombre,
                        talla: tallaSeleccionada,
                        cantidad: cantidadLlevar
                    }
                ],
                estado: 'Alquilado',
                fecha_creacion: serverTimestamp(),
                mes_anio_registro: mesAnio
            };

            // Guardar en Firestore
            await addDoc(collection(db, 'alquileres'), nuevoAlquiler);

            // Descontar stock atómicamente
            const vestimentaRef = doc(db, 'vestimentas', prendaSeleccionada.id);
            const campoTalla = `tallas.${tallaSeleccionada}`;
            await updateDoc(vestimentaRef, {
                [campoTalla]: increment(-cantidadLlevar)
            });

            showToast('✅ Alquiler registrado correctamente');

            // Limpiar formulario y recargar selector
            formAlquiler.reset();
            setFechasDefault();
            selectTalla.innerHTML = '<option value="">Seleccione prenda primero</option>';
            selectTalla.disabled = true;
            prendaSeleccionada = null;
            await cargarVestimentasParaSelector();

        } catch (error) {
            console.error('Error al registrar alquiler:', error);
            showToast('❌ Error al registrar. Revise la consola.');
        } finally {
            btnRegistrar.disabled = false;
            btnRegistrar.innerHTML = '✅ Registrar Alquiler';
        }
    });
}

// ══════════════════════════════════════════════════════
// UTILIDADES
// ══════════════════════════════════════════════════════
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

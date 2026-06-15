// =====================================================
// admin-rent.js — Módulo "Alquilar"
// Muestra un catálogo de vestimentas disponibles con
// botón "Alquilar", y al presionar muestra el formulario.
// =====================================================

import { db } from './firebase-config.js';
import {
    collection, getDocs, addDoc, doc, updateDoc,
    increment, query, where, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ── Referencias del DOM ──
const rentCatalogView = document.getElementById('rentCatalogView');
const rentFormView = document.getElementById('rentFormView');
const rentCatalogGrid = document.getElementById('rentCatalogGrid');
const rentSelectedItem = document.getElementById('rentSelectedItem');
const searchRentCatalog = document.getElementById('searchRentCatalog');
const btnVolverCatalogo = document.getElementById('btnVolverCatalogo');
const btnCancelarAlquiler = document.getElementById('btnCancelarAlquiler');
const formAlquiler = document.getElementById('formAlquiler');
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
    cargarVestimentas();
    initEventListeners();
    setFechasDefault();
});

// ══════════════════════════════════════════════════════
// CARGAR VESTIMENTAS DESDE FIRESTORE
// ══════════════════════════════════════════════════════
async function cargarVestimentas() {
    try {
        const vestimentasRef = collection(db, 'vestimentas');
        const q = query(vestimentasRef, where('activo', '==', true));
        const snapshot = await getDocs(q);

        vestimentasDisponibles = [];
        snapshot.forEach(docSnap => {
            vestimentasDisponibles.push({ id: docSnap.id, ...docSnap.data() });
        });
    } catch (error) {
        console.error('Error al cargar vestimentas:', error);
        // Datos demo
        vestimentasDisponibles = [
            { id: 'demo1', nombre: 'Traje de Marinera Norteña', region: 'Costa', danza: 'Marinera Norteña', tallas: { S: 2, M: 3, L: 1, XL: 0 }, imagenUrl: '' },
            { id: 'demo2', nombre: 'Vestido de Festejo', region: 'Costa', danza: 'Festejo', tallas: { S: 1, M: 2, L: 2 }, imagenUrl: '' },
            { id: 'demo3', nombre: 'Traje de Huayno Cusqueño', region: 'Sierra', danza: 'Huayno', tallas: { M: 4, L: 3, XL: 1 }, imagenUrl: '' },
            { id: 'demo4', nombre: 'Traje de Diablada Puneña', region: 'Sierra', danza: 'Diablada', tallas: { M: 2, L: 1 }, imagenUrl: '' },
            { id: 'demo5', nombre: 'Traje de Buri Buriti', region: 'Selva', danza: 'Buri Buriti', tallas: { S: 3, M: 2, L: 1 }, imagenUrl: '' },
        ];
    }

    renderCatalogo();
}

// ══════════════════════════════════════════════════════
// RENDERIZAR GRID DE VESTIMENTAS
// ══════════════════════════════════════════════════════
function renderCatalogo(filtro = '') {
    const filtradas = vestimentasDisponibles.filter(v => {
        const stockTotal = Object.values(v.tallas || {}).reduce((s, c) => s + c, 0);
        if (stockTotal <= 0) return false;
        if (!filtro) return true;
        const texto = `${v.nombre} ${v.danza} ${v.region}`.toLowerCase();
        return texto.includes(filtro.toLowerCase());
    });

    if (filtradas.length === 0) {
        rentCatalogGrid.innerHTML = `
            <div style="text-align:center; color: var(--text-muted); padding: 60px 20px; grid-column: 1 / -1;">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom:12px;opacity:0.4;"><path d="m6 2 2 4h8l2-4"/><path d="M6 6v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6"/></svg>
                <p style="font-size:1rem;">No se encontraron vestimentas disponibles.</p>
            </div>`;
        return;
    }

    rentCatalogGrid.innerHTML = filtradas.map((v, i) => {
        const stockTotal = Object.values(v.tallas || {}).reduce((s, c) => s + c, 0);
        const tallasDisp = Object.entries(v.tallas || {})
            .filter(([, c]) => c > 0)
            .map(([t, c]) => `<span class="talla-chip available">${t} (${c})</span>`)
            .join('');

        const regionColors = {
            'Costa': '#4D5CD2',
            'Sierra': '#DB8517',
            'Selva': '#059F78'
        };
        const color = regionColors[v.region] || '#DB8517';

        const imgHtml = v.imagenUrl
            ? `<img src="${v.imagenUrl}" alt="${v.nombre}" style="width:100%;height:100%;object-fit:cover;">`
            : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg, ${color}15, ${color}08);">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.4;"><path d="m6 2 2 4h8l2-4"/><path d="M6 6v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6"/></svg>
               </div>`;

        return `
            <div class="rent-card" style="animation: fadeInUp 0.4s ease-out ${i * 0.06}s both;">
                <div class="rent-card-image">${imgHtml}</div>
                <div class="rent-card-body">
                    <div class="rent-card-region" style="color:${color};">
                        ${getRegionIcon(v.region)} ${v.region} · ${v.danza}
                    </div>
                    <h4 class="rent-card-name">${v.nombre}</h4>
                    <div class="rent-card-tallas">${tallasDisp}</div>
                    <div class="rent-card-footer">
                        <span class="rent-card-stock">${stockTotal} disponible${stockTotal > 1 ? 's' : ''}</span>
                        <button class="btn btn-primary btn-sm btn-alquilar-card" data-id="${v.id}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3"/><path d="m15 9 6-6"/></svg>
                            Alquilar
                        </button>
                    </div>
                </div>
            </div>`;
    }).join('');
}

// ══════════════════════════════════════════════════════
// SELECCIONAR VESTIMENTA → MOSTRAR FORMULARIO
// ══════════════════════════════════════════════════════
function seleccionarPrenda(id) {
    prendaSeleccionada = vestimentasDisponibles.find(v => v.id === id);
    if (!prendaSeleccionada) return;

    // Renderizar info de la prenda seleccionada
    const stockTotal = Object.values(prendaSeleccionada.tallas || {}).reduce((s, c) => s + c, 0);
    const regionColors = { 'Costa': '#4D5CD2', 'Sierra': '#DB8517', 'Selva': '#059F78' };
    const color = regionColors[prendaSeleccionada.region] || '#DB8517';

    const imgHtml = prendaSeleccionada.imagenUrl
        ? `<img src="${prendaSeleccionada.imagenUrl}" alt="${prendaSeleccionada.nombre}">`
        : `<div class="rent-selected-placeholder" style="background:linear-gradient(135deg, ${color}15, ${color}08);">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="m6 2 2 4h8l2-4"/><path d="M6 6v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6"/></svg>
           </div>`;

    rentSelectedItem.innerHTML = `
        <div class="rent-selected-card">
            <div class="rent-selected-image">${imgHtml}</div>
            <div class="rent-selected-info">
                <span class="rent-selected-region" style="color:${color};">${getRegionIcon(prendaSeleccionada.region)} ${prendaSeleccionada.region} · ${prendaSeleccionada.danza}</span>
                <h3>${prendaSeleccionada.nombre}</h3>
                <p>${stockTotal} unidad${stockTotal > 1 ? 'es' : ''} disponible${stockTotal > 1 ? 's' : ''}</p>
            </div>
        </div>`;

    // Poblar selector de tallas
    selectTalla.innerHTML = '<option value="">Seleccionar talla...</option>';
    const tallasConStock = Object.entries(prendaSeleccionada.tallas || {}).filter(([, c]) => c > 0);
    tallasConStock.forEach(([talla, cant]) => {
        const option = document.createElement('option');
        option.value = talla;
        option.textContent = `${talla} — ${cant} disponible${cant > 1 ? 's' : ''}`;
        option.dataset.stock = cant;
        selectTalla.appendChild(option);
    });

    inputCantidad.value = 1;
    inputCantidad.max = '';

    // Cambiar vista
    rentCatalogView.style.display = 'none';
    rentFormView.style.display = 'block';
    rentFormView.style.animation = 'fadeInUp 0.4s ease-out';

    // Re-inicializar iconos Lucide
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function volverAlCatalogo() {
    rentFormView.style.display = 'none';
    rentCatalogView.style.display = 'block';
    prendaSeleccionada = null;
    formAlquiler.reset();
    setFechasDefault();
}

// ══════════════════════════════════════════════════════
// EVENT LISTENERS
// ══════════════════════════════════════════════════════
function initEventListeners() {
    // Click en botón "Alquilar" de cada tarjeta
    rentCatalogGrid.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-alquilar-card');
        if (btn) {
            seleccionarPrenda(btn.dataset.id);
        }
    });

    // Botón volver
    btnVolverCatalogo.addEventListener('click', volverAlCatalogo);
    btnCancelarAlquiler.addEventListener('click', volverAlCatalogo);

    // Buscador
    searchRentCatalog.addEventListener('input', () => {
        renderCatalogo(searchRentCatalog.value);
    });

    // Cuando cambia la talla, limitar cantidad máxima
    selectTalla.addEventListener('change', () => {
        const selectedOption = selectTalla.options[selectTalla.selectedIndex];
        const stockDisponible = parseInt(selectedOption?.dataset?.stock || '1', 10);
        inputCantidad.max = stockDisponible;
        inputCantidad.value = 1;
    });

    // Submit del formulario
    formAlquiler.addEventListener('submit', registrarAlquiler);
}

// ══════════════════════════════════════════════════════
// FECHAS POR DEFECTO
// ══════════════════════════════════════════════════════
function setFechasDefault() {
    const hoy = new Date();
    const fechaInicioInput = document.getElementById('fechaInicio');
    const fechaDevolucionInput = document.getElementById('fechaDevolucion');

    fechaInicioInput.value = formatDate(hoy);

    const devolucion = new Date(hoy);
    devolucion.setDate(devolucion.getDate() + 3);
    fechaDevolucionInput.value = formatDate(devolucion);

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
async function registrarAlquiler(e) {
    e.preventDefault();

    if (!prendaSeleccionada) {
        showToast('Seleccione una vestimenta');
        return;
    }

    const tallaSeleccionada = selectTalla.value;
    if (!tallaSeleccionada) {
        showToast('Seleccione una talla');
        return;
    }

    const cantidadLlevar = parseInt(inputCantidad.value, 10);
    if (isNaN(cantidadLlevar) || cantidadLlevar < 1) {
        showToast('La cantidad debe ser al menos 1');
        return;
    }

    const stockActual = prendaSeleccionada.tallas?.[tallaSeleccionada] || 0;
    if (cantidadLlevar > stockActual) {
        showToast(`Solo hay ${stockActual} unidad(es) disponibles en talla ${tallaSeleccionada}`);
        return;
    }

    const dni = document.getElementById('clienteDni').value.trim();
    if (dni.length !== 8 || !/^\d{8}$/.test(dni)) {
        showToast('El DNI debe tener exactamente 8 dígitos');
        return;
    }

    const fechaInicio = document.getElementById('fechaInicio').value;
    const fechaDevolucion = document.getElementById('fechaDevolucion').value;
    if (fechaDevolucion <= fechaInicio) {
        showToast('La fecha de devolución debe ser posterior a la de inicio');
        return;
    }

    btnRegistrar.disabled = true;
    btnRegistrar.innerHTML = 'Registrando...';

    try {
        const nombres = document.getElementById('clienteNombres').value.trim();
        const apellidos = document.getElementById('clienteApellidos').value.trim();
        const telefono = document.getElementById('clienteTelefono').value.trim();
        const direccion = document.getElementById('clienteDireccion').value.trim();

        const fechaActual = new Date();
        const mesAnio = `${fechaActual.getFullYear()}-${String(fechaActual.getMonth() + 1).padStart(2, '0')}`;

        const nuevoAlquiler = {
            cliente: { nombres, apellidos, dni, telefono, direccion },
            fechas: {
                inicio: new Date(fechaInicio),
                devolucion_acordada: new Date(fechaDevolucion),
                devolucion_real: null
            },
            detalle_prendas: [{
                id_vestimenta: prendaSeleccionada.id,
                nombre: prendaSeleccionada.nombre,
                talla: tallaSeleccionada,
                cantidad: cantidadLlevar
            }],
            estado: 'Alquilado',
            fecha_creacion: serverTimestamp(),
            mes_anio_registro: mesAnio
        };

        await addDoc(collection(db, 'alquileres'), nuevoAlquiler);

        const vestimentaRef = doc(db, 'vestimentas', prendaSeleccionada.id);
        const campoTalla = `tallas.${tallaSeleccionada}`;
        await updateDoc(vestimentaRef, {
            [campoTalla]: increment(-cantidadLlevar)
        });

        showToast('Alquiler registrado correctamente');

        formAlquiler.reset();
        setFechasDefault();
        prendaSeleccionada = null;

        // Recargar catálogo y volver a la vista de tarjetas
        await cargarVestimentas();
        volverAlCatalogo();

    } catch (error) {
        console.error('Error al registrar alquiler:', error);
        showToast('Error al registrar. Revise la consola.');
    } finally {
        btnRegistrar.disabled = false;
        btnRegistrar.innerHTML = '<i data-lucide="check-circle" style="width:16px;height:16px;"></i> Registrar Alquiler';
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}

// ══════════════════════════════════════════════════════
// UTILIDADES
// ══════════════════════════════════════════════════════
function getRegionIcon(region) {
    const icons = {
        'Costa': '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>',
        'Sierra': '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>',
        'Selva': '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;"><path d="M10 10v.2A3 3 0 0 1 8.9 16H5a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0Z"/><path d="M7 16v6"/><path d="M13 19v3"/><path d="M16 14v.2A3 3 0 0 1 14.9 20H11a3 3 0 0 1-1-5.8V14a3 3 0 0 1 6 0Z"/></svg>'
    };
    return icons[region] || '';
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

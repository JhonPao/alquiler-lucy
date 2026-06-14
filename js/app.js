// =====================================================
// app.js — Lógica del Catálogo Público (index.html)
// Lee las vestimentas de Firestore, renderiza cards,
// maneja filtros, búsqueda y el flujo de WhatsApp.
// =====================================================

import { db } from './firebase-config.js';
import { collection, getDocs, query, where, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ── Constantes ──
const WHATSAPP_NUMBER = '51948291212';
const CATALOG_GRID = document.getElementById('catalogGrid');
const EMPTY_STATE = document.getElementById('emptyState');
const SEARCH_INPUT = document.getElementById('searchInput');
const FILTER_TABS = document.getElementById('filterTabs');
const MODAL_OVERLAY = document.getElementById('modalOverlay');

// ── Estado de la App ──
let vestimentas = [];
let filtroRegion = 'all';
let filtroBusqueda = '';

// ── Inicialización ──
document.addEventListener('DOMContentLoaded', () => {
    cargarVestimentas();
    initNavbar();
    initFilters();
    initSearch();
    initModal();
    initScrollTop();
});

// ══════════════════════════════════════════════════════
// CARGA DE DATOS DESDE FIRESTORE
// ══════════════════════════════════════════════════════
async function cargarVestimentas() {
    try {
        const vestimentasRef = collection(db, 'vestimentas');
        const q = query(vestimentasRef, where('activo', '==', true));
        const snapshot = await getDocs(q);

        vestimentas = [];
        snapshot.forEach(doc => {
            vestimentas.push({ id: doc.id, ...doc.data() });
        });

        renderCatalog();
    } catch (error) {
        console.error('Error al cargar vestimentas:', error);
        // Si no hay conexión a Firebase, mostrar datos de demostración
        cargarDatosDemo();
    }
}

// Datos de demostración (se usan si Firebase no está configurado)
function cargarDatosDemo() {
    vestimentas = [
        {
            id: 'demo1',
            nombre: 'Traje de Marinera Norteña',
            region: 'Costa',
            danza: 'Marinera Norteña',
            imagenUrl: '',
            tallas: { S: 2, M: 3, L: 1, XL: 0 },
            activo: true
        },
        {
            id: 'demo2',
            nombre: 'Vestido de Festejo',
            region: 'Costa',
            danza: 'Festejo',
            imagenUrl: '',
            tallas: { S: 1, M: 2, L: 2 },
            activo: true
        },
        {
            id: 'demo3',
            nombre: 'Traje de Huayno Cusqueño',
            region: 'Sierra',
            danza: 'Huayno',
            imagenUrl: '',
            tallas: { S: 0, M: 4, L: 3, XL: 1 },
            activo: true
        },
        {
            id: 'demo4',
            nombre: 'Traje de Diablada Puneña',
            region: 'Sierra',
            danza: 'Diablada',
            imagenUrl: '',
            tallas: { M: 2, L: 1 },
            activo: true
        },
        {
            id: 'demo5',
            nombre: 'Traje de Tijeras',
            region: 'Sierra',
            danza: 'Danza de Tijeras',
            imagenUrl: '',
            tallas: { S: 1, M: 3, L: 2, XL: 1 },
            activo: true
        },
        {
            id: 'demo6',
            nombre: 'Traje de Buri Buriti',
            region: 'Selva',
            danza: 'Buri Buriti',
            imagenUrl: '',
            tallas: { S: 3, M: 2, L: 1 },
            activo: true
        },
        {
            id: 'demo7',
            nombre: 'Vestido de Anaconda',
            region: 'Selva',
            danza: 'Danza de la Anaconda',
            imagenUrl: '',
            tallas: { S: 0, M: 1, L: 2, XL: 0 },
            activo: true
        },
        {
            id: 'demo8',
            nombre: 'Traje de Tondero',
            region: 'Costa',
            danza: 'Tondero',
            imagenUrl: '',
            tallas: { S: 2, M: 5, L: 3 },
            activo: true
        }
    ];
    renderCatalog();
    showToast('Modo demostración: Configure Firebase para datos reales');
}

// ══════════════════════════════════════════════════════
// RENDERIZADO DEL CATÁLOGO
// ══════════════════════════════════════════════════════
function renderCatalog() {
    // Aplicar filtros
    let filtradas = vestimentas;

    if (filtroRegion !== 'all') {
        filtradas = filtradas.filter(v => v.region === filtroRegion);
    }

    if (filtroBusqueda.trim()) {
        const busqueda = filtroBusqueda.toLowerCase();
        filtradas = filtradas.filter(v =>
            v.nombre.toLowerCase().includes(busqueda) ||
            v.danza.toLowerCase().includes(busqueda) ||
            v.region.toLowerCase().includes(busqueda)
        );
    }

    // Limpiar grid
    CATALOG_GRID.innerHTML = '';

    if (filtradas.length === 0) {
        EMPTY_STATE.style.display = 'block';
        return;
    }

    EMPTY_STATE.style.display = 'none';

    filtradas.forEach((vestimenta, index) => {
        const card = crearCard(vestimenta, index);
        CATALOG_GRID.appendChild(card);
    });
}

function crearCard(vestimenta, index) {
    const totalStock = calcularStockTotal(vestimenta.tallas);
    const hayStock = totalStock > 0;
    const tallasDisponibles = Object.entries(vestimenta.tallas);

    // Colores de placeholder por región
    const regionColors = {
        'Costa': ['#3498DB', '#2980B9'],
        'Sierra': ['#E67E22', '#D35400'],
        'Selva': ['#27AE60', '#2ECC71']
    };
    const colors = regionColors[vestimenta.region] || ['#D35400', '#E67E22'];

    const card = document.createElement('div');
    card.className = 'vestimenta-card';
    card.style.animationDelay = `${index * 0.08}s`;
    card.style.animation = `fadeInUp 0.5s ease-out ${index * 0.08}s both`;

    card.innerHTML = `
        <div class="card-image-wrapper">
            ${vestimenta.imagenUrl
                ? `<img src="${vestimenta.imagenUrl}" alt="${vestimenta.nombre}" loading="lazy">`
                : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;
                    background:linear-gradient(135deg, ${colors[0]}22, ${colors[1]}22);
                    font-size:4rem;"><svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--text-muted);opacity:0.5;"><path d="m6 2 2 4h8l2-4"/><path d="M6 6v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6"/></svg></div>`
            }
            <span class="card-badge">${getRegionEmoji(vestimenta.region)} ${vestimenta.region}</span>
            <span class="card-stock-badge ${hayStock ? 'in-stock' : 'out-of-stock'}">
                ${hayStock ? `${totalStock} disponibles` : 'Agotado'}
            </span>
        </div>
        <div class="card-body">
            <h3>${vestimenta.nombre}</h3>
            <p class="card-danza">Danza: ${vestimenta.danza}</p>
            <div class="card-tallas">
                ${tallasDisponibles.map(([talla, cant]) => `
                    <span class="talla-chip ${cant > 0 ? 'available' : 'unavailable'}" 
                          title="${cant > 0 ? cant + ' unidades' : 'Sin stock'}">
                        ${talla}
                    </span>
                `).join('')}
            </div>
            <div class="card-actions">
                <button class="btn btn-secondary btn-sm btn-ver-detalle" 
                        data-id="${vestimenta.id}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg> Ver detalle
                </button>
                ${hayStock ? `
                    <button class="btn btn-whatsapp btn-sm btn-reservar"
                            data-id="${vestimenta.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg> Reservar
                    </button>
                ` : `
                    <button class="btn btn-sm" disabled 
                            style="opacity:0.4;cursor:not-allowed;background:var(--bg-card);">
                        Agotado
                    </button>
                `}
            </div>
        </div>
    `;

    // Eventos
    card.querySelector('.btn-ver-detalle').addEventListener('click', (e) => {
        e.stopPropagation();
        abrirModal(vestimenta);
    });

    const btnReservar = card.querySelector('.btn-reservar');
    if (btnReservar) {
        btnReservar.addEventListener('click', (e) => {
            e.stopPropagation();
            // Buscar la primera talla disponible
            const primeraTallaDisponible = tallasDisponibles.find(([, cant]) => cant > 0);
            if (primeraTallaDisponible) {
                redirigirWhatsApp(vestimenta.nombre, primeraTallaDisponible[0]);
            }
        });
    }

    return card;
}

// ══════════════════════════════════════════════════════
// MODAL DE DETALLE
// ══════════════════════════════════════════════════════
let tallaSeleccionadaModal = null;

function initModal() {
    const closeBtn = document.getElementById('modalClose');
    closeBtn.addEventListener('click', cerrarModal);
    MODAL_OVERLAY.addEventListener('click', (e) => {
        if (e.target === MODAL_OVERLAY) cerrarModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') cerrarModal();
    });
}

function abrirModal(vestimenta) {
    const modalImage = document.getElementById('modalImage');
    const modalName = document.getElementById('modalName');
    const modalRegion = document.getElementById('modalRegion');
    const modalDanza = document.getElementById('modalDanza');
    const modalTallas = document.getElementById('modalTallas');
    const modalWhatsapp = document.getElementById('modalWhatsapp');

    // Rellenar datos
    if (vestimenta.imagenUrl) {
        modalImage.src = vestimenta.imagenUrl;
        modalImage.alt = vestimenta.nombre;
        modalImage.style.display = 'block';
    } else {
        modalImage.style.display = 'none';
    }

    modalName.textContent = vestimenta.nombre;
    modalRegion.textContent = `${getRegionEmoji(vestimenta.region)} ${vestimenta.region}`;
    modalDanza.textContent = `Danza: ${vestimenta.danza}`;

    // Renderizar chips de tallas
    tallaSeleccionadaModal = null;
    const tallasEntries = Object.entries(vestimenta.tallas);
    modalTallas.innerHTML = tallasEntries.map(([talla, cant]) => `
        <span class="talla-chip ${cant > 0 ? 'available' : 'unavailable'}" 
              data-talla="${talla}" data-stock="${cant}"
              title="${cant > 0 ? cant + ' unidades disponibles' : 'Sin stock'}">
            ${talla} ${cant > 0 ? `(${cant})` : ''}
        </span>
    `).join('');

    // Click en tallas del modal
    modalTallas.querySelectorAll('.talla-chip.available').forEach(chip => {
        chip.addEventListener('click', () => {
            modalTallas.querySelectorAll('.talla-chip').forEach(c => c.classList.remove('selected'));
            chip.classList.add('selected');
            tallaSeleccionadaModal = chip.dataset.talla;
            actualizarBotonWhatsApp(vestimenta.nombre);
        });
    });

    // Seleccionar primera talla disponible por defecto
    const primerDisponible = tallasEntries.find(([, cant]) => cant > 0);
    if (primerDisponible) {
        tallaSeleccionadaModal = primerDisponible[0];
        const chipActivo = modalTallas.querySelector(`[data-talla="${primerDisponible[0]}"]`);
        if (chipActivo) chipActivo.classList.add('selected');
        actualizarBotonWhatsApp(vestimenta.nombre);
    } else {
        modalWhatsapp.href = '#';
        modalWhatsapp.textContent = 'Sin stock disponible';
        modalWhatsapp.classList.remove('btn-whatsapp');
        modalWhatsapp.style.pointerEvents = 'none';
        modalWhatsapp.style.opacity = '0.5';
    }

    // Mostrar modal
    MODAL_OVERLAY.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function actualizarBotonWhatsApp(nombrePrenda) {
    const modalWhatsapp = document.getElementById('modalWhatsapp');
    if (tallaSeleccionadaModal) {
        const url = construirUrlWhatsApp(nombrePrenda, tallaSeleccionadaModal);
        modalWhatsapp.href = url;
        modalWhatsapp.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:6px;"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>Reservar talla ${tallaSeleccionadaModal} por WhatsApp`;
        modalWhatsapp.classList.add('btn-whatsapp');
        modalWhatsapp.style.pointerEvents = 'auto';
        modalWhatsapp.style.opacity = '1';
    }
}

function cerrarModal() {
    MODAL_OVERLAY.classList.remove('active');
    document.body.style.overflow = '';
}

// ══════════════════════════════════════════════════════
// WHATSAPP
// ══════════════════════════════════════════════════════
function construirUrlWhatsApp(nombrePrenda, talla) {
    const mensaje = `Hola, vengo del catálogo web y deseo consultar por la reserva del traje de *${nombrePrenda}* en talla *${talla}*.`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`;
}

function redirigirWhatsApp(nombrePrenda, talla) {
    const url = construirUrlWhatsApp(nombrePrenda, talla);
    window.open(url, '_blank');
}

// ══════════════════════════════════════════════════════
// FILTROS Y BÚSQUEDA
// ══════════════════════════════════════════════════════
function initFilters() {
    FILTER_TABS.addEventListener('click', (e) => {
        if (!e.target.classList.contains('filter-tab')) return;

        FILTER_TABS.querySelectorAll('.filter-tab').forEach(tab => tab.classList.remove('active'));
        e.target.classList.add('active');

        filtroRegion = e.target.dataset.region;
        renderCatalog();
    });
}

function initSearch() {
    let debounceTimer;
    SEARCH_INPUT.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            filtroBusqueda = SEARCH_INPUT.value;
            renderCatalog();
        }, 300);
    });
}

// ══════════════════════════════════════════════════════
// NAVBAR
// ══════════════════════════════════════════════════════
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('navMenu');

    // Scroll effect
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    // Mobile toggle
    toggle.addEventListener('click', () => {
        menu.classList.toggle('open');
    });

    // Cerrar menú al hacer clic en un link
    menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            menu.classList.remove('open');
        });
    });
}

// ══════════════════════════════════════════════════════
// SCROLL TO TOP
// ══════════════════════════════════════════════════════
function initScrollTop() {
    const btn = document.getElementById('scrollTopBtn');
    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 500);
    });
    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ══════════════════════════════════════════════════════
// UTILIDADES
// ══════════════════════════════════════════════════════
function calcularStockTotal(tallas) {
    return Object.values(tallas).reduce((sum, cant) => sum + cant, 0);
}

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

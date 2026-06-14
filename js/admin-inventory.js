// =====================================================
// admin-inventory.js — CRUD de Vestimentas
// Crear, Leer, Actualizar y Eliminar prendas.
// Sube imágenes como Base64 comprimido en Firestore.
// =====================================================

import { db } from './firebase-config.js';
import {
    collection, getDocs, addDoc, doc, updateDoc, deleteDoc,
    query, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ── Referencias del DOM ──
const btnNueva = document.getElementById('btnNuevaVestimenta');
const formContainer = document.getElementById('formVestimentaContainer');
const formVestimenta = document.getElementById('formVestimenta');
const formTitle = document.getElementById('formVestimentaTitle');
const btnCancelar = document.getElementById('btnCancelarVestimenta');
const tableBody = document.getElementById('inventarioTableBody');
const searchInput = document.getElementById('searchInventario');
const imageInput = document.getElementById('vestimentaImagen');
const imagePreview = document.getElementById('imagePreview');
const uploadPlaceholder = document.getElementById('uploadPlaceholder');

// ── Estado ──
let vestimentasList = [];
let editandoId = null;
let imagenSeleccionada = null;

// ── Tallas disponibles ──
const TALLAS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

// ══════════════════════════════════════════════════════
// INICIALIZACIÓN
// ══════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    cargarInventario();
    initFormEvents();
    initSearchInventario();
});

// ══════════════════════════════════════════════════════
// LEER — Cargar lista de vestimentas
// ══════════════════════════════════════════════════════
export async function cargarInventario() {
    try {
        const vestimentasRef = collection(db, 'vestimentas');
        const q = query(vestimentasRef, orderBy('fecha_registro', 'desc'));
        const snapshot = await getDocs(q);

        vestimentasList = [];
        snapshot.forEach(docSnap => {
            vestimentasList.push({ id: docSnap.id, ...docSnap.data() });
        });

        renderTablaInventario(vestimentasList);
    } catch (error) {
        console.error('Error al cargar inventario:', error);
        // Datos demo si Firebase no está configurado
        vestimentasList = getDatosDemo();
        renderTablaInventario(vestimentasList);
        showToast('Modo demo — Configure Firebase para datos reales');
    }
}

function renderTablaInventario(lista) {
    if (lista.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center; color: var(--text-muted); padding: 40px;">
                    No hay vestimentas registradas. Haga clic en "Nueva vestimenta" para agregar.
                </td>
            </tr>`;
        return;
    }

    tableBody.innerHTML = lista.map(v => {
        const stockTotal = calcularStockTotal(v.tallas || {});
        const tallasStr = Object.entries(v.tallas || {})
            .filter(([, cant]) => cant > 0)
            .map(([talla, cant]) => `<span class="talla-chip available" style="font-size:0.7rem;padding:2px 6px;">${talla}:${cant}</span>`)
            .join('') || '<span style="color:var(--text-muted);font-size:0.8rem;">Sin stock</span>';

        return `
            <tr>
                <td>
                    ${v.imagenUrl
                        ? `<img src="${v.imagenUrl}" alt="${v.nombre}" style="width:44px;height:44px;border-radius:var(--radius-sm);object-fit:cover;">`
                        : `<div style="width:44px;height:44px;border-radius:var(--radius-sm);background:var(--bg-card);display:flex;align-items:center;justify-content:center;font-size:1.2rem;">🎭</div>`
                    }
                </td>
                <td style="color:var(--text-primary);font-weight:500;">${v.nombre}</td>
                <td>${getRegionIcon(v.region)} ${v.region}</td>
                <td>${v.danza}</td>
                <td><div style="display:flex;gap:4px;flex-wrap:wrap;">${tallasStr}</div></td>
                <td>
                    <span class="status-badge ${v.activo !== false ? 'devuelto' : 'cancelado'}">
                        ${v.activo !== false ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td>
                    <div style="display:flex;gap:4px;">
                        <button class="btn btn-secondary btn-sm btn-editar" data-id="${v.id}" title="Editar">✏️</button>
                        <button class="btn btn-secondary btn-sm btn-eliminar" data-id="${v.id}" data-nombre="${v.nombre}" title="Eliminar" 
                                style="border-color:rgba(239,68,68,0.2);">🗑️</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    // Asignar eventos a botones
    tableBody.querySelectorAll('.btn-editar').forEach(btn => {
        btn.addEventListener('click', () => editarVestimenta(btn.dataset.id));
    });

    tableBody.querySelectorAll('.btn-eliminar').forEach(btn => {
        btn.addEventListener('click', () => confirmarEliminar(btn.dataset.id, btn.dataset.nombre));
    });
}

// ══════════════════════════════════════════════════════
// CREAR / ACTUALIZAR — Formulario
// ══════════════════════════════════════════════════════
function initFormEvents() {
    // Botón "Nueva vestimenta"
    btnNueva.addEventListener('click', () => {
        editandoId = null;
        formTitle.textContent = '➕ Nueva Vestimenta';
        formVestimenta.reset();
        resetImagePreview();
        TALLAS.forEach(t => {
            const input = document.getElementById(`talla${t}`);
            if (input) input.value = 0;
        });
        formContainer.style.display = 'block';
        formContainer.scrollIntoView({ behavior: 'smooth' });
    });

    // Botón cancelar
    btnCancelar.addEventListener('click', () => {
        formContainer.style.display = 'none';
        editandoId = null;
    });

    // Preview de imagen
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                showToast('La imagen no debe superar 5MB');
                imageInput.value = '';
                return;
            }
            imagenSeleccionada = file;
            const reader = new FileReader();
            reader.onload = (ev) => {
                imagePreview.src = ev.target.result;
                imagePreview.style.display = 'block';
                uploadPlaceholder.style.display = 'none';
            };
            reader.readAsDataURL(file);
        }
    });

    // Submit del formulario
    formVestimenta.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btnGuardar = document.getElementById('btnGuardarVestimenta');
        btnGuardar.disabled = true;
        btnGuardar.innerHTML = '⏳ Guardando...';

        try {
            // Recoger tallas
            const tallas = {};
            TALLAS.forEach(t => {
                const val = parseInt(document.getElementById(`talla${t}`).value, 10);
                if (val > 0) tallas[t] = val;
            });

            // Subir imagen si hay una nueva
            let imagenUrl = '';
            if (imagenSeleccionada) {
                imagenUrl = await comprimirYCodificar(imagenSeleccionada);
            } else if (editandoId) {
                // Mantener la imagen anterior
                const vestimentaActual = vestimentasList.find(v => v.id === editandoId);
                imagenUrl = vestimentaActual?.imagenUrl || '';
            }

            const datos = {
                nombre: document.getElementById('vestimentaNombre').value.trim(),
                danza: document.getElementById('vestimentaDanza').value.trim(),
                region: document.getElementById('vestimentaRegion').value,
                tallas: tallas,
                imagenUrl: imagenUrl,
                activo: true
            };

            if (editandoId) {
                // ACTUALIZAR
                await updateDoc(doc(db, 'vestimentas', editandoId), datos);
                showToast('✅ Vestimenta actualizada correctamente');
            } else {
                // CREAR
                datos.fecha_registro = serverTimestamp();
                await addDoc(collection(db, 'vestimentas'), datos);
                showToast('✅ Vestimenta registrada correctamente');
            }

            formContainer.style.display = 'none';
            editandoId = null;
            imagenSeleccionada = null;
            await cargarInventario();

        } catch (error) {
            console.error('Error al guardar:', error);
            showToast('❌ Error al guardar. Revise la consola.');
        } finally {
            btnGuardar.disabled = false;
            btnGuardar.innerHTML = '💾 Guardar vestimenta';
        }
    });
}

// Cargar datos en el formulario para editar
function editarVestimenta(id) {
    const vestimenta = vestimentasList.find(v => v.id === id);
    if (!vestimenta) return;

    editandoId = id;
    formTitle.textContent = '✏️ Editar Vestimenta';

    document.getElementById('vestimentaNombre').value = vestimenta.nombre || '';
    document.getElementById('vestimentaDanza').value = vestimenta.danza || '';
    document.getElementById('vestimentaRegion').value = vestimenta.region || '';

    // Cargar tallas
    TALLAS.forEach(t => {
        const input = document.getElementById(`talla${t}`);
        if (input) input.value = vestimenta.tallas?.[t] || 0;
    });

    // Mostrar imagen actual si existe
    resetImagePreview();
    if (vestimenta.imagenUrl) {
        imagePreview.src = vestimenta.imagenUrl;
        imagePreview.style.display = 'block';
        uploadPlaceholder.style.display = 'none';
    }

    imagenSeleccionada = null;
    formContainer.style.display = 'block';
    formContainer.scrollIntoView({ behavior: 'smooth' });
}

// ══════════════════════════════════════════════════════
// ELIMINAR
// ══════════════════════════════════════════════════════
function confirmarEliminar(id, nombre) {
    showConfirmDialog(
        '🗑️',
        '¿Eliminar vestimenta?',
        `Se eliminará "${nombre}" del inventario. Esta acción no se puede deshacer.`,
        async () => {
            try {
                await deleteDoc(doc(db, 'vestimentas', id));
                showToast('🗑️ Vestimenta eliminada');
                await cargarInventario();
            } catch (error) {
                console.error('Error al eliminar:', error);
                showToast('❌ Error al eliminar');
            }
        }
    );
}

/**
 * Comprime y codifica una imagen a Base64.
 * Redimensiona a máx. 800px de ancho para mantener
 * el tamaño del documento Firestore manejable.
 */
async function comprimirYCodificar(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 800;
                let width = img.width;
                let height = img.height;

                // Redimensionar manteniendo proporción
                if (width > MAX_WIDTH || height > MAX_HEIGHT) {
                    const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Comprimir a JPEG con calidad 0.7
                const base64 = canvas.toDataURL('image/jpeg', 0.7);
                resolve(base64);
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// ══════════════════════════════════════════════════════
// BÚSQUEDA EN INVENTARIO
// ══════════════════════════════════════════════════════
function initSearchInventario() {
    let debounce;
    searchInput.addEventListener('input', () => {
        clearTimeout(debounce);
        debounce = setTimeout(() => {
            const term = searchInput.value.toLowerCase().trim();
            if (!term) {
                renderTablaInventario(vestimentasList);
                return;
            }
            const filtradas = vestimentasList.filter(v =>
                v.nombre.toLowerCase().includes(term) ||
                v.danza.toLowerCase().includes(term) ||
                v.region.toLowerCase().includes(term)
            );
            renderTablaInventario(filtradas);
        }, 250);
    });
}

// ══════════════════════════════════════════════════════
// UTILIDADES
// ══════════════════════════════════════════════════════
function resetImagePreview() {
    imagePreview.src = '';
    imagePreview.style.display = 'none';
    uploadPlaceholder.style.display = 'block';
    imageInput.value = '';
}

function calcularStockTotal(tallas) {
    return Object.values(tallas).reduce((sum, c) => sum + c, 0);
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

// ── Diálogo de confirmación ──
function showConfirmDialog(icon, title, message, onConfirm) {
    const overlay = document.getElementById('confirmOverlay');
    document.getElementById('confirmIcon').textContent = icon;
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;

    overlay.classList.add('active');

    const cancelBtn = document.getElementById('confirmCancel');
    const acceptBtn = document.getElementById('confirmAccept');

    // Limpiar listeners previos clonando los botones
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
    return [
        { id: 'demo1', nombre: 'Traje de Marinera Norteña', region: 'Costa', danza: 'Marinera Norteña', imagenUrl: '', tallas: { S: 2, M: 3, L: 1 }, activo: true },
        { id: 'demo2', nombre: 'Vestido de Festejo', region: 'Costa', danza: 'Festejo', imagenUrl: '', tallas: { S: 1, M: 2, L: 2 }, activo: true },
        { id: 'demo3', nombre: 'Traje de Huayno Cusqueño', region: 'Sierra', danza: 'Huayno', imagenUrl: '', tallas: { M: 4, L: 3, XL: 1 }, activo: true },
        { id: 'demo4', nombre: 'Traje de Diablada Puneña', region: 'Sierra', danza: 'Diablada', imagenUrl: '', tallas: { M: 2, L: 1 }, activo: true },
        { id: 'demo5', nombre: 'Traje de Buri Buriti', region: 'Selva', danza: 'Buri Buriti', imagenUrl: '', tallas: { S: 3, M: 2, L: 1 }, activo: true },
    ];
}

// Exportar para que otros módulos puedan usarlo
export { vestimentasList, showToast, showConfirmDialog };

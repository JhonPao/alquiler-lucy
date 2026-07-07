const STORAGE_KEY = 'admin_lang';

const translations = {
  es: {
    /* ─── Sidebar ─── */
    'sidebar.principal': 'Principal',
    'sidebar.dashboard': 'Dashboard',
    'sidebar.gestion': 'Gestión',
    'sidebar.inventario': 'Inventario',
    'sidebar.alquilar': 'Alquilar',
    'sidebar.historial': 'Historial',
    'sidebar.cerrar_sesion': 'Cerrar sesión',
    'sidebar.ir_catalogo': 'Ir al catálogo público',

    /* ─── Loading ─── */
    'loading.verificando': 'Verificando acceso...',

    /* ─── Dashboard ─── */
    'dashboard.title': 'Dashboard',
    'dashboard.vestimentas_registradas': 'Vestimentas registradas',
    'dashboard.alquileres_mes': 'Alquileres este mes',
    'dashboard.pendientes': 'Pendientes de devolución',
    'dashboard.devueltos_mes': 'Devueltos este mes',
    'dashboard.ultimos_alquileres': 'Últimos alquileres',
    'dashboard.cliente': 'Cliente',
    'dashboard.vestimenta': 'Vestimenta',
    'dashboard.talla': 'Talla',
    'dashboard.fecha_inicio': 'Fecha inicio',
    'dashboard.estado': 'Estado',
    'dashboard.cargando': 'Cargando datos...',
    'dashboard.no_alquileres': 'No hay alquileres registrados aún.',

    /* ─── Inventario ─── */
    'inventario.title': 'Inventario',
    'inventario.nueva_vestimenta': 'Nueva vestimenta',
    'inventario.title_nuevo': 'Nueva Vestimenta',
    'inventario.title_editar': 'Editar Vestimenta',
    'inventario.nombre_prenda': 'Nombre de la prenda',
    'inventario.danza': 'Danza',
    'inventario.region': 'Región',
    'inventario.seleccionar_region': 'Seleccionar región...',
    'inventario.tallas_stock': 'Tallas y stock disponible',
    'inventario.foto_prenda': 'Foto de la prenda',
    'inventario.upload_text': 'Haga clic o arrastre una imagen aquí',
    'inventario.upload_hint': 'JPG, PNG o WebP — máx. 5MB',
    'inventario.placeholder_nombre_ej': 'Ej: Traje de Marinera Norteña',
    'inventario.placeholder_danza_ej': 'Ej: Marinera Norteña',
    'inventario.cancelar': 'Cancelar',
    'inventario.guardar': 'Guardar vestimenta',
    'inventario.guardando': 'Guardando...',
    'inventario.listado': 'Listado de vestimentas',
    'inventario.buscar': 'Buscar vestimenta...',
    'inventario.imagen': 'Imagen',
    'inventario.nombre': 'Nombre',
    'inventario.region_tab': 'Región',
    'inventario.danza_tab': 'Danza',
    'inventario.tallas_stock_tab': 'Tallas / Stock',
    'inventario.activo': 'Activo',
    'inventario.inactivo': 'Inactivo',
    'inventario.estado_tab': 'Estado',
    'inventario.acciones': 'Acciones',
    'inventario.editar': 'Editar',
    'inventario.eliminar': 'Eliminar',
    'inventario.sin_stock': 'Sin stock',
    'inventario.no_hay': 'No hay vestimentas registradas. Haga clic en "Nueva vestimenta" para agregar.',
    'inventario.cargando': 'Cargando inventario...',
    'inventario.imagen_grande': 'La imagen no debe superar 5MB',
    'inventario.actualizada': 'Vestimenta actualizada correctamente',
    'inventario.registrada': 'Vestimenta registrada correctamente',
    'inventario.error_guardar': 'Error al guardar. Revise la consola.',
    'inventario.eliminar_confirmar': '¿Eliminar vestimenta?',
    'inventario.eliminar_mensaje': 'Se eliminará "{nombre}" del inventario. Esta acción no se puede deshacer.',
    'inventario.eliminada': 'Vestimenta eliminada',
    'inventario.error_eliminar': 'Error al eliminar',
    'inventario.demo': 'Modo demo — Configure Firebase para datos reales',

    /* ─── Alquilar ─── */
    'alquilar.title': 'Registrar Alquiler',
    'alquilar.buscar': 'Buscar vestimenta para alquilar...',
    'alquilar.cargando': 'Cargando vestimentas disponibles...',
    'alquilar.no_disponibles': 'No se encontraron vestimentas disponibles.',
    'alquilar.alquilar': 'Alquilar',
    'alquilar.disponible': 'disponible',
    'alquilar.disponibles': 'disponibles',
    'alquilar.unidad': 'unidad',
    'alquilar.unidades': 'unidades',
    'alquilar.volver': 'Volver al catálogo',
    'alquilar.datos_contrato': 'Datos del contrato de alquiler',
    'alquilar.talla': 'Talla',
    'alquilar.seleccionar_talla': 'Seleccionar talla...',
    'alquilar.cantidad': 'Cantidad',
    'alquilar.datos_cliente': 'Datos del cliente',
    'alquilar.nombres': 'Nombres',
    'alquilar.apellidos': 'Apellidos',
    'alquilar.dni': 'DNI',
    'alquilar.telefono': 'Teléfono',
    'alquilar.direccion': 'Dirección',
    'alquilar.control_fechas': 'Control de fechas',
    'alquilar.fecha_inicio': 'Fecha de inicio',
    'alquilar.fecha_devolucion': 'Fecha de devolución',
    'alquilar.registrar': 'Registrar Alquiler',
    'alquilar.registrando': 'Registrando...',
    'alquilar.cancelar_btn': 'Cancelar',
    'alquilar.seleccione_prenda': 'Seleccione una vestimenta',
    'alquilar.seleccione_talla': 'Seleccione una talla',
    'alquilar.cantidad_minima': 'La cantidad debe ser al menos 1',
    'alquilar.sin_stock_talla': 'Solo hay {stock} unidad(es) disponibles en talla {talla}',
    'alquilar.dni_invalido': 'El DNI debe tener exactamente 8 dígitos',
    'alquilar.fecha_invalida': 'La fecha de devolución debe ser posterior a la de inicio',
    'alquilar.exito': 'Alquiler registrado correctamente',
    'alquilar.error': 'Error al registrar. Revise la consola.',
    'alquilar.placeholder_nombres': 'Ej: Juan Carlos',
    'alquilar.placeholder_apellidos': 'Ej: Pérez Gómez',
    'alquilar.placeholder_dni': '12345678',
    'alquilar.placeholder_telefono': '987654321',
    'alquilar.placeholder_direccion': 'Av. Las Flores 123, Lima',

    /* ─── Historial ─── */
    'historial.title': 'Historial de Alquileres',
    'historial.todos': 'Todos',
    'historial.alquilados': 'Alquilados',
    'historial.devueltos': 'Devueltos',
    'historial.cancelados': 'Cancelados',
    'historial.contratos': 'Contratos registrados',
    'historial.cliente': 'Cliente',
    'historial.dni': 'DNI',
    'historial.vestimenta': 'Vestimenta',
    'historial.talla': 'Talla',
    'historial.cant': 'Cant.',
    'historial.inicio': 'Inicio',
    'historial.devolucion': 'Devolución',
    'historial.estado': 'Estado',
    'historial.acciones': 'Acciones',
    'historial.cargando': 'Cargando historial...',
    'historial.sin_datos': 'Sin datos',
    'historial.no_hay': 'No hay alquileres registrados.',
    'historial.no_hay_filtro': 'No hay alquileres con estado "{estado}".',
    'historial.devolver': 'Devolver',
    'historial.marcar_devuelto': 'Marcar como devuelto',
    'historial.cancelar': 'Cancelar alquiler',
    'historial.sin_accion': '—',
    'historial.confirmar_devuelto': '¿Marcar como devuelto?',
    'historial.confirmar_devuelto_msg': 'Se registrará la devolución de "{prenda}" por {cliente} y se retornará el stock al inventario.',
    'historial.devuelto_ok': 'Alquiler marcado como devuelto. Stock actualizado.',
    'historial.error_actualizar': 'Error al actualizar. Revise la consola.',
    'historial.confirmar_cancelar': '¿Cancelar este alquiler?',
    'historial.confirmar_cancelar_msg': 'Se cancelará el contrato y se retornará el stock al inventario. Esta acción no se puede deshacer.',
    'historial.cancelado_ok': 'Alquiler cancelado. Stock retornado.',
    'historial.error_cancelar': 'Error al cancelar. Revise la consola.',

    /* ─── Confirm Dialog ─── */
    'confirm.seguro': '¿Está seguro?',
    'confirm.no_deshacer': 'Esta acción no se puede deshacer.',
    'confirm.cancelar': 'Cancelar',
    'confirm.confirmar': 'Confirmar',

    /* ─── Auth ─── */
    'auth.administrador': 'Administrador',
    'auth.error_completar': 'Por favor, complete todos los campos.',
    'auth.error_invalido': 'El correo electrónico no es válido.',
    'auth.error_deshabilitada': 'Esta cuenta ha sido deshabilitada.',
    'auth.error_no_encontrado': 'No existe una cuenta con ese correo.',
    'auth.error_password': 'La contraseña es incorrecta.',
    'auth.error_credenciales': 'Credenciales inválidas. Verifique su correo y contraseña.',
    'auth.error_muchos_intentos': 'Demasiados intentos fallidos. Espere unos minutos.',
    'auth.error_conexion': 'Error de conexión. Verifique su internet.',
    'auth.error_interno': 'Error interno del servidor. Intente más tarde.',
    'auth.error_inesperado': 'Error inesperado. Intente de nuevo.',
    'auth.error_cerrar': 'Error al cerrar sesión. Intente de nuevo.',

    /* ─── Language toggle ─── */
    'lang.es': 'ES',
    'lang.en': 'EN',
    'lang.label': 'Idioma',

    /* ─── Theme toggle ─── */
    'theme.light': 'Modo claro',
    'theme.dark': 'Modo oscuro',
  },

  en: {
    /* ─── Sidebar ─── */
    'sidebar.principal': 'Main',
    'sidebar.dashboard': 'Dashboard',
    'sidebar.gestion': 'Management',
    'sidebar.inventario': 'Inventory',
    'sidebar.alquilar': 'Rent',
    'sidebar.historial': 'History',
    'sidebar.cerrar_sesion': 'Log out',
    'sidebar.ir_catalogo': 'Go to public catalog',

    /* ─── Loading ─── */
    'loading.verificando': 'Verifying access...',

    /* ─── Dashboard ─── */
    'dashboard.title': 'Dashboard',
    'dashboard.vestimentas_registradas': 'Registered garments',
    'dashboard.alquileres_mes': 'Rentals this month',
    'dashboard.pendientes': 'Pending returns',
    'dashboard.devueltos_mes': 'Returned this month',
    'dashboard.ultimos_alquileres': 'Latest rentals',
    'dashboard.cliente': 'Client',
    'dashboard.vestimenta': 'Garment',
    'dashboard.talla': 'Size',
    'dashboard.fecha_inicio': 'Start date',
    'dashboard.estado': 'Status',
    'dashboard.cargando': 'Loading data...',
    'dashboard.no_alquileres': 'No rentals registered yet.',

    /* ─── Inventario ─── */
    'inventario.title': 'Inventory',
    'inventario.nueva_vestimenta': 'New garment',
    'inventario.title_nuevo': 'New Garment',
    'inventario.title_editar': 'Edit Garment',
    'inventario.nombre_prenda': 'Garment name',
    'inventario.danza': 'Dance',
    'inventario.region': 'Region',
    'inventario.seleccionar_region': 'Select region...',
    'inventario.tallas_stock': 'Sizes and available stock',
    'inventario.foto_prenda': 'Garment photo',
    'inventario.upload_text': 'Click or drag an image here',
    'inventario.upload_hint': 'JPG, PNG or WebP — max. 5MB',
    'inventario.placeholder_nombre_ej': 'e.g. Marinera Norteña Costume',
    'inventario.placeholder_danza_ej': 'e.g. Marinera Norteña',
    'inventario.cancelar': 'Cancel',
    'inventario.guardar': 'Save garment',
    'inventario.guardando': 'Saving...',
    'inventario.listado': 'Garment list',
    'inventario.buscar': 'Search garment...',
    'inventario.imagen': 'Image',
    'inventario.nombre': 'Name',
    'inventario.region_tab': 'Region',
    'inventario.danza_tab': 'Dance',
    'inventario.tallas_stock_tab': 'Sizes / Stock',
    'inventario.activo': 'Active',
    'inventario.inactivo': 'Inactive',
    'inventario.estado_tab': 'Status',
    'inventario.acciones': 'Actions',
    'inventario.editar': 'Edit',
    'inventario.eliminar': 'Delete',
    'inventario.sin_stock': 'No stock',
    'inventario.no_hay': 'No garments registered. Click "New garment" to add one.',
    'inventario.cargando': 'Loading inventory...',
    'inventario.imagen_grande': 'Image must not exceed 5MB',
    'inventario.actualizada': 'Garment updated successfully',
    'inventario.registrada': 'Garment registered successfully',
    'inventario.error_guardar': 'Error saving. Check console.',
    'inventario.eliminar_confirmar': 'Delete garment?',
    'inventario.eliminar_mensaje': '"{nombre}" will be deleted from inventory. This action cannot be undone.',
    'inventario.eliminada': 'Garment deleted',
    'inventario.error_eliminar': 'Error deleting',
    'inventario.demo': 'Demo mode — Configure Firebase for real data',

    /* ─── Alquilar ─── */
    'alquilar.title': 'Register Rental',
    'alquilar.buscar': 'Search garment to rent...',
    'alquilar.cargando': 'Loading available garments...',
    'alquilar.no_disponibles': 'No available garments found.',
    'alquilar.alquilar': 'Rent',
    'alquilar.disponible': 'available',
    'alquilar.disponibles': 'available',
    'alquilar.unidad': 'unit',
    'alquilar.unidades': 'units',
    'alquilar.volver': 'Back to catalog',
    'alquilar.datos_contrato': 'Rental contract information',
    'alquilar.talla': 'Size',
    'alquilar.seleccionar_talla': 'Select size...',
    'alquilar.cantidad': 'Quantity',
    'alquilar.datos_cliente': 'Customer information',
    'alquilar.nombres': 'First names',
    'alquilar.apellidos': 'Last names',
    'alquilar.dni': 'ID number',
    'alquilar.telefono': 'Phone',
    'alquilar.direccion': 'Address',
    'alquilar.control_fechas': 'Date control',
    'alquilar.fecha_inicio': 'Start date',
    'alquilar.fecha_devolucion': 'Return date',
    'alquilar.registrar': 'Register Rental',
    'alquilar.registrando': 'Registering...',
    'alquilar.cancelar_btn': 'Cancel',
    'alquilar.seleccione_prenda': 'Select a garment',
    'alquilar.seleccione_talla': 'Select a size',
    'alquilar.cantidad_minima': 'Quantity must be at least 1',
    'alquilar.sin_stock_talla': 'Only {stock} unit(s) available in size {talla}',
    'alquilar.dni_invalido': 'ID must be exactly 8 digits',
    'alquilar.fecha_invalida': 'Return date must be after start date',
    'alquilar.exito': 'Rental registered successfully',
    'alquilar.error': 'Error registering. Check console.',
    'alquilar.placeholder_nombres': 'e.g. Juan Carlos',
    'alquilar.placeholder_apellidos': 'e.g. Pérez Gómez',
    'alquilar.placeholder_dni': '12345678',
    'alquilar.placeholder_telefono': '987654321',
    'alquilar.placeholder_direccion': 'Av. Las Flores 123, Lima',

    /* ─── Historial ─── */
    'historial.title': 'Rental History',
    'historial.todos': 'All',
    'historial.alquilados': 'Rented',
    'historial.devueltos': 'Returned',
    'historial.cancelados': 'Canceled',
    'historial.contratos': 'Registered contracts',
    'historial.cliente': 'Client',
    'historial.dni': 'ID',
    'historial.vestimenta': 'Garment',
    'historial.talla': 'Size',
    'historial.cant': 'Qty',
    'historial.inicio': 'Start',
    'historial.devolucion': 'Return',
    'historial.estado': 'Status',
    'historial.acciones': 'Actions',
    'historial.cargando': 'Loading history...',
    'historial.sin_datos': 'No data',
    'historial.no_hay': 'No rentals registered.',
    'historial.no_hay_filtro': 'No rentals with status "{estado}".',
    'historial.devolver': 'Return',
    'historial.marcar_devuelto': 'Mark as returned',
    'historial.cancelar': 'Cancel rental',
    'historial.sin_accion': '—',
    'historial.confirmar_devuelto': 'Mark as returned?',
    'historial.confirmar_devuelto_msg': 'Return of "{prenda}" by {cliente} will be recorded and stock will be restored.',
    'historial.devuelto_ok': 'Rental marked as returned. Stock updated.',
    'historial.error_actualizar': 'Error updating. Check console.',
    'historial.confirmar_cancelar': 'Cancel this rental?',
    'historial.confirmar_cancelar_msg': 'The contract will be canceled and stock restored. This cannot be undone.',
    'historial.cancelado_ok': 'Rental canceled. Stock restored.',
    'historial.error_cancelar': 'Error canceling. Check console.',

    /* ─── Confirm Dialog ─── */
    'confirm.seguro': 'Are you sure?',
    'confirm.no_deshacer': 'This action cannot be undone.',
    'confirm.cancelar': 'Cancel',
    'confirm.confirmar': 'Confirm',

    /* ─── Auth ─── */
    'auth.administrador': 'Administrator',
    'auth.error_completar': 'Please fill in all fields.',
    'auth.error_invalido': 'The email address is not valid.',
    'auth.error_deshabilitada': 'This account has been disabled.',
    'auth.error_no_encontrado': 'No account found with that email.',
    'auth.error_password': 'The password is incorrect.',
    'auth.error_credenciales': 'Invalid credentials. Check your email and password.',
    'auth.error_muchos_intentos': 'Too many failed attempts. Please wait a few minutes.',
    'auth.error_conexion': 'Connection error. Check your internet.',
    'auth.error_interno': 'Internal server error. Try again later.',
    'auth.error_inesperado': 'Unexpected error. Try again.',
    'auth.error_cerrar': 'Error logging out. Try again.',

    /* ─── Language toggle ─── */
    'lang.es': 'ES',
    'lang.en': 'EN',
    'lang.label': 'Language',

    /* ─── Theme toggle ─── */
    'theme.light': 'Light mode',
    'theme.dark': 'Dark mode',
  }
};

let currentLang = localStorage.getItem(STORAGE_KEY) || 'es';

export function t(key, vars = {}) {
  let text = translations[currentLang]?.[key] || translations['es']?.[key] || key;
  Object.entries(vars).forEach(([k, v]) => {
    text = text.replace(`{${k}}`, v);
  });
  return text;
}

export function getLanguage() {
  return currentLang;
}

export function setLanguage(lang) {
  if (!translations[lang]) return;
  currentLang = lang;
  localStorage.setItem(STORAGE_KEY, lang);
  document.documentElement.lang = lang === 'en' ? 'en' : 'es';
  applyTranslations();
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
}

export function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const attr = el.dataset.i18nAttr;
    if (attr) {
      el.setAttribute(attr, t(key));
    } else {
      el.textContent = t(key);
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
}

export function initI18n() {
  document.documentElement.lang = currentLang === 'en' ? 'en' : 'es';
  applyTranslations();
}

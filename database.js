// ==========================================
// Base de Datos Local (Sin servidor / LocalStorage)
// ==========================================

// Obtiene la fecha actual en formato YYYY-MM-DD
function getDayKey(dateString = null) {
    const d = dateString ? new Date(dateString) : new Date();
    return d.toISOString().split('T')[0];
}

// 1. Obtener alumno desde el archivo estático (alumnos.js)
async function getAlumno(rut) {
    // DB_ALUMNOS viene de alumnos.js cargado en el HTML
    const alumno = DB_ALUMNOS.find(a => a.rut === rut);
    return alumno || null;
}

// 2. Revisar si el alumno ya almorzó/desayunó hoy
async function checkAsistencia(rut, servicio) {
    const records = JSON.parse(localStorage.getItem('colacion_db') || '[]');
    const today = getDayKey();
    
    // Buscar si existe un registro hoy, para el mismo RUT y servicio
    return records.some(r => r.rut === rut && r.servicio === servicio && r.fecha.startsWith(today));
}

// 3. Registrar el almuerzo/desayuno permanentemente en el celular/PC
async function registrarAsistencia(rut, servicio) {
    const records = JSON.parse(localStorage.getItem('colacion_db') || '[]');
    records.push({
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
        rut: rut,
        servicio: servicio,
        fecha: new Date().toISOString()
    });
    localStorage.setItem('colacion_db', JSON.stringify(records));
}

// ==========================================
// Funciones de Administración / Exportación
// ==========================================

function getRegistrosHoy() {
    const records = JSON.parse(localStorage.getItem('colacion_db') || '[]');
    const today = getDayKey();
    return records.filter(r => r.fecha.startsWith(today)).length;
}

function exportarAsistenciaCSV() {
    const records = JSON.parse(localStorage.getItem('colacion_db') || '[]');
    if (records.length === 0) {
        alert("No hay registros guardados para exportar.");
        return;
    }
    
    // Encabezados CSV (Separador por coma para compatibilidad Excel)
    let csv = "ID,RUT,Servicio,Fecha_ISO\n";
    records.forEach(r => {
        csv += `${r.id},${r.rut},${r.servicio},${r.fecha}\n`;
    });
    
    // Crear el archivo para descargar
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `asistencia_colacion_${getDayKey()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function limpiarAsistencias() {
    const registros = JSON.parse(localStorage.getItem('colacion_db') || '[]');
    if (registros.length === 0) {
        alert("La base de datos ya está vacía.");
        return;
    }

    if(confirm(`⚠️ ¡ATENCIÓN! Tienes ${registros.length} registros guardados en total.\n\n¿Estás SEGURO de querer borrarlos? Recuerda EXPORTAR A CSV primero o perderás la información.`)) {
        localStorage.removeItem('colacion_db');
        alert("La base de datos local ha sido formateada y está limpia.");
        // Refrescar contador en UI
        if(typeof actualizarContadorUI === 'function') actualizarContadorUI();
    }
}

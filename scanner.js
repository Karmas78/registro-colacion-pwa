// Estado global
let currentService = localStorage.getItem('colacion_servicio') || 'desayuno';
let isScanning = true;
let html5QrCode;

// Referencias de la UI
const btnDesayuno = document.getElementById('btn-desayuno');
const btnAlmuerzo = document.getElementById('btn-almuerzo');
const feedbackCard = document.getElementById('feedback-card');
const feedbackMessage = document.getElementById('feedback-message');
const studentPhoto = document.getElementById('student-photo');
const studentName = document.getElementById('student-name');
const studentCourse = document.getElementById('student-course');
const cameraOverlay = document.getElementById('camera-overlay');
const contadorHoy = document.getElementById('contador-hoy');

// Actualizar el contador de la interfaz
window.actualizarContadorUI = () => {
    if (contadorHoy && typeof getRegistrosHoy === 'function') {
        contadorHoy.innerText = getRegistrosHoy();
    }
};

// Web Audio API para Feedback (Beep / Buzz)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function initAudio() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
}

function playBeep() {
    initAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(900, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(); 
    osc.stop(audioCtx.currentTime + 0.15);
    
    if (navigator.vibrate) navigator.vibrate([100]);
}

function playBuzz() {
    initAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(); 
    osc.stop(audioCtx.currentTime + 0.3);
    
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
}

// Selector de Servicio UI
function updateServiceUI() {
    if (currentService === 'desayuno') {
        btnDesayuno.className = "flex-1 py-4 text-lg font-bold rounded-xl transition-all duration-300 transform active:scale-95 bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]";
        btnAlmuerzo.className = "flex-1 py-4 text-lg font-bold rounded-xl transition-all duration-300 transform active:scale-95 bg-gray-700 text-gray-400";
    } else {
        btnDesayuno.className = "flex-1 py-4 text-lg font-bold rounded-xl transition-all duration-300 transform active:scale-95 bg-gray-700 text-gray-400";
        btnAlmuerzo.className = "flex-1 py-4 text-lg font-bold rounded-xl transition-all duration-300 transform active:scale-95 bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.5)]";
    }
}

window.setService = (servicio) => {
    initAudio();
    currentService = servicio;
    localStorage.setItem('colacion_servicio', servicio);
    updateServiceUI();
};
updateServiceUI();
actualizarContadorUI(); // Al iniciar

// Mostrar Feedback Overlay
function showFeedback(type, title, photoUrl = null, name = null, course = null) {
    feedbackCard.classList.remove('hidden');
    void feedbackCard.offsetWidth; // Forzar reflow
    feedbackCard.classList.remove('scale-95', 'opacity-0');
    feedbackCard.classList.add('flex', 'scale-100', 'opacity-100');
    
    if (photoUrl) {
        studentPhoto.src = photoUrl;
        studentPhoto.classList.remove('hidden');
    } else {
        studentPhoto.classList.add('hidden');
    }
    
    studentName.innerText = name || '';
    studentCourse.innerText = course || '';
    feedbackMessage.innerText = title;
    
    if (type === 'success') {
        feedbackCard.className = "absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center transition-all duration-300 transform scale-100 opacity-100 backdrop-blur-md bg-green-900/90 text-white";
        studentPhoto.className = "w-32 h-32 rounded-full border-4 border-green-400 shadow-[0_0_30px_rgba(74,222,128,0.6)] mb-4 object-cover";
        feedbackMessage.className = "text-xl font-extrabold px-6 py-3 rounded-2xl w-full shadow-2xl bg-green-600 text-white";
        playBeep();
    } else {
        feedbackCard.className = "absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center transition-all duration-300 transform scale-100 opacity-100 backdrop-blur-md bg-red-900/90 text-white";
        studentPhoto.className = "w-32 h-32 rounded-full border-4 border-red-500 shadow-[0_0_30px_rgba(248,113,113,0.6)] mb-4 object-cover";
        feedbackMessage.className = "text-xl font-extrabold px-6 py-3 rounded-2xl w-full shadow-2xl bg-red-600 text-white";
        playBuzz();
    }

    setTimeout(() => {
        feedbackCard.classList.add('scale-95', 'opacity-0');
        feedbackCard.classList.remove('scale-100', 'opacity-100');
        setTimeout(() => {
            feedbackCard.classList.add('hidden');
            feedbackCard.classList.remove('flex');
            isScanning = true;
            if (html5QrCode && html5QrCode.getState() === 3) { // 3 = PAUSED
                html5QrCode.resume();
            }
        }, 300);
    }, 3000);
}

// Lógica de Escáner QR
html5QrCode = new Html5Qrcode("reader");

async function onScanSuccess(decodedText) {
    if (!isScanning) return;
    isScanning = false;
    
    if (html5QrCode.getState() === 2) {
        html5QrCode.pause(true);
    }

    const rut = decodedText.trim();
    cameraOverlay.classList.remove('hidden');
    cameraOverlay.classList.add('flex');

    try {
        // 1. Validar que el alumno exista en alumnos.js
        const alumno = await getAlumno(rut);
        if (!alumno) {
            showFeedback('error', 'Alumno no enrolado');
            return;
        }

        // 2. Verificar si ya recibió su servicio hoy (en LocalStorage)
        const yaRecibio = await checkAsistencia(rut, currentService);
        if (yaRecibio) {
            showFeedback('error', `ERROR: El alumno ${alumno.nombre} ya recibió su ${currentService} hoy`, alumno.foto_url, alumno.nombre, alumno.curso);
            return;
        }

        // 3. Registrar el éxito
        await registrarAsistencia(rut, currentService);
        actualizarContadorUI();
        showFeedback('success', '¡Registrado con éxito!', alumno.foto_url, alumno.nombre, alumno.curso);

    } catch (error) {
        console.error("Error al registrar:", error);
        showFeedback('error', 'Error en la Base de Datos Local');
    } finally {
        cameraOverlay.classList.add('hidden');
        cameraOverlay.classList.remove('flex');
    }
}

// Iniciar cámara tras un pequeño delay
setTimeout(() => {
    html5QrCode.start(
        { facingMode: "environment" },
        { 
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
        },
        onScanSuccess
    ).catch(err => {
        console.error("Error al iniciar cámara", err);
        document.getElementById('reader').innerHTML = `
            <div class="text-center p-6 flex flex-col items-center justify-center h-full">
                <svg class="w-12 h-12 text-red-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                <p class="text-red-500 font-bold mb-2">Cámara No Disponible</p>
                <p class="text-xs text-gray-400">Verifica los permisos del navegador o asegúrate de usar HTTPS.</p>
                <button class="mt-4 px-4 py-2 bg-gray-800 rounded-lg text-sm font-bold border border-gray-600" onclick="location.reload()">Reintentar</button>
            </div>
        `;
    });
}, 500);

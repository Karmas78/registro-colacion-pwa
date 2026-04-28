# Registro de Colación - PWA 🍔

Una Progressive Web App (PWA) ultra rápida y ligera diseñada para registrar la asistencia de almuerzos y desayunos escolares mediante escaneo de códigos QR. Funciona sin conexión a internet y se sincroniza automáticamente con la base de datos cuando la conexión vuelve.

## 🚀 Características Principales

- **Velocidad Extrema:** Desarrollada en HTML/JS puro y TailwindCSS, sin frameworks pesados.
- **Modo Offline:** Guarda los escaneos en la memoria del dispositivo (`localStorage`) si se cae el internet y permite subirlos después con el botón "Sincronizar Pendientes".
- **Lector QR Optimizado:** Usa la cámara trasera del dispositivo para escaneos instantáneos sin recargar la página.
- **Feedback Sensorial:** Emite sonidos diferentes de éxito y error, y activa la vibración del celular para que el operador no tenga que mirar la pantalla constantemente.
- **Base de Datos en Tiempo Real:** Integración directa con **Supabase** (PostgreSQL).

## 🛠️ Tecnologías

- HTML5, CSS3, JavaScript Vanilla
- **TailwindCSS** (via CDN)
- **Html5-Qrcode** (Lector QR)
- **Supabase SDK** (Base de Datos)

## 📦 Estructura del Proyecto

- `index.html`: UI Principal y vistas del sistema.
- `style.css`: Ajustes visuales finos para la cámara.
- `database.js`: Lógica de conexión a Supabase y consultas SQL.
- `scanner.js`: Lógica de negocio, sonidos, modo offline y procesamiento de QR.
- `sw.js` y `manifest.json`: Archivos requeridos para que funcione como una PWA instalable.
- `schema.sql` y `mock_data.sql`: Scripts para crear y poblar tu base de datos en Supabase.

## ⚙️ Instalación y Configuración

1. **Configura Supabase:**
   - Crea un nuevo proyecto en [Supabase](https://supabase.com/).
   - Abre la pestaña "SQL Editor" y pega el contenido de `schema.sql` para crear las tablas y políticas de seguridad (RLS).
   - Opcional: Ejecuta `mock_data.sql` si quieres tener alumnos de prueba.

2. **Vincula tu App:**
   - En Supabase, ve a `Project Settings -> API`.
   - Copia la `Project URL` y la `anon public key`.
   - Abre el archivo `database.js` en tu código y pega estos valores en las constantes `SUPABASE_URL` y `SUPABASE_KEY`.

3. **Despliegue:**
   - Sube este repositorio a GitHub.
   - Activa "GitHub Pages" en los ajustes del repositorio (apuntando a la rama `main` o `master`).
   - ¡Listo! Tendrás HTTPS automático, permitiendo que la cámara funcione en cualquier celular.

## 🔒 Nota sobre Seguridad
En aplicaciones de frontend (PWA/SPA), la clave `anon_key` de Supabase será pública por defecto en el código fuente. La verdadera seguridad de esta aplicación reside en las **Políticas RLS** que configuraste en `schema.sql`, las cuales limitan estrictamente lo que esa clave puede leer o escribir.

# 🚀 Questify

> **Plataforma SaaS moderna para la creación interactiva de quizzes y encuestas impulsada por Inteligencia Artificial, analíticas en tiempo real y monetización con Polar.**

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Turso](https://img.shields.io/badge/Turso-libSQL-00e699?style=flat-square&logo=turso)](https://turso.tech/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.45-c5f74f?style=flat-square&logo=drizzle)](https://orm.drizzle.team/)
[![Better Auth](https://img.shields.io/badge/Better_Auth-1.7-orange?style=flat-square)](https://better-auth.com/)
[![Polar.sh](https://img.shields.io/badge/Polar-Monetization-0066FF?style=flat-square)](https://polar.sh/)
[![Bun](https://img.shields.io/badge/Bun-1.0+-black?style=flat-square&logo=bun)](https://bun.sh/)

---

## 📌 Tabla de Contenidos

- [Acerca del Proyecto](#-acerca-del-proyecto)
- [Características Principales](#-características-principales)
- [Arquitectura y Decisiones Técnicas](#-arquitectura-y-decisiones-técnicas)
- [Stack Tecnológico](#-stack-tecnológico)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Puesta en Marcha Local](#-puesta-en-marcha-local)
  - [Requisitos Previos](#requisitos-previos)
  - [Paso a Paso](#paso-a-paso)
- [Configuración de Variables de Entorno](#-configuración-de-variables-de-entorno)
- [Scripts Disponibles](#-scripts-disponibles)
- [Despliegue en Producción](#-despliegue-en-producción)
- [Contacto y Portafolio](#-contacto-y-portafolio)

---

## 💡 Acerca del Proyecto

**Questify** es una aplicación SaaS *fullstack* diseñada para educadores, creadores de contenido y equipos que buscan elevar la interacción y el aprendizaje a través de dinámicas interactivas.

El proyecto aborda un problema común: la creación de cuestionarios y encuestas de calidad suele ser un proceso manual, lento y poco atractivo para la audiencia. Questify soluciona esto combinando:

1. **Generación automática con IA:** Transforma cualquier tema o apunte en un quiz interactivo con retroalimentación en cuestión de segundos.
2. **Gamificación y experiencia de usuario:** Desafíos con temporizador, tablas de clasificación públicas (*Leaderboards*) y diseño interactivo de alta conversión.
3. **Monetización real para SaaS:** Modelo de suscripciones *Freemium* / *Pro* con gestión automatizada de productos, precios y webhooks mediante Polar.sh.
4. **Enfoque global:** Soporte nativo para múltiples idiomas desde el primer día.

Este proyecto fue desarrollado como parte de mi portafolio para demostrar la implementación de un producto digital completo, desde la concepción de la arquitectura y la experiencia de usuario hasta la integración de servicios de producción como pagos, IA y bases de datos distribuidas.

---

## ✨ Características Principales

### 🤖 Generación de Contenido Asistida por IA
- Integración con **Google Gemini** y **OpenAI** mediante el SDK unificado de Vercel AI.
- Creación inteligente de preguntas con múltiples opciones, explicaciones contextuales y calibración automática de nivel de dificultad.
- Selector dinámico de proveedor y modelo configurable directamente desde el panel de administración.

### 🎯 Quizzes y Encuestas Interactivas
- **Editor visual e intuitivo:** Diseña cuestionarios evaluativos y encuestas de opinión pública o privada.
- **Mecánicas de evaluación:** Temporizadores configurables, puntaje ponderado y cálculo inmediato de resultados.
- **Leaderboards públicos:** Tablas de clasificación en tiempo real para fomentar la competencia sana y el compromiso.
- **Enlaces compartibles:** Cada quiz o encuesta genera una URL pública optimizada y responsiva lista para compartir en redes o comunidades.

### 📊 Métricas y Analíticas en Tiempo Real
- Panel de métricas con gráficos visuales impulsados por **Recharts**.
- Tasa de finalización, respuestas por opción, precisión promedio y participación en el tiempo.

### 💳 Monetización SaaS y Facturación Automatizada
- Integración de suscripciones con **Polar.sh**.
- Planes Free y Pro con control de acceso a características avanzadas.
- **Sincronización automática de webhooks:** Configuración dinámica de productos, precios y eventos desde el panel administrativo sin requerir edición manual de variables de entorno para cada plan.

### 🌐 Soporte Multilingüe (i18n)
- Soporte completo para **Español** e **Inglés** mediante **next-intl**.
- Enrutamiento localizado (`/es` y `/en`), selector de idioma dinámico y mensajes completamente traducidos tanto en landing como en dashboard.

### 🔐 Autenticación y Seguridad
- Gestión de sesiones y autenticación segura con **Better Auth**.
- Inicio de sesión con correo/contraseña y soporte para **Google OAuth**.
- Control de acceso basado en roles (**RBAC**): Usuarios estándar y Administradores.

### 🛠️ Panel de Control y Administración
- Vista centralizada para gestionar usuarios, roles y métricas de la plataforma.
- Ajustes en caliente de proveedores de IA y entornos de pago (Sandbox vs. Production).

---

## 🏛️ Arquitectura y Decisiones Técnicas

Este proyecto está construido siguiendo buenas prácticas de ingeniería de software para mantener el código desacoplado, mantenible y escalable:

- **Feature-Driven Architecture (Estructura por Módulos):** En lugar de agrupar por tipo de archivo, la lógica de negocio se divide en dominios dentro de `features/` (`quizzes`, `polls`, `ai`, `billing`, `admin`, `overview`, `auth`). Esto aísla responsabilidades y facilita el crecimiento de la base de código.
- **Next.js 16 App Router & React 19:** Uso exhaustivo de Server Components para minimizar el JavaScript enviado al cliente, junto con Server Actions para mutaciones seguras y tipadas.
- **Base de Datos Distribuida en el Edge:** Uso de **Turso (libSQL)** junto con **Drizzle ORM**, permitiendo baja latencia, esquemas declarativos en TypeScript, migraciones predecibles y *type-safety* integral desde la base de datos hasta la interfaz.
- **Validación Estricta de Datos:** Tipado y validación de formularios de extremo a extremo mediante **Zod** y `@tanstack/react-form`.
- **Diseño UI/UX Accesible y Responsivo:** Construido con **Tailwind CSS v4**, componentes basados en **Radix / Base UI**, feedback visual inmediato con **Sonner** y soporte nativo para modo claro y oscuro con **next-themes**.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnologías |
| :--- | :--- |
| **Frontend & UI** | [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [Lucide React](https://lucide.dev/), [Recharts](https://recharts.org/), [Sonner](https://sonner.emilkowal.ski/) |
| **Backend & APIs** | Next.js Server Actions, Route Handlers, TypeScript |
| **Base de Datos & ORM** | [Turso](https://turso.tech/) (libSQL serverless/edge), [Drizzle ORM](https://orm.drizzle.team/), Drizzle Kit |
| **Autenticación** | [Better Auth](https://better-auth.com/) (Email/Password + Google OAuth 2.0) |
| **Inteligencia Artificial** | Vercel AI SDK (`ai`), Google Gemini API (`@ai-sdk/google`), OpenAI API (`@ai-sdk/openai`) |
| **Pagos y Suscripciones** | [Polar.sh SDK](https://polar.sh/) (`@polar-sh/sdk`, `@polar-sh/better-auth`) |
| **Internacionalización** | [next-intl](https://next-intl-docs.vercel.app/) (Español / Inglés) |
| **Entorno de Ejecución** | [Bun](https://bun.sh/) (Runtime y gestor de paquetes de alto rendimiento) |

---

## 📁 Estructura del Proyecto

```text
questify/
├── app/                      # App Router de Next.js
│   ├── [locale]/             # Rutas con localización (i18n: /es, /en)
│   │   ├── (auth)/           # Flujos de inicio de sesión y registro
│   │   ├── (dashboard)/      # Panel principal, analíticas y gestión
│   │   ├── (public)/         # Vistas públicas (quizzes, encuestas, resultados)
│   │   └── page.tsx          # Landing page principal
│   └── api/                  # Endpoints de API (Auth, Webhooks de Polar, etc.)
├── features/                 # Lógica de negocio modularizada por dominio
│   ├── admin/                # Administración de plataforma, usuarios y ajustes
│   ├── ai/                   # Generación de contenido y prompts con IA
│   ├── auth/                 # Componentes y flujos de autenticación
│   ├── billing/              # Planes de suscripción y facturación
│   ├── overview/             # Métricas y resúmenes del usuario
│   ├── polls/                # Creación, votación y resultados de encuestas
│   ├── quizzes/              # Motor interactivo de quizzes y leaderboards
│   └── subscriptions/        # Estado de membresías y límites de cuenta
├── components/               # Componentes transversales y UI (Shadcn / Base UI)
├── lib/                      # Clientes de BD (Drizzle/Turso), configuración y utilidades
├── messages/                 # Diccionarios de traducción (en.json, es.json)
├── drizzle/                  # Migraciones SQL y metadatos de esquema
└── i18n/                     # Configuración y middleware de internacionalización
```

---

## 🚀 Puesta en Marcha Local

Sigue estos pasos para ejecutar Questify en tu entorno local.

### Requisitos Previos

- [Node.js](https://nodejs.org/) (versión 20.9 o superior)
- [Bun](https://bun.sh/) instalado globalmente
- Una base de datos en [Turso](https://turso.tech/) (nivel gratuito disponible)
- Claves de API opcionales si deseas habilitar IA ([Google AI Studio](https://aistudio.google.com/) o [OpenAI](https://platform.openai.com/)), autenticación social ([Google Cloud Console](https://console.cloud.google.com/)) o pagos ([Polar.sh](https://polar.sh/)).

### Paso a Paso

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/chriszumario/questify.git
   cd questify
   ```

2. **Instalar dependencias:**
   ```bash
   bun install
   ```

3. **Configurar las variables de entorno:**
   Copia el archivo de ejemplo y completa tus credenciales:
   ```bash
   cp .env.example .env
   ```

4. **Sincronizar la base de datos:**
   Aplica el esquema de Drizzle directamente en tu base de datos de Turso:
   ```bash
   bun run db:push
   ```

5. **Iniciar el servidor de desarrollo:**
   ```bash
   bun dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

6. **Crear el primer usuario administrador (Opcional pero recomendado):**
   - Regístrate en la aplicación desde `http://localhost:3000/sign-up`.
   - En una terminal separada, ejecuta:
     ```bash
     bun run db:seed
     ```
   - Este comando promoverá al primer usuario a **Administrador** y le asignará el plan **Pro** para probar todas las funciones.

---

## 🔐 Configuración de Variables de Entorno

El archivo `.env` requiere las siguientes variables clave:

| Variable | Requerida | Propósito | Ejemplo / Formato |
| :--- | :---: | :--- | :--- |
| `BETTER_AUTH_SECRET` | Sí | Firma y encriptación de sesiones de Better Auth. | Generar con `openssl rand -hex 32` |
| `BETTER_AUTH_URL` | Sí | URL base de la aplicación. | `http://localhost:3000` |
| `NEXT_PUBLIC_APP_URL` | Sí | URL pública accesible para redirecciones y cliente. | `http://localhost:3000` |
| `TURSO_DATABASE_URL` | Sí | Endpoint de conexión libSQL provisto por Turso. | `libsql://tu-db.turso.io` |
| `TURSO_AUTH_TOKEN` | Sí | Token de autenticación de tu base de datos Turso. | `eyJhbGci...` |
| `GOOGLE_GENERATIVE_AI_API_KEY`| Opcional | Clave para generación de quizzes con Gemini. | Obtenida en Google AI Studio |
| `OPENAI_API_KEY` | Opcional | Clave alternativa para modelos de OpenAI. | `sk-...` |
| `GOOGLE_CLIENT_ID` | Opcional | Client ID para autenticación con Google. | Google Cloud OAuth Credentials |
| `GOOGLE_CLIENT_SECRET` | Opcional | Client Secret para Google OAuth. | Google Cloud OAuth Credentials |
| `POLAR_ACCESS_TOKEN` | Opcional | Token de organización de Polar para pagos. | `polar_oat_...` |

> [!TIP]
> Si no configuras las claves de Google OAuth o de IA inicialmente, la aplicación seguirá funcionando con autenticación por contraseña y creación manual de quizzes.

---

## 📜 Scripts Disponibles

El proyecto incluye comandos de conveniencia gestionados a través de `bun`:

| Script | Descripción |
| :--- | :--- |
| `bun dev` | Inicia el entorno de desarrollo con recarga rápida. |
| `bun run build` | Compila la aplicación para producción. |
| `bun start` | Inicia el servidor de producción compilado. |
| `bun run lint` | Ejecuta el linter ESLint para asegurar estándares de código. |
| `bun run typecheck` | Comprueba tipos en todo el proyecto mediante TypeScript (`tsc --noEmit`). |
| `bun run format` | Aplica formato al código con Prettier y plugins de Tailwind. |
| `bun run db:push` | Sincroniza el esquema TypeScript de Drizzle con la base de datos de Turso. |
| `bun run db:generate` | Genera archivos de migración SQL a partir de cambios en el esquema. |
| `bun run db:migrate` | Ejecuta las migraciones pendientes en la base de datos. |
| `bun run db:studio` | Abre **Drizzle Studio** en el navegador para inspeccionar los datos visualmente. |
| `bun run db:seed` | Asigna rol de administrador y plan Pro al primer usuario registrado. |

---

## 🌐 Despliegue en Producción

Questify está optimizado para desplegarse fácilmente en plataformas como **Vercel**, **Railway** o servidores con Node.js / Docker:

1. **Base de Datos:** Crea una base de datos de producción en Turso y ejecuta `bun run db:push` o `bun run db:migrate`.
2. **Variables de Entorno:** Configura las variables en el panel de tu hosting con URLs de producción en HTTPS (`BETTER_AUTH_URL` y `NEXT_PUBLIC_APP_URL`).
3. **Google OAuth (si aplica):** Añade la URI de redirección de producción en Google Cloud:
   `https://tu-dominio.com/api/auth/callback/google`
4. **Pagos con Polar:** En el panel de Questify (**Dashboard > Admin > Platform Settings > Payments**), selecciona el entorno de producción y guarda tu token de Polar. El webhook público `https://tu-dominio.com/api/polar/webhooks` se registrará automáticamente vía API.

---

## 👤 Contacto y Portafolio

- **GitHub:** [@chriszumario](https://github.com/chriszumario)
- **Repositorio:** [questify](https://github.com/chriszumario/questify)
- **Contacto:** christian12@gmail.com

Si tienes sugerencias, comentarios, no dudes en escribirme o abrir un *Issue* en el repositorio.

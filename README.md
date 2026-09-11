# Questify

Questify es una aplicación SaaS multilingüe para crear cuestionarios (quizzes) y encuestas (polls), generar contenido con IA, consultar analíticas y vender suscripciones Pro a través de Polar.

Esta guía explica cómo instalar Questify localmente, configurar sus servicios, preparar la base de datos, crear el primer administrador y desplegar la aplicación.

## Stack tecnológico

- Next.js 16 y React 19
- TypeScript
- Better Auth con correo/contraseña y Google OAuth opcional
- Drizzle ORM con Turso/libSQL
- Google Gemini u OpenAI para la generación con IA
- Polar para suscripciones y pagos
- next-intl con soporte para inglés y español

## Requisitos

Instala el siguiente software antes de continuar:

- [Node.js](https://nodejs.org/) 20.9 o superior
- [Bun](https://bun.sh/)
- Una base de datos en [Turso](https://turso.tech/)
- Git, si vas a clonar el proyecto desde un repositorio

Las siguientes cuentas son opcionales y solo se requieren para sus características correspondientes:

- [Google Cloud Console](https://console.cloud.google.com/) para inicio de sesión con Google
- [Google AI Studio](https://aistudio.google.com/) para Gemini
- [OpenAI](https://platform.openai.com/) para modelos de OpenAI
- [Polar](https://polar.sh/) para suscripciones Pro

## 1. Instalar el proyecto

Clona o extrae el proyecto, abre una terminal en su directorio raíz e instala las dependencias:

```bash
bun install
```

## 2. Configurar variables de entorno

Crea un archivo local `.env` a partir del ejemplo incluido.

En macOS o Linux:

```bash
cp .env.example .env
```

En Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Abre `.env` y configura los valores descritos a continuación.

### Variables obligatorias

| Variable              | Descripción                                                                                               |
| --------------------- | --------------------------------------------------------------------------------------------------------- |
| `BETTER_AUTH_SECRET`  | Secreto utilizado por Better Auth para proteger los datos de autenticación. Genera uno con `openssl rand -hex 32`. |
| `BETTER_AUTH_URL`     | Origen de la aplicación. Usa `http://localhost:3000` en local.                                             |
| `TURSO_DATABASE_URL`  | URL de libSQL mostrada en el panel de la base de datos de Turso.                                          |
| `TURSO_AUTH_TOKEN`    | Token de autenticación para la base de datos de Turso.                                                     |
| `NEXT_PUBLIC_APP_URL` | Origen público de la aplicación. Usa `http://localhost:3000` en local.                                    |

Ejemplo:

```dotenv
BETTER_AUTH_SECRET=reemplaza_por_un_secreto_largo_y_aleatorio
BETTER_AUTH_URL=http://localhost:3000

TURSO_DATABASE_URL=libsql://nombre-de-tu-base-de-datos.turso.io
TURSO_AUTH_TOKEN=tu_token_de_autenticacion_turso

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Nunca subas `.env`, tokens de acceso, claves de API o secretos de webhooks al control de versiones.

### Inicio de sesión con Google (opcional)

Crea una aplicación web OAuth 2.0 en Google Cloud y agrega esta URI de redirección local autorizada:

```text
http://localhost:3000/api/auth/callback/google
```

Luego agrega las credenciales a `.env`:

```dotenv
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret
```

Si omites estas variables, la autenticación con correo y contraseña seguirá disponible y la opción de inicio de sesión con Google estará deshabilitada.

### Generación con IA (opcional)

Configura al menos un proveedor si deseas utilizar la generación con IA:

```dotenv
GOOGLE_GENERATIVE_AI_API_KEY=tu_api_key_de_gemini
OPENAI_API_KEY=tu_api_key_de_openai
```

Después de crear un administrador, selecciona el proveedor activo y el modelo desde **Dashboard > Admin > Platform Settings > AI Configuration**.

### Suscripciones con Polar (opcional)

Questify solo requiere una variable de entorno para Polar:

```dotenv
POLAR_ACCESS_TOKEN=polar_oat_tu_token_de_acceso_de_organizacion
```

Crea un token de acceso de organización en el panel de Polar. El token debe pertenecer al mismo entorno de Polar seleccionado en Questify.

Después de crear el administrador:

1. Abre **Dashboard > Admin > Platform Settings > Payments**.
2. Selecciona **Sandbox** durante las pruebas.
3. Configura el precio, la moneda, el intervalo de facturación y las funciones Pro.
4. Guarda la configuración.

Questify crea o actualiza el producto de Polar, el precio recurrente y el webhook público automáticamente mediante el SDK de Polar. No es necesario agregar IDs de productos ni secretos de webhooks a `.env`.

## 3. Preparar la base de datos

Crea las tablas en la base de datos de Turso a partir del esquema actual de Drizzle:

```bash
bun run db:push
```

Comandos útiles para la base de datos:

| Comando               | Propósito                                                               |
| --------------------- | ----------------------------------------------------------------------- |
| `bun run db:generate` | Generar migraciones SQL tras modificar el esquema.                      |
| `bun run db:migrate`  | Aplicar las migraciones generadas.                                      |
| `bun run db:push`     | Sincronizar el esquema actual directamente con la base de datos configurada. |
| `bun run db:studio`   | Abrir Drizzle Studio.                                                   |
| `bun run db:check`    | Validar los archivos de migración.                                      |

## 4. Iniciar Questify

Ejecuta el servidor de desarrollo:

```bash
bun dev
```

Abre [http://localhost:3000](http://localhost:3000). Questify enrutará la aplicación a uno de sus idiomas compatibles:

- Inglés: `http://localhost:3000/en`
- Español: `http://localhost:3000/es`

## 5. Crear el primer administrador

El seed estándar asciende al primer usuario registrado a administrador y activa el plan Pro para esa cuenta.

1. Inicia Questify y registra un usuario mediante correo/contraseña o Google.
2. Mantén la aplicación ejecutándose y abre una segunda terminal.
3. Ejecuta:

```bash
bun run db:seed
```

4. Recarga la aplicación. La cuenta ahora tendrá acceso al panel de administración.

Ejecuta este seed únicamente después de que exista al menos un usuario registrado. Actualiza al primer usuario devuelto por la base de datos.

## Comprobaciones de calidad

Antes de desplegar o enviar cambios, ejecuta:

```bash
bun run typecheck
bun run lint
bun run build
```

## Despliegue en producción

Questify se puede desplegar en Vercel o en cualquier otro proveedor de alojamiento de Node.js.

1. Crea una base de datos de Turso para producción y aplica el esquema o las migraciones.
2. Agrega las variables de entorno de `.env` en el proveedor de alojamiento. Usa secretos y URLs de producción.
3. Configura tanto `BETTER_AUTH_URL` como `NEXT_PUBLIC_APP_URL` con el origen HTTPS final.
4. Si el inicio de sesión con Google está habilitado, agrega esta URI de redirección de producción en Google Cloud:

   ```text
   https://tu-dominio.com/api/auth/callback/google
   ```

5. Despliega la aplicación.
6. Registra al primer usuario de producción y ejecuta el seed en la base de datos de producción si deseas que esa cuenta sea el administrador.
7. Abre la configuración de pagos, selecciona **Production** y guarda con un token de organización de Polar de producción.

Guardar la configuración de pagos desde un despliegue HTTPS público permite a Questify registrar este webhook automáticamente:

```text
https://tu-dominio.com/api/polar/webhooks
```

## Solución de problemas

### Los cambios de entorno no se aplican

Reinicia el servidor de desarrollo después de editar `.env`.

### Google devuelve un error de URI de redirección

Verifica que la URI de redirección de Google OAuth coincida exactamente con el origen de la aplicación y termine en `/api/auth/callback/google`.

### El panel de administración no es visible

Registra un usuario antes de ejecutar `bun run db:seed`, luego cierra sesión e inicia sesión nuevamente si la sesión existente aún conserva el rol anterior.

### Las peticiones a Polar fallan

Confirma que `POLAR_ACCESS_TOKEN` sea un token de acceso de organización y que pertenezca al entorno Sandbox o Production seleccionado en los ajustes de pago.

### El comando de base de datos no puede conectarse

Verifica `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN`, luego confirma que el token tenga acceso a la base de datos seleccionada de Turso.

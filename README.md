# TicoAutos - Backend 🚙

Servidor Web API y lógica central del ecosistema TicoAutos. Desarrollado bajo un esquema de Arquitectura Orientada a Servicios (SOA), garantizando alto rendimiento, modularización estricta y comunicación segura tanto para interfaces REST como GraphQL.

Este proyecto fue desarrollado como Proyecto Final para el curso **Programación en Ambiente Web II** (ISW-711) de la Universidad Técnica Nacional (UTN).

---

## 📋 Requerimientos Implementados

Este backend expone robustamente el cumplimiento de los requerimientos de la evaluación:

1.  **Validación con Padrón Nacional:** Integración HTTP (vía Axios/Fetch) en el endpoint de registro, el cual consulta la Cédula Nacional en el API Público. Rechaza inscripciones inexistentes y autocompleta el nombre y apellido si es válida.
2.  **Verificación SendGrid (Email Verification):** Al registrar una cuenta, el usuario queda en estado "Pendiente". El sistema envía un UUID o Hash firmado usando una integración de Emailing a su bandeja, activando la cuenta al resolver la ruta.
3.  **Google OAuth2 (Login & Registro):** Flujo de autenticación estructurado mediante PassportJS y estrategias de Google. Incluye el proceso de interceptación si un usuario nuevo proviene de Google y requiere validación de edad obligatoria mediante su Cédula de Identidad.
4.  **Verificación en Dos Pasos (2FA - SMS):** Integración con servicios de mensajería (Twilio/Alternativos). Autentica las contraseñas, despacha un número OTP vía mensaje de texto, y retiene el Token JWT de autorización real hasta que se valide el código.
5.  **Capa GraphQL Integrada:** Apollo Server inyectado en la instancia de NestJS que expone servicios como los datos de Vehículos mediante Resolvers de GraphQL. Comparte el mismo contexto y barreras de seguridad (Guards) que REST, autorizándose a través del mismo token JWT.
6.  **Validación de Mensajes de Chat con OpenAI:** A través de un Custom Service (`AiService`), el flujo de envío de mensajes hacia la base de datos es retenido y analizado por una instrucción de Inteligencia Artificial ("gpt-3.5-turbo" / "gpt-4o-mini"). La IA escanea por números de teléfono, enlaces o emails y rechaza la inserción indicando la regla dictaminada.
7.  **Diagramado Arquitectónico:** Total cumplimiento de la separación y esquema mediante un diagrama ilustrativo de la solución final.

---

## 🛠 Tecnologías Utilizadas

-   **Node.js & TypeScript**
-   **NestJS** (Framework Arquitectónico, Dependency Injection)
-   **MongoDB & Mongoose** (Bases de datos no relacionales, Modelos, ODM)
-   **GraphQL & Apollo Driver** (Consultas declarativas y resolutores)
-   **Passport.js & JWT** (Manejo de estados sin sesiones, estrategias Google y Locales)
-   **OpenAI SDK** (Machine Learning/Validación Inteligente)
-   **Git** (Control de Versiones estricto en ramas main y flujos convencionales)

---

## 🚀 Guía de Instalación y Ejecución Local

Para levantar el nodo de servidor:

### 1. Clonar el repositorio
```bash
git clone https://github.com/jrodriguezes/backend-tico-autos-II.git
cd backend-tico-autos-II
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Variables de Entorno
Debes crear un archivo `.env` en la raíz de tu proyecto e introducir la configuración vital. Reemplaza los datos con los reales proporcionados en la integración:
```env
# Ejemplo de .env
PORT=3000
MONGODB_URI=mongodb+srv://tu-usuario:tu-pass@cluster...
JWT_SECRET=tu_clave_secreta_aqui
GOOGLE_CLIENT_ID=tu_cliente_id_google
GOOGLE_CLIENT_SECRET=tu_secreto_google
OPENAI_API_KEY=sk-tu_key_de_openai
# Y otras variables de correo (Sendgrid) o SMS (Twilio)...
```

### 4. Iniciar el Servidor
Para arrancar NestJS en modo desarrollo con Hot-Reload:
```bash
npm run start:dev
```
El API estará localmente expuesta por defecto en `http://localhost:3000`.

---

## 🧱 Estructura y Mejores Prácticas (Clean Code)

Se han implementado y respetado lineamientos de Código Limpio y principios SOLID guiados por NestJS:
-   Archivos separados rigurosamente por su función (`.controller.ts`, `.service.ts`, `.module.ts`, `.schema.ts`, `.resolver.ts`).
-   Uso de **Data Transfer Objects (DTOs)** para validar los JSON entrantes con `class-validator` y `class-transformer`.
-   Nomenclatura consistente en inglés para servicios de código y commits semánticos de Git.

---

## 🧱 Diagrama del sistema:
<img width="1672" height="941" alt="ChatGPT Image May 4, 2026, 10_42_55 PM" src="https://github.com/user-attachments/assets/961b6f7a-f6d4-44b6-bd16-be8a5fc28edf" />


*Desarrollado para la Universidad Técnica Nacional - 2026*

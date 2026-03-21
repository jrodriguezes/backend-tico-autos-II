# TicoAutos - Backend API

## Descripción del Proyecto
Este es el componente **Backend** de la plataforma TicoAutos. Se trata de una robusta Web API desarrollada bajo una arquitectura de microservicios utilizando el estilo arquitectónico **REST**. El sistema gestiona la persistencia de datos, la lógica de negocio de vehículos, la autenticación de usuarios y la intermediación de mensajes entre compradores y vendedores.

---

## Información Académica
*   **Institución:** Universidad Técnica Nacional (UTN)
*   **Carrera:** Ingeniería del Software
*   **Curso:** Programación en Ambiente Web II (ISW-711)
*   **Profesor:** Bladimir Arroyo
*   **Entrega:** Proyecto Final - Marzo 2026

---

## Tecnologías Utilizadas
*   **Framework:** [NestJS](https://nestjs.com/) (Node.js)
*   **Base de Datos:** [MongoDB](https://www.mongodb.com/) (vía Mongoose)
*   **Lenguaje:** TypeScript
*   **Autenticación:** [Passport.js](https://www.passportjs.org/) + JSON Web Tokens (JWT)
*   **Seguridad:** Bcrypt (Hashing de contraseñas)
*   **Gestión de Archivos:** [Multer](https://github.com/expressjs/multer) (para subida de imágenes de vehículos)
*   **Validación:** Class-validator & Class-transformer

---

## Estructura del Proyecto
El código se organiza siguiendo el patrón modular de NestJS:
```text
/src
├── database/         # Configuración y conexión a MongoDB
├── modules/
│   ├── auth/         # Estrategias (JWT/Local) y servicio de autenticación
│   ├── chat/         # Lógica de mensajes, chats y estados de turnos
│   ├── users/        # Gestión de perfiles y búsqueda por ID de usuario
│   └── vehicles/     # CRUD de vehículos, filtros dinámicos y subida de fotos
├── main.ts           # Punto de entrada de la aplicación
└── app.module.ts     # Módulo raíz que integra todos los componentes
```

---

## Instalación y Ejecución

### Requisitos Previos
*   Node.js (v20.20.0 recomendado)
*   NPM (v10.8.2 recomendado)
*   Nest CLI (`npm install -g @nestjs/cli`)

### Pasos
1.  **Clonar el repositorio:**
    ```bash
    git clone [url-del-repositorio]
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar variables de entorno:**
    Cree un archivo `.env` en la raíz con:
    ```env
    DATABASE_URL="tu_url_de_mongodb"
    JWT_SECRET="tu_llave_secreta_super_segura"
    ```

4.  **Ejecutar en modo desarrollo:**
    ```bash
    npm run start:dev
    ```

5.  **Compilar para producción:**
    ```bash
    npm run build
    ```

---

## Características Técnicas Implementadas
*   **Arquitectura REST:** Endpoints limpios y semánticos para todas las entidades (User, Vehicle, Question, Answer).
*   **Seguridad:** Rutas protegidas mediante Guards de Passport. Validación de tokens en cada petición privada.
*   **Filtros Dinámicos:** Implementación de consultas avanzadas en MongoDB mediante parámetros Query, permitiendo rangos de precios, años y filtrado por texto (insensitive-case).
*   **Paginación:** Sistema de `skip` y `limit` en el backend para optimizar la transferencia de datos.
*   **Gestión de Chat:** Lógica de negocio para manejar turnos entre el dueño y el cliente interesado, asegurando que solo los actores correctos participen en la conversación.
*   **Validación de DTOS:** Aseguramiento de la integridad de los datos entrantes mediante decoradores de validación.

---

## Endpoints Principales (Resumen)

### Auth
- `POST /auth/register`: Registro de nuevos usuarios.
- `POST /auth/login`: Autenticación y retorno de JWT.
- `GET /auth/me`: Perfil del usuario autenticado.

### Vehículos
- `GET /vehicles`: Lista paginada con filtros opcionales.
- `POST /vehicles`: Creación de vehículo (requiere imagen y JWT).
- `PATCH /vehicles/:id`: Edición de datos e imagen.
- `DELETE /vehicles/:id`: Eliminación física del registro.

### Chats & Mensajería
- `GET /chats/inbox`: Lista de chats activos para el usuario.
- `POST /chats/message`: Envío de preguntas o respuestas.
- `GET /chats/history`: Historial completo de una negociación específica.
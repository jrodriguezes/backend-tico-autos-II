# TicoAutos - Backend 🚙
Web API Server and core logic of the TicoAutos ecosystem. Developed under a Service-Oriented Architecture (SOA) scheme, ensuring high performance, strict modularization, and secure communication for both REST and GraphQL interfaces.
This project was developed as the Final Project for the **Web Environment Programming II** (ISW-711) course at the Universidad Técnica Nacional (UTN).
---
## 🖼 Project Preview
<img width="1920" height="1536" alt="645shots_so" src="https://github.com/user-attachments/assets/f2adac53-c398-4eb4-94b2-7a675ed50dbd" />
<img width="1920" height="1536" alt="173shots_so" src="https://github.com/user-attachments/assets/37020e5a-c8dc-4815-a419-33be99a2cd83" />
<img width="1920" height="1536" alt="999shots_so" src="https://github.com/user-attachments/assets/bf46838d-70d5-432e-bd38-39990a8e3c55" />
<img width="1920" height="1536" alt="501shots_so" src="https://github.com/user-attachments/assets/2185544a-822b-425f-997f-26decf36e98d" />
<img width="1920" height="1536" alt="530shots_so" src="https://github.com/user-attachments/assets/9a3aa510-384a-470e-92d1-9336d04aa7f3" />
## 📋 Implemented Requirements
This backend robustly demonstrates compliance with the evaluation requirements:
1.  **National Registry Validation:** HTTP integration (via Axios/Fetch) in the registration endpoint, which queries the National ID in the Public API. It rejects non-existent registrations and auto-completes the first and last name if valid.
2.  **SendGrid Verification (Email Verification):** When registering an account, the user is placed in a "Pending" state. The system sends a UUID or signed Hash using an Emailing integration to their inbox, activating the account upon resolving the route.
3.  **Google OAuth2 (Login & Registration):** Structured authentication flow using PassportJS and Google strategies. Includes the interception process if a new user comes from Google and requires mandatory age validation via their National ID Card.
4.  **Two-Factor Authentication (2FA - SMS):** Integration with messaging services (Twilio/Alternatives). Authenticates passwords, dispatches an OTP number via text message, and retains the real authorization JWT Token until the code is validated.
5.  **Integrated GraphQL Layer:** Apollo Server injected into the NestJS instance that exposes services like Vehicle data through GraphQL Resolvers. It shares the same context and security barriers (Guards) as REST, authorizing through the same JWT token.
6.  **Chat Message Validation with OpenAI:** Through a Custom Service (`AiService`), the flow of sending messages to the database is retained and analyzed by an Artificial Intelligence instruction ("gpt-3.5-turbo" / "gpt-4o-mini"). The AI scans for phone numbers, links, or emails and rejects the insertion indicating the dictated rule.
7.  **Architectural Diagramming:** Full compliance with the separation and scheme through an illustrative diagram of the final solution.
---
## 🛠 Technologies Used
-   **Node.js & TypeScript**
-   **NestJS** (Architectural Framework, Dependency Injection)
-   **MongoDB & Mongoose** (Non-relational databases, Models, ODM)
-   **GraphQL & Apollo Driver** (Declarative queries and resolvers)
-   **Passport.js & JWT** (Stateless state management, Google and Local strategies)
-   **OpenAI SDK** (Machine Learning/Intelligent Validation)
-   **Git** (Strict Version Control on main branches and conventional flows)
---
## 🚀 Local Installation and Execution Guide
To start the server node:
### 1. Clone the repository
```bash
git clone https://github.com/jrodriguezes/backend-tico-autos-II.git
cd backend-tico-autos-II
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
You must create a .env file in the root of your project and input the vital configuration. Replace the data with the real ones provided in the integration:
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

### 4. Start the Server
To start NestJS in development mode with Hot-Reload:
```bash
npm run start:dev
```
The API will be exposed locally by default at `http://localhost:3000`.

---

## 🧱 Structure and Best Practices (Clean Code)

Clean Code guidelines and SOLID principles guided by NestJS have been implemented and respected:
-   Files strictly separated by their function (.controller.ts, .service.ts, .module.ts, .schema.ts, .resolver.ts).
-   Use of Data Transfer Objects (DTOs) to validate incoming JSONs with class-validator and class-transformer.
-   Consistent English nomenclature for code services and semantic Git commits.

---

## 🧱 System Diagram:
<img width="1672" height="941" alt="ChatGPT Image May 4, 2026, 10_42_55 PM" src="https://github.com/user-attachments/assets/961b6f7a-f6d4-44b6-bd16-be8a5fc28edf" />

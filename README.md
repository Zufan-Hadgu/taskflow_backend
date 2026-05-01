# 📦 NestJS Starter Project Structure

This project was generated using NestJS, a progressive Node.js framework for building scalable server-side applications.

---

## 📁 Root-Level Files

### `package.json`
Defines project metadata, dependencies, and scripts.

- Common scripts:
  - `start` → Run the app
  - `start:dev` → Run in development mode (hot reload)
  - `build` → Compile TypeScript

---

### `package-lock.json`
Locks dependency versions to ensure consistent installations across environments.

---

### `tsconfig.json`
Main TypeScript configuration file.

- Controls how TypeScript compiles the project
- Defines module system, target version, and paths

---

### `tsconfig.build.json`
Production-specific TypeScript configuration.

- Excludes test files
- Optimized for builds

---

### `nest-cli.json`
Configuration file for Nest CLI.

- Defines source root (`src`)
- Controls build behavior

---

### `.eslintrc.js`
ESLint configuration for maintaining code quality and consistency.

---

### `.prettierrc`
Prettier configuration for consistent code formatting.

---

### `.gitignore`
Specifies files and folders Git should ignore.

- Examples:
  - `node_modules/`
  - `dist/`
  - `.env`

---

### `.env`
Stores environment variables.

- Used for API keys, database credentials, etc.
- Should not be committed to version control

---

## 📁 `src/` — Application Source Code

Contains the core logic of the application.

---

### `main.ts`
Application entry point.

- Bootstraps the NestJS app
- Starts the server

---

### `app.module.ts`
Root module of the application.

- Connects controllers and services
- Organizes dependencies

---

### `app.controller.ts`
Handles incoming HTTP requests.

- Defines routes (e.g., GET, POST)

---

### `app.service.ts`
Contains business logic.

- Used by controllers
- Handles data processing and operations

---

### `app.controller.spec.ts`
Unit tests for the controller.

- Ensures expected behavior

---

## 🧠 Architecture Overview

- **Controller** → Handles incoming requests  
- **Service** → Contains business logic  
- **Module** → Organizes application structure  
- **main.ts** → Starts the application  

---

## 🔄 Request Flow

1. Client sends request  
2. Request reaches Controller  
3. Controller calls Service  
4. Service processes logic  
5. Response is returned to Controller  
6. Controller sends response to client  

---

## ⚡ Summary

- `main.ts` → Entry point  
- `Module` → Structure and organization  
- `Controller` → Request handling  
- `Service` → Core logic  
- `Spec files` → Testing  

---
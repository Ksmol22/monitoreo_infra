# Monitoreo de Infraestructura

Sistema de monitoreo de infraestructura construido con **Vue.js 3** y **Node.js/Express**.

## 🚀 Stack Tecnológico

### Frontend
- **Vue 3** - Framework progresivo de JavaScript
- **TypeScript** - Tipado estático
- **Vue Router** - Enrutamiento
- **Pinia** - State management
- **TanStack Query (Vue Query)** - Data fetching y caching
- **PrimeVue** - Componentes UI
- **Tailwind CSS** - Framework CSS
- **Lucide Vue** - Iconos
- **Vite** - Build tool

### Backend
- **Node.js** - Runtime de JavaScript
- **Express 5** - Framework web
- **TypeScript** - Tipado estático
- **Drizzle ORM** - ORM para PostgreSQL
- **PostgreSQL** - Base de datos
- **Passport.js** - Autenticación
- **WebSockets** - Comunicación en tiempo real

## 📦 Instalación

```bash
# Instalar dependencias
npm install --legacy-peer-deps

# Configurar base de datos
npm run db:push

# Modo desarrollo
npm run dev

# Build para producción
npm run build

# Iniciar producción
npm start
```

## 🏗️ Estructura del Proyecto

```
Proyecto/
├── client/                  # Frontend Vue.js
│   ├── src/
│   │   ├── components/     # Componentes Vue
│   │   ├── composables/    # Composables (lógica reutilizable)
│   │   ├── pages/          # Páginas/Vistas
│   │   ├── lib/            # Utilidades
│   │   ├── App.vue         # Componente raíz
│   │   ├── main.ts         # Punto de entrada
│   │   └── router.ts       # Configuración de rutas
│   └── index.html
├── server/                  # Backend Node.js/Express
│   ├── db.ts               # Configuración de base de datos
│   ├── index.ts            # Servidor principal
│   ├── routes.ts           # Rutas API
│   └── storage.ts          # Capa de datos
├── shared/                  # Código compartido
│   ├── router.ts           # Definición de rutas API
│   └── schema.ts           # Esquemas y tipos
└── package.json
```

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz:

```env
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/monitoreo
NODE_ENV=development
```

## 📱 Funcionalidades

- ✅ Dashboard con métricas en tiempo real
- ✅ Monitoreo de bases de datos
- ✅ Monitoreo de servidores Windows
- ✅ Monitoreo de servidores Linux
- ✅ Sistema de logs con filtros
- ✅ Actualización automática de datos
- ✅ Interfaz responsive

## 🔒 Seguridad

El proyecto incluye las siguientes medidas de seguridad:

- Validación de datos con Zod
- Sesiones seguras con express-session
- Autenticación con Passport.js
- Prepared statements con Drizzle ORM

## 🛠️ Desarrollo

```bash
# Verificar tipos TypeScript
npm run check

# Push cambios al schema de DB
npm run db:push
```

## 📄 Licencia

MIT

## 👥 Contribución

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request.

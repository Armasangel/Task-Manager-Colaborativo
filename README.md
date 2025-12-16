# 📋 Task Manager - Gestor de Tareas Colaborativo

Un sistema completo de gestión de tareas estilo Kanban con colaboración en tiempo real, desarrollado con el stack MERN (MongoDB, Express, React, Node.js).

![Stack](https://img.shields.io/badge/Stack-MERN-green)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Node](https://img.shields.io/badge/Node.js-18+-green)
![MongoDB](https://img.shields.io/badge/MongoDB-6+-brightgreen)

## ✨ Características

### 🔐 Autenticación y Seguridad
- Sistema de login y registro
- Autenticación JWT
- Protección de rutas
- Sesiones persistentes

### 📊 Gestión de Tableros
- Crear tableros personalizados
- Colores de fondo configurables
- Editar y eliminar tableros
- Vista de todos los tableros del usuario

### 📝 Sistema Kanban
- Vista de tablero con columnas (To Do, In Progress, Done)
- Drag & Drop entre columnas
- Crear, editar y eliminar tareas
- Asignar tareas a miembros
- Prioridades (Baja, Media, Alta)
- Fechas de vencimiento
- Etiquetas personalizadas

### 👥 Colaboración
- Agregar miembros por email
- Sistema de roles (Admin / Miembro)
- Ver todos los miembros del tablero
- Eliminar miembros

### ⚡ Tiempo Real
- Actualización automática de tareas con Socket.io
- Sincronización en tiempo real entre usuarios
- Notificaciones de cambios

### 🎨 Interfaz Moderna
- Diseño responsivo con Tailwind CSS
- Animaciones suaves
- Tema con degradados
- Notificaciones toast
- Indicadores de carga

## 🛠️ Tecnologías

### Backend
- **Node.js** - Runtime de JavaScript
- **Express** - Framework web
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticación
- **Socket.io** - WebSockets para tiempo real
- **bcryptjs** - Encriptación de contraseñas

### Frontend
- **React** - Librería de UI
- **React Router** - Navegación
- **Axios** - Cliente HTTP
- **Socket.io Client** - WebSockets
- **@dnd-kit** - Drag and Drop
- **Tailwind CSS** - Estilos
- **Lucide React** - Iconos
- **React Hot Toast** - Notificaciones

## 📦 Instalación

### Requisitos Previos
- Node.js 18 o superior
- MongoDB instalado y ejecutándose
- npm o yarn

### 1. Clonar el repositorio
\`\`\`bash
git clone <tu-repo>
cd task-manager
\`\`\`

### 2. Configurar el Backend
\`\`\`bash
cd server
npm install
\`\`\`

Crear archivo `.env`:
\`\`\`env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=tu_clave_secreta_muy_segura
NODE_ENV=development
\`\`\`

### 3. Configurar el Frontend
\`\`\`bash
cd ../client
npm install
\`\`\`

Crear archivo `.env`:
\`\`\`env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
\`\`\`

### 4. Iniciar MongoDB
\`\`\`bash
# Con Docker
docker run -d -p 27017:27017 mongo

# O localmente
mongod
\`\`\`

### 5. Ejecutar el proyecto

**Terminal 1 - Backend:**
\`\`\`bash
cd server
npm run dev
\`\`\`

**Terminal 2 - Frontend:**
\`\`\`bash
cd client
npm start
\`\`\`

La aplicación estará disponible en:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 📁 Estructura del Proyecto

\`\`\`
task-manager/
├── server/                 # Backend
│   ├── models/            # Modelos de Mongoose
│   │   ├── User.js
│   │   ├── Board.js
│   │   └── Task.js
│   ├── routes/            # Rutas de la API
│   │   ├── auth.js
│   │   ├── boards.js
│   │   ├── tasks.js
│   │   └── users.js
│   ├── middleware/        # Middlewares
│   │   └── auth.js
│   ├── .env
│   ├── server.js
│   └── package.json
│
└── client/                # Frontend
    ├── public/
    ├── src/
    │   ├── components/    # Componentes React
    │   │   ├── AddMemberModal.js
    │   │   ├── BoardSettingsModal.js
    │   │   ├── CreateBoardModal.js
    │   │   ├── CreateTaskModal.js
    │   │   ├── EditTaskModal.js
    │   │   ├── KanbanBoard.js
    │   │   ├── KanbanColumn.js
    │   │   └── TaskCard.js
    │   ├── context/       # Context API
    │   │   └── AuthContext.js
    │   ├── pages/         # Páginas
    │   │   ├── Board.js
    │   │   ├── Dashboard.js
    │   │   ├── Login.js
    │   │   └── Register.js
    │   ├── services/      # Servicios
    │   │   ├── api.js
    │   │   └── socket.js
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    └── package.json
\`\`\`

## 🔑 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener usuario actual

### Tableros
- `GET /api/boards` - Listar tableros del usuario
- `GET /api/boards/:id` - Obtener tablero específico
- `POST /api/boards` - Crear tablero
- `PUT /api/boards/:id` - Actualizar tablero
- `DELETE /api/boards/:id` - Eliminar tablero
- `POST /api/boards/:id/members` - Agregar miembro
- `DELETE /api/boards/:id/members/:userId` - Eliminar miembro

### Tareas
- `GET /api/tasks/board/:boardId` - Listar tareas de un tablero
- `POST /api/tasks` - Crear tarea
- `PUT /api/tasks/:id` - Actualizar tarea
- `DELETE /api/tasks/:id` - Eliminar tarea
- `PATCH /api/tasks/reorder` - Reordenar tareas (drag & drop)

### Usuarios
- `GET /api/users/search?email=` - Buscar usuarios por email

## 🚀 Deployment

### Backend (Railway/Heroku)
1. Configurar variables de entorno en la plataforma
2. Conectar con MongoDB Atlas
3. Deploy del código del backend

### Frontend (Vercel/Netlify)
1. Configurar variables de entorno
2. Build command: `npm run build`
3. Deploy del código del frontend

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es de código abierto y está disponible bajo la Licencia MIT.


## 🙏 Agradecimientos

- React y su increíble ecosistema
- La comunidad de Node.js
- Socket.io por hacer el tiempo real tan fácil
- Tailwind CSS por los estilos increíbles
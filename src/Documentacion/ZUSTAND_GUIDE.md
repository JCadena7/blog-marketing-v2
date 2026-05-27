# 🐻 Guía de Zustand - Gestión de Estado

Esta aplicación usa **Zustand** para la gestión de estado global. Zustand es una librería ligera, simple y poderosa para manejar estado en React.

---

## 📦 Stores Disponibles

### 1. **authStore** - Autenticación

Maneja todo lo relacionado con autenticación de usuarios.

```typescript
import { useAuthStore } from '../stores';

function MyComponent() {
  // Obtener estado
  const { user, isAuthenticated, isLoading } = useAuthStore();
  
  // Obtener acciones
  const { login, logout, register } = useAuthStore();
  
  // Usar acciones
  const handleLogin = async () => {
    try {
      await login({ email: 'user@example.com', password: 'password' });
      // Login exitoso
    } catch (error) {
      // Manejar error
    }
  };
}
```

**Estado disponible:**
- `user: User | null` - Usuario actual
- `token: string | null` - Token JWT
- `isAuthenticated: boolean` - Si está autenticado
- `isLoading: boolean` - Si está cargando
- `error: string | null` - Error actual

**Acciones disponibles:**
- `login(credentials)` - Iniciar sesión
- `register(userData)` - Registrar usuario
- `logout()` - Cerrar sesión
- `checkAuth()` - Verificar autenticación
- `clearError()` - Limpiar errores
- `setUser(user)` - Actualizar usuario

**Características:**
- ✅ Persistencia en localStorage
- ✅ Auto-validación de tokens
- ✅ Manejo de errores

---

### 2. **notificationStore** - Notificaciones

Maneja notificaciones toast/snackbar.

```typescript
import { useNotificationStore } from '../stores';

function MyComponent() {
  const addNotification = useNotificationStore((state) => state.addNotification);
  
  const showSuccess = () => {
    addNotification({
      type: 'success',
      title: '¡Éxito!',
      message: 'Operación completada correctamente',
      duration: 5000 // opcional, default 5000ms
    });
  };
  
  const showError = () => {
    addNotification({
      type: 'error',
      title: 'Error',
      message: 'Algo salió mal',
    });
  };
}
```

**Tipos de notificaciones:**
- `success` - Verde, para operaciones exitosas
- `error` - Rojo, para errores
- `warning` - Amarillo, para advertencias
- `info` - Azul, para información

**Acciones:**
- `addNotification(notification)` - Agregar notificación
- `removeNotification(id)` - Remover notificación específica
- `clearAll()` - Limpiar todas las notificaciones

**Características:**
- ✅ Auto-dismiss después de duración
- ✅ Animaciones con Framer Motion
- ✅ Stack de notificaciones
- ✅ IDs únicos automáticos

---

### 3. **uiStore** - UI Global

Maneja estado de la interfaz de usuario.

```typescript
import { useUIStore } from '../stores';

function MyComponent() {
  // Theme
  const { theme, setTheme } = useUIStore();
  
  // Sidebar
  const { sidebarOpen, toggleSidebar } = useUIStore();
  
  // Modals
  const { activeModal, openModal, closeModal } = useUIStore();
  
  // Loading
  const { globalLoading, setGlobalLoading } = useUIStore();
}
```

**Estado disponible:**
- `theme: 'light' | 'dark' | 'system'` - Tema actual
- `sidebarOpen: boolean` - Estado del sidebar
- `mobileMenuOpen: boolean` - Estado del menú móvil
- `globalLoading: boolean` - Loading global
- `activeModal: string | null` - Modal activo
- `searchOpen: boolean` - Estado del search

**Acciones:**
- `setTheme(theme)` - Cambiar tema
- `toggleSidebar()` - Toggle sidebar
- `setSidebarOpen(open)` - Abrir/cerrar sidebar
- `toggleMobileMenu()` - Toggle menú móvil
- `setMobileMenuOpen(open)` - Abrir/cerrar menú móvil
- `setGlobalLoading(loading)` - Activar/desactivar loading
- `openModal(modalId)` - Abrir modal
- `closeModal()` - Cerrar modal
- `toggleSearch()` - Toggle search
- `setSearchOpen(open)` - Abrir/cerrar search

**Características:**
- ✅ Persistencia de theme y sidebar
- ✅ Responsive (sidebar/mobile menu)

---

### 4. **postsStore** - Posts

Maneja el estado de posts y filtros.

```typescript
import { usePostsStore } from '../stores';

function MyComponent() {
  const { posts, isLoading, fetchPosts } = usePostsStore();
  const { updatePost, deletePost } = usePostsStore();
  const { filters, setFilters, getFilteredPosts } = usePostsStore();
  
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);
  
  const filteredPosts = getFilteredPosts();
  const pendingCount = usePostsStore((state) => state.getPendingCount());
}
```

**Estado:**
- `posts: Post[]` - Lista de posts
- `selectedPost: Post | null` - Post seleccionado
- `isLoading: boolean` - Estado de carga
- `error: string | null` - Error actual
- `filters` - Filtros activos

**Acciones:**
- `fetchPosts()` - Cargar posts
- `setSelectedPost(post)` - Seleccionar post
- `updatePost(id, status)` - Actualizar post
- `deletePost(id)` - Eliminar post
- `setFilters(filters)` - Aplicar filtros
- `clearFilters()` - Limpiar filtros
- `getFilteredPosts()` - Obtener posts filtrados
- `getPendingCount()` - Contar posts pendientes

---

## 🎯 Patrones de Uso

### Patrón 1: Selector Específico (Recomendado)

Usa selectores para evitar re-renders innecesarios:

```typescript
// ✅ BUENO - Solo re-renderiza cuando user cambia
const user = useAuthStore((state) => state.user);

// ❌ MALO - Re-renderiza en cualquier cambio del store
const { user } = useAuthStore();
```

### Patrón 2: Múltiples Selectores

```typescript
const user = useAuthStore((state) => state.user);
const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
const login = useAuthStore((state) => state.login);
```

### Patrón 3: Selector con Computación

```typescript
const pendingPosts = usePostsStore((state) => 
  state.posts.filter(p => p.status === 'pending')
);
```

### Patrón 4: Acciones Fuera de Componentes

```typescript
// utils/auth.ts
import { useAuthStore } from '../stores';

export function checkUserPermission(permission: string): boolean {
  const user = useAuthStore.getState().user;
  return user?.permissions.includes(permission) || false;
}
```

---

## 🔥 Ejemplos Prácticos

### Ejemplo 1: Login Form

```typescript
import { useAuthStore } from '../stores';
import { useNotificationStore } from '../stores';

function LoginForm() {
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const addNotification = useNotificationStore((state) => state.addNotification);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login({ email, password });
      addNotification({
        type: 'success',
        title: '¡Bienvenido!',
        message: 'Has iniciado sesión correctamente',
      });
      navigate('/dashboard');
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Credenciales incorrectas',
      });
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button disabled={isLoading}>
        {isLoading ? 'Cargando...' : 'Iniciar Sesión'}
      </button>
    </form>
  );
}
```

### Ejemplo 2: Protected Route

```typescript
import { useAuthStore } from '../stores';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}
```

### Ejemplo 3: Theme Switcher

```typescript
import { useUIStore } from '../stores';
import { Sun, Moon, Monitor } from 'lucide-react';

function ThemeSwitcher() {
  const { theme, setTheme } = useUIStore();
  
  return (
    <div className="flex space-x-2">
      <button onClick={() => setTheme('light')}>
        <Sun className={theme === 'light' ? 'text-yellow-500' : ''} />
      </button>
      <button onClick={() => setTheme('dark')}>
        <Moon className={theme === 'dark' ? 'text-blue-500' : ''} />
      </button>
      <button onClick={() => setTheme('system')}>
        <Monitor className={theme === 'system' ? 'text-gray-500' : ''} />
      </button>
    </div>
  );
}
```

### Ejemplo 4: Posts Dashboard

```typescript
import { usePostsStore } from '../stores';
import { useEffect } from 'react';

function PostsDashboard() {
  const fetchPosts = usePostsStore((state) => state.fetchPosts);
  const isLoading = usePostsStore((state) => state.isLoading);
  const getFilteredPosts = usePostsStore((state) => state.getFilteredPosts);
  const setFilters = usePostsStore((state) => state.setFilters);
  
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);
  
  const posts = getFilteredPosts();
  
  return (
    <div>
      <input
        type="text"
        placeholder="Buscar..."
        onChange={(e) => setFilters({ search: e.target.value })}
      />
      
      <select onChange={(e) => setFilters({ status: e.target.value as any })}>
        <option value="all">Todos</option>
        <option value="published">Publicados</option>
        <option value="draft">Borradores</option>
        <option value="pending">Pendientes</option>
      </select>
      
      {isLoading ? (
        <div>Cargando...</div>
      ) : (
        <div>
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 🚀 Setup en la Aplicación

### 1. Agregar NotificationContainer

En tu layout principal o App.tsx:

```typescript
import NotificationContainer from './components/notifications/NotificationContainer';

function App() {
  return (
    <>
      <YourRoutes />
      <NotificationContainer />
    </>
  );
}
```

### 2. Inicializar Auth al Cargar

```typescript
import { useAuthStore } from './stores';
import { useEffect } from 'react';

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  
  useEffect(() => {
    checkAuth(); // Verifica token guardado
  }, [checkAuth]);
  
  return <YourApp />;
}
```

---

## 💡 Tips y Mejores Prácticas

### 1. **Evita Re-renders Innecesarios**

```typescript
// ✅ BUENO
const user = useAuthStore((state) => state.user);
const login = useAuthStore((state) => state.login);

// ❌ MALO
const { user, token, isAuthenticated, error, login, logout } = useAuthStore();
```

### 2. **Usa Shallow para Objetos**

```typescript
import { shallow } from 'zustand/shallow';

const { user, isAuthenticated } = useAuthStore(
  (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
  shallow
);
```

### 3. **Acciones Asíncronas con Try-Catch**

```typescript
const handleAction = async () => {
  try {
    await someAction();
    // Success
  } catch (error) {
    // Handle error
  }
};
```

### 4. **Computed Values**

```typescript
// En el store
getFilteredPosts: () => {
  const { posts, filters } = get();
  return posts.filter(/* logic */);
}

// En el componente
const filteredPosts = usePostsStore((state) => state.getFilteredPosts());
```

### 5. **DevTools**

Zustand tiene DevTools integradas. Instala la extensión de Redux DevTools en tu navegador para ver el estado.

---

## 📚 Recursos

- [Documentación Oficial de Zustand](https://github.com/pmndrs/zustand)
- [Zustand Middleware](https://github.com/pmndrs/zustand#middleware)
- [Persist Middleware](https://github.com/pmndrs/zustand#persist-middleware)

---

## 🎓 Comparación con Context API

| Característica | Zustand | Context API |
|----------------|---------|-------------|
| **Boilerplate** | Mínimo | Mucho |
| **Performance** | Excelente | Puede causar re-renders |
| **DevTools** | ✅ Sí | ❌ No |
| **Persistencia** | ✅ Built-in | ❌ Manual |
| **TypeScript** | ✅ Excelente | ⚠️ Requiere más setup |
| **Bundle Size** | ~1KB | 0KB (nativo) |
| **Curva de aprendizaje** | Baja | Media |

---

**¡Zustand está listo para usar en tu aplicación! 🎉**

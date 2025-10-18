# 🔄 Guía de Migración: Mock → API Real

Esta guía te ayudará a migrar tus servicios de datos mock a una API real de forma gradual y segura.

## 📋 Tabla de Contenidos

1. [Configuración Inicial](#configuración-inicial)
2. [Migración Paso a Paso](#migración-paso-a-paso)
3. [Checklist de Migración](#checklist-de-migración)
4. [Troubleshooting](#troubleshooting)

---

## Configuración Inicial

### 1. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Desarrollo local con mock
VITE_USE_REAL_API=false
VITE_API_BASE_URL=http://localhost:3000/api

# Producción con API real
# VITE_USE_REAL_API=true
# VITE_API_BASE_URL=https://api.tudominio.com
```

### 2. Actualizar Configuración

Edita `/src/config/api.ts`:

```typescript
export const API_CONFIG = {
  USE_REAL_API: import.meta.env.VITE_USE_REAL_API === 'true' || false,
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  // ... resto de la configuración
};
```

---

## Migración Paso a Paso

### Paso 1: Preparar el Backend

Asegúrate de que tu API tenga estos endpoints:

```
GET    /api/users              → Listar usuarios
GET    /api/users/:id          → Obtener usuario
POST   /api/users              → Crear usuario
PATCH  /api/users/:id          → Actualizar usuario
DELETE /api/users/:id          → Eliminar usuario
PATCH  /api/users/:id/role     → Cambiar rol
PATCH  /api/users/:id/status   → Cambiar estado
```

### Paso 2: Verificar Estructura de Datos

Asegúrate de que la API devuelva datos con la misma estructura que los tipos TypeScript:

```typescript
// Tipo en TypeScript
interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  status: 'active' | 'inactive' | 'suspended';
  // ...
}

// Respuesta de la API debe coincidir
{
  "id": 1,
  "username": "admin_master",
  "email": "admin@example.com",
  // ...
}
```

### Paso 3: Probar con un Servicio

Empieza con un servicio simple como `usersService.ts`:

```typescript
// 1. El servicio ya está refactorizado
// 2. Cambia el flag en config/api.ts
USE_REAL_API: true

// 3. Prueba en desarrollo
npm run dev

// 4. Verifica en consola del navegador
// Deberías ver las peticiones HTTP reales
```

### Paso 4: Manejo de Errores

Implementa manejo de errores apropiado:

```typescript
async function getAllUsersApi(): Promise<User[]> {
  try {
    const users = await apiClient.get<User[]>(API_CONFIG.ENDPOINTS.USERS);
    return users;
  } catch (error) {
    if (error instanceof ApiError) {
      // Manejo específico según el código de error
      if (error.status === 401) {
        // Redirigir a login
        window.location.href = '/login';
      } else if (error.status === 403) {
        // Mostrar mensaje de permisos insuficientes
        console.error('No tienes permisos para esta acción');
      }
    }
    console.error('Error fetching users from API:', error);
    return []; // Fallback a array vacío
  }
}
```

### Paso 5: Testing

Crea tests para ambas capas:

```typescript
// users.test.ts
import { getAllUsers } from './usersService';
import { API_CONFIG } from '../config/api';

describe('Users Service', () => {
  describe('Mock Mode', () => {
    beforeAll(() => {
      API_CONFIG.USE_REAL_API = false;
    });

    it('should return mock users', async () => {
      const users = await getAllUsers();
      expect(users.length).toBeGreaterThan(0);
    });
  });

  describe('API Mode', () => {
    beforeAll(() => {
      API_CONFIG.USE_REAL_API = true;
    });

    it('should fetch users from API', async () => {
      const users = await getAllUsers();
      expect(users).toBeDefined();
    });
  });
});
```

---

## Checklist de Migración

### ✅ Pre-Migración

- [ ] Backend API está desplegado y accesible
- [ ] Endpoints documentados y probados con Postman/Insomnia
- [ ] Estructura de datos coincide con tipos TypeScript
- [ ] Autenticación implementada (si aplica)
- [ ] CORS configurado correctamente

### ✅ Durante Migración

- [ ] Variables de entorno configuradas
- [ ] Servicio refactorizado con capas mock/API
- [ ] Manejo de errores implementado
- [ ] Loading states agregados en UI
- [ ] Tests escritos y pasando

### ✅ Post-Migración

- [ ] Todas las funcionalidades probadas en staging
- [ ] Performance monitoreada
- [ ] Logs de errores revisados
- [ ] Documentación actualizada
- [ ] Equipo capacitado en nueva arquitectura

---

## Troubleshooting

### Problema: CORS Error

```
Access to fetch at 'http://localhost:3000/api/users' from origin 
'http://localhost:5173' has been blocked by CORS policy
```

**Solución**: Configura CORS en tu backend

```javascript
// Express.js ejemplo
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

### Problema: 401 Unauthorized

```
ApiError: Unauthorized
```

**Solución**: Agrega token de autenticación

```typescript
// En apiClient.ts
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  ...fetchOptions.headers,
}
```

### Problema: Datos no coinciden con tipos

```
TypeError: Cannot read property 'firstName' of undefined
```

**Solución**: Valida y transforma la respuesta

```typescript
async function getAllUsersApi(): Promise<User[]> {
  try {
    const response = await apiClient.get<any>(API_CONFIG.ENDPOINTS.USERS);
    
    // Validar y transformar si es necesario
    const users = Array.isArray(response) ? response : response.data;
    
    return users.map(user => ({
      ...user,
      // Asegurar que todos los campos requeridos existen
      firstName: user.firstName || user.first_name || '',
      lastName: user.lastName || user.last_name || '',
    }));
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}
```

### Problema: Timeout en peticiones lentas

```
ApiError: Request timeout
```

**Solución**: Aumenta el timeout

```typescript
// En config/api.ts
TIMEOUT: 60000, // 60 segundos

// O por petición
await apiClient.get<User[]>('/users', { timeout: 60000 });
```

### Problema: Datos mock vs API diferentes

**Solución**: Crea adaptadores

```typescript
// adapters/userAdapter.ts
export function adaptApiUserToUser(apiUser: any): User {
  return {
    id: apiUser.id,
    username: apiUser.username,
    email: apiUser.email,
    firstName: apiUser.first_name, // API usa snake_case
    lastName: apiUser.last_name,
    role: apiUser.role,
    status: apiUser.is_active ? 'active' : 'inactive',
    // ... mapear resto de campos
  };
}
```

---

## 🎯 Estrategia de Migración Recomendada

### Opción 1: Migración Gradual (Recomendada)

1. **Semana 1**: Migrar servicios de solo lectura (GET)
   - `getAllUsers()`
   - `getProfile()`
   - `getAnalytics()`

2. **Semana 2**: Migrar operaciones de escritura simples (POST, PATCH)
   - `updateProfile()`
   - `updateUserStatus()`

3. **Semana 3**: Migrar operaciones complejas
   - `uploadAvatar()`
   - `changeUserRole()`

4. **Semana 4**: Testing exhaustivo y optimización

### Opción 2: Migración por Módulo

1. Migrar módulo de usuarios completo
2. Migrar módulo de posts completo
3. Migrar módulo de comentarios completo
4. Migrar módulo de analytics completo

### Opción 3: Feature Flags

Implementa feature flags para controlar qué servicios usan API:

```typescript
// config/features.ts
export const FEATURES = {
  USE_API_USERS: true,
  USE_API_POSTS: false,
  USE_API_COMMENTS: false,
  USE_API_ANALYTICS: false,
};

// En el servicio
export async function getAllUsers(): Promise<User[]> {
  const useApi = FEATURES.USE_API_USERS && useRealApi();
  return useApi ? getAllUsersApi() : getAllUsersMock();
}
```

---

## 📚 Recursos Adicionales

- [Documentación de Fetch API](https://developer.mozilla.org/es/docs/Web/API/Fetch_API)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [REST API Best Practices](https://restfulapi.net/)
- [Error Handling in JavaScript](https://javascript.info/try-catch)

---

## 💬 Soporte

Si encuentras problemas durante la migración:

1. Revisa los logs en consola del navegador
2. Verifica los logs del backend
3. Usa las herramientas de desarrollo (Network tab)
4. Consulta esta guía de troubleshooting
5. Contacta al equipo de backend

---

**¡Buena suerte con la migración! 🚀**

# 🔐 Gestión de Tokens - Implementado

## ✅ Problema Resuelto

**Antes:** El token se guardaba en `localStorage` pero **NO se enviaba** en las peticiones HTTP.

**Ahora:** El token se guarda Y se envía automáticamente en todas las peticiones.

## 🔧 Implementación

### 1. Guardar Token (AuthContext)

```typescript
// src/contexts/AuthContext.tsx
const login = async (userData: User, token: string) => {
  // ✅ Guardar en localStorage
  localStorage.setItem('auth_token', token);
  localStorage.setItem('user_data', JSON.stringify(userData));
  
  // Actualizar estado
  setUser(userData);
  setAuthToken(token);
};
```

### 2. Enviar Token Automáticamente (ApiClient)

```typescript
// src/lib/apiClient.ts
class ApiClient {
  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}) {
    // ✅ Obtener token de localStorage
    const token = this.getAuthToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // ✅ Agregar header Authorization si hay token
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        ...headers,
        ...fetchOptions.headers,
      },
    });
    
    return response.json();
  }
}
```

## 🎯 Flujo Completo

### Login
```
1. Usuario ingresa credenciales
2. Frontend → POST /auths/sign-in { email, password }
3. Backend → Responde { user, token }
4. Frontend guarda en localStorage:
   - auth_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   - user_data: { id, email, firstName, ... }
5. Frontend actualiza estado de AuthContext
6. Redirección a /admin/dashboard
```

### Peticiones Subsecuentes
```
1. Usuario hace cualquier acción (crear post, comentar, etc.)
2. ApiClient lee token de localStorage
3. ApiClient agrega header: Authorization: Bearer <token>
4. Backend valida el token
5. Backend responde con los datos
```

### Logout
```
1. Usuario hace logout
2. Frontend limpia localStorage:
   - auth_token ❌
   - user_data ❌
3. Frontend limpia estado de AuthContext
4. Redirección a /auth
```

## 🔍 Debugging

### Ver Token en Consola

En modo desarrollo, verás logs automáticos:

```
🔐 Token incluido en petición: eyJhbGciOiJIUzI1Ni...
```

O si no hay token:

```
⚠️ No hay token disponible para esta petición
```

### Ver Token en DevTools

1. Abre DevTools (F12)
2. Ve a **Application** → **Local Storage** → `http://localhost:4321`
3. Busca la clave `auth_token`
4. Verás el JWT completo

### Ver Token en Network

1. Abre DevTools (F12)
2. Ve a **Network**
3. Haz una petición (crear post, etc.)
4. Click en la petición
5. Ve a **Headers** → **Request Headers**
6. Busca: `Authorization: Bearer eyJhbGci...`

## 📊 Endpoints que Requieren Token

### Protegidos (requieren autenticación)
- ✅ `POST /posts` - Crear post
- ✅ `PATCH /posts/:id` - Actualizar post
- ✅ `DELETE /posts/:id` - Eliminar post
- ✅ `POST /comentarios` - Crear comentario
- ✅ `PATCH /users/:id` - Actualizar usuario
- ✅ `GET /users/me` - Obtener usuario actual
- ✅ Todos los endpoints de admin

### Públicos (NO requieren token)
- ✅ `POST /auths/sign-in` - Login
- ✅ `POST /auths/sign-up` - Registro
- ✅ `GET /posts` - Listar posts públicos
- ✅ `GET /posts/:id` - Ver post público
- ✅ `GET /categorias` - Listar categorías

## 🔒 Seguridad

### Token JWT
- **Formato:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.signature`
- **Contiene:** ID de usuario, email, rol, permisos
- **Expiración:** Configurada en el backend (ej: 24h)
- **Validación:** El backend verifica la firma en cada petición

### Almacenamiento
- **Dónde:** `localStorage` (accesible solo desde el mismo dominio)
- **Alternativa:** Cookies con `httpOnly` (más seguro, pero requiere cambios en backend)

### Buenas Prácticas Implementadas
- ✅ Token se envía en header `Authorization: Bearer <token>`
- ✅ Token se limpia al hacer logout
- ✅ Token se valida en el backend
- ✅ Logs solo en desarrollo (no en producción)

## ⚠️ Manejo de Errores

### Token Expirado (401)
```typescript
// TODO: Implementar refresh token
if (response.status === 401) {
  // Limpiar token inválido
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_data');
  
  // Redirigir a login
  window.location.href = '/auth';
}
```

### Token Inválido
El backend responderá con `401 Unauthorized` y el frontend debe:
1. Limpiar localStorage
2. Limpiar estado de AuthContext
3. Redirigir a `/auth`

## 🚀 Próximos Pasos

### 1. Refresh Token (Recomendado)
Implementar sistema de refresh token para renovar tokens expirados sin pedir login nuevamente.

### 2. Interceptor de Errores 401
```typescript
// Agregar en apiClient.ts
if (response.status === 401) {
  // Limpiar sesión
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_data');
  
  // Redirigir a login
  window.location.href = '/auth';
}
```

### 3. Token en Cookies (Más Seguro)
Cambiar de `localStorage` a cookies `httpOnly` para mayor seguridad contra XSS.

## 📝 Verificación Rápida

Para verificar que todo funciona:

1. **Login:** Ingresa credenciales válidas
2. **Verifica localStorage:** Debe tener `auth_token`
3. **Haz una acción protegida:** Crear un post, comentario, etc.
4. **Revisa Network:** El header `Authorization` debe estar presente
5. **Logout:** El token debe eliminarse de localStorage

## ✅ Checklist

- [x] Token se guarda en localStorage al login
- [x] Token se envía en header Authorization
- [x] Token se incluye en todas las peticiones (GET, POST, PUT, PATCH, DELETE)
- [x] Token se incluye en uploads de archivos
- [x] Token se limpia al logout
- [x] Logs de debugging en desarrollo
- [ ] Interceptor para errores 401
- [ ] Refresh token implementado
- [ ] Migración a cookies httpOnly

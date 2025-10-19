# 🔧 Fix: Persistencia de Sesión

## ❌ Problemas Encontrados

### 1. Usuario Mock Cargado Automáticamente
**Problema:** Después del login, al recargar la página, se cargaba un usuario mock en lugar de mantener la sesión real.

**Causa:** En `AuthContext.tsx`, cuando no había token, automáticamente cargaba `getCurrentUser()` (usuario mock).

### 2. Validación de Token Incorrecta
**Problema:** La función `validateToken` usaba lógica mock que buscaba usuarios en `mockUsers`.

**Causa:** La función no estaba preparada para tokens JWT reales del backend.

---

## ✅ Soluciones Implementadas

### 1. AuthContext.tsx - Lógica de Inicialización

**Antes:**
```typescript
} else {
  // Fallback to mock user for development
  const storedId = localStorage.getItem('mock_user_id');
  if (storedId) {
    const found = mockUsers.find(u => u.id === Number(storedId));
    setUser(found || getCurrentUser());
  } else {
    const currentUser = getCurrentUser();  // ❌ Siempre carga mock
    setUser(currentUser);
  }
}
```

**Después:**
```typescript
} else {
  // No stored token/user - check if we should load mock user for development
  // Only load mock user if explicitly set via mock_user_id (for testing/preview)
  const storedId = localStorage.getItem('mock_user_id');
  if (storedId) {
    const found = mockUsers.find(u => u.id === Number(storedId));
    if (found) {
      setUser(found);  // ✅ Solo si hay mock_user_id explícito
    }
  }
  // Otherwise, leave user as null (not authenticated)  ✅
}
```

**Cambios:**
- ✅ Ya NO carga usuario mock automáticamente
- ✅ Solo carga mock si hay `mock_user_id` explícito (para testing)
- ✅ Si no hay sesión, deja `user = null` (no autenticado)

### 2. authService.ts - Validación de Token Real

**Antes:**
```typescript
export const validateToken = (token: string): User | null => {
  try {
    const payload = JSON.parse(atob(token));  // ❌ No funciona con JWT
    if (payload.exp < Date.now()) {
      return null;
    }
    return mockUsers.find(user => user.id === payload.id) || null;  // ❌ Busca en mock
  } catch {
    return null;
  }
};
```

**Después:**
```typescript
export const validateToken = (token: string): User | null => {
  try {
    if (!token) return null;
    
    // ✅ Decode JWT token (format: header.payload.signature)
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    // ✅ Decode payload (base64url con reemplazo de caracteres)
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    
    // ✅ Check if token is expired (exp en segundos, Date.now() en ms)
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      console.log('⚠️ Token expirado');
      return null;
    }
    
    // ✅ Get user data from localStorage (saved during login)
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user_data');
      if (storedUser) {
        return JSON.parse(storedUser);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error validating token:', error);
    return null;
  }
};
```

**Cambios:**
- ✅ Decodifica JWT correctamente (3 partes: header.payload.signature)
- ✅ Maneja base64url (reemplaza `-` y `_`)
- ✅ Valida expiración correctamente (exp * 1000 porque JWT usa segundos)
- ✅ Lee usuario de `localStorage` en lugar de `mockUsers`
- ✅ Maneja errores correctamente

---

## 🔄 Flujo Completo Ahora

### Login
```
1. Usuario ingresa credenciales
2. authService.loginApi() → Backend
3. Backend responde: { accessToken, refreshToken, user }
4. authService mapea: accessToken → token
5. authService guarda: refresh_token en localStorage
6. AuthContext.login() recibe: { user, token }
7. AuthContext guarda: auth_token, user_data en localStorage
8. AuthContext actualiza estado: setUser(), setAuthToken()
9. Redirige a /admin/dashboard
```

### Recarga de Página
```
1. AuthContext.initAuth() se ejecuta
2. Lee de localStorage: auth_token, user_data
3. validateToken(auth_token) → Decodifica JWT
4. Verifica expiración: payload.exp * 1000 < Date.now()
5. Si válido: Lee user_data y restaura sesión ✅
6. Si inválido: Limpia localStorage y user = null ✅
7. Si no hay token: user = null (no autenticado) ✅
```

### Logout
```
1. Usuario hace logout
2. AuthContext.logout()
3. Limpia localStorage: auth_token, refresh_token, user_data
4. Actualiza estado: user = null, authToken = null
5. Redirige a /auth
```

---

## 🧪 Pruebas

### Caso 1: Login Exitoso
```
✅ Token guardado en localStorage
✅ Usuario guardado en localStorage
✅ Estado actualizado correctamente
✅ Redirige a /admin/dashboard
```

### Caso 2: Recarga de Página (Con Sesión Válida)
```
✅ Lee token de localStorage
✅ Valida token (no expirado)
✅ Restaura usuario de localStorage
✅ Mantiene sesión activa
```

### Caso 3: Recarga de Página (Sin Sesión)
```
✅ No hay token en localStorage
✅ user = null
✅ isAuthenticated = false
✅ Redirige a /auth (si está en ruta protegida)
```

### Caso 4: Token Expirado
```
✅ Lee token de localStorage
✅ Valida token → expirado
✅ Limpia localStorage
✅ user = null
✅ Redirige a /auth
```

---

## 📊 Decodificación de JWT

### Estructura del Token
```
eyJhbGciOiJIUzI1NiIsImtpZCI6IjAyWFRjdkNoVTBiTnZIWEgiLCJ0eXAiOiJKV1QifQ
.
eyJpc3MiOiJodHRwczovL2hncmFsZG9hamtjeWphZXVlbWVsLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiIwNDA4ZDJlNy1mNDZhLTRjYzUtOGMyYi1jYThhYWE1ZmQ0ZDMiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzYwODUzNDQ2LCJpYXQiOjE3NjA4NDk4NDYsImVtYWlsIjoianVnYWRvci0yQGdtYWlsLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsiZW1haWwiOiJqdWdhZG9yLTJAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwic3ViIjoiMDQwOGQyZTctZjQ2YS00Y2M1LThjMmItY2E4YWFhNWZkNGQzIn0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NjA4NDk4NDZ9XSwic2Vzc2lvbl9pZCI6IjEyM2RmMDhiLWQ1ZmYtNGY5Yy1hYWNkLTFhOTliNTZjOTI5NyIsImlzX2Fub255bW91cyI6ZmFsc2V9
.
pMdwnuDqaFAWzQxqxYIf7QVqIffdXjXf8pn-ZVtTqU4
```

### Partes del Token
1. **Header** (parte 1): Algoritmo y tipo
2. **Payload** (parte 2): Datos del usuario y expiración
3. **Signature** (parte 3): Firma para verificar autenticidad

### Payload Decodificado
```json
{
  "iss": "https://...",
  "sub": "0408d2e7-f46a-4cc5-8c2b-ca8aaa5fd4d3",
  "aud": "authenticated",
  "exp": 1760853446,  // ⚠️ En SEGUNDOS (no milisegundos)
  "iat": 1760849846,
  "email": "jugador-2@gmail.com",
  "role": "authenticated",
  "session_id": "123df08b-d5ff-4f9c-aacd-1a99b56c9297"
}
```

### Validación de Expiración
```typescript
// ❌ INCORRECTO
if (payload.exp < Date.now()) {
  // payload.exp está en segundos
  // Date.now() está en milisegundos
  // Siempre será true (token siempre "expirado")
}

// ✅ CORRECTO
if (payload.exp * 1000 < Date.now()) {
  // Convertir exp a milisegundos
  return null; // Token expirado
}
```

---

## ✅ Checklist de Verificación

- [x] validateToken decodifica JWT correctamente
- [x] validateToken valida expiración correctamente
- [x] validateToken lee usuario de localStorage
- [x] AuthContext NO carga usuario mock automáticamente
- [x] AuthContext mantiene sesión después de recargar
- [x] AuthContext limpia sesión cuando token es inválido
- [x] Login guarda token y usuario correctamente
- [x] Logout limpia todo correctamente

---

## 🎯 Resultado Final

**Ahora la sesión se mantiene correctamente:**

1. ✅ Login funciona
2. ✅ Token se guarda
3. ✅ Al recargar página, sesión se mantiene
4. ✅ Token se valida correctamente
5. ✅ No se carga usuario mock automáticamente
6. ✅ Logout limpia todo correctamente

**¡La persistencia de sesión está funcionando!** 🎉

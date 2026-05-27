# 🔧 Fix: Mapeo de Rol Backend → Frontend

## ❌ Problema

Usuario con rol de **administrador** veía interfaz de **comentador** y "Acceso Denegado".

### Causa
**Backend devuelve:** `rol: "administrador"`  
**Frontend espera:** `role: "administrador"`

```json
// Backend
{
  "id": 2,
  "username": "Camilo_Andres",
  "email": "jugador-2@gmail.com",
  "firstName": "Camilo",
  "lastName": "Andres",
  "rolId": 1,
  "rol": "administrador"  // ❌ Campo incorrecto
}

// Frontend espera
{
  "id": 2,
  "role": "administrador"  // ✅ Campo correcto
}
```

---

## ✅ Solución

### 1. Mapeo en `loginApi()` - authService.ts

**Agregado mapeo completo del usuario:**

```typescript
// Mapear usuario del backend al formato del frontend
const mappedUser: User = {
  id: response.user.id,
  username: response.user.username,
  email: response.user.email,
  firstName: response.user.firstName,
  lastName: response.user.lastName,
  role: response.user.rol || response.user.role, // ✅ Mapeo rol → role
  avatar: response.user.avatar || `https://ui-avatars.com/api/?name=${response.user.firstName}+${response.user.lastName}`,
  status: response.user.status || 'active',
  lastLogin: response.user.lastLogin || new Date().toISOString(),
  createdAt: response.user.createdAt || new Date().toISOString(),
  permissions: response.user.permissions || [],
  stats: response.user.stats || {}
};

return {
  user: mappedUser,  // ✅ Usuario con formato correcto
  token: token
};
```

### 2. Mapeo en `validateToken()` - authService.ts

**Agregado mapeo al leer de localStorage:**

```typescript
const storedUser = localStorage.getItem('user_data');
if (storedUser) {
  const user = JSON.parse(storedUser);
  
  // ✅ Asegurar que el usuario tenga el formato correcto
  if (user.rol && !user.role) {
    user.role = user.rol;
  }
  
  return user;
}
```

---

## 🔍 Campos Mapeados

| Campo Backend | Campo Frontend | Valor por Defecto |
|---------------|----------------|-------------------|
| `rol` | `role` | - |
| `avatar` | `avatar` | Avatar generado con iniciales |
| `status` | `status` | `'active'` |
| `lastLogin` | `lastLogin` | Fecha actual |
| `createdAt` | `createdAt` | Fecha actual |
| `permissions` | `permissions` | `[]` |
| `stats` | `stats` | `{}` |

---

## 🎯 Flujo Completo

### Login
```
1. Backend responde: { user: { rol: "administrador", ... }, accessToken, refreshToken }
2. authService mapea: rol → role
3. authService completa campos faltantes (avatar, status, etc.)
4. AuthContext guarda usuario mapeado en localStorage
5. Usuario tiene role: "administrador" ✅
6. Sistema de permisos reconoce el rol correctamente ✅
```

### Recarga de Página
```
1. AuthContext lee user_data de localStorage
2. validateToken() verifica si tiene 'rol' en lugar de 'role'
3. Si tiene 'rol', lo mapea a 'role'
4. Usuario restaurado con role: "administrador" ✅
5. Sistema de permisos funciona correctamente ✅
```

---

## 🧪 Verificación

### Antes del Fix
```javascript
// localStorage
{
  "id": 2,
  "rol": "administrador",  // ❌
  "rolId": 1
}

// Sistema de permisos
user.role // undefined ❌
hasPermission('admin_completo') // false ❌
// Resultado: "Acceso Denegado"
```

### Después del Fix
```javascript
// localStorage
{
  "id": 2,
  "role": "administrador",  // ✅
  "rolId": 1,
  "permissions": [],
  "stats": {}
}

// Sistema de permisos
user.role // "administrador" ✅
hasPermission('admin_completo') // true ✅
// Resultado: Dashboard completo visible
```

---

## 📊 Logs Esperados

### Al Hacer Login
```
🔍 Respuesta del backend: { user: { rol: "administrador", ... }, accessToken, refreshToken }
✅ Token mapeado: eyJ...
✅ Refresh token: f4j...
✅ Usuario recibido: { id: 2, rol: "administrador", ... }
✅ Usuario mapeado: { id: 2, role: "administrador", ... }
```

### Al Recargar Página
```
Stored user: {"id":2,"role":"administrador",...}  // ✅ Ahora tiene 'role'
```

---

## 🔄 Diferencias Backend vs Frontend

### Nombres de Campos

| Concepto | Backend | Frontend |
|----------|---------|----------|
| Rol | `rol` | `role` |
| ID de rol | `rolId` o `rol_id` | No usado directamente |
| Nombre | `first_name` | `firstName` |
| Apellido | `last_name` | `lastName` |
| Creado | `created_at` | `createdAt` |
| Actualizado | `updated_at` | `updatedAt` |

### Valores de Rol

Ambos usan los mismos valores:
- `"administrador"`
- `"editor"`
- `"escritor"`
- `"autor"`
- `"comentador"`
- `"creador"`

---

## ⚠️ Importante

### Permisos del Backend

El backend **NO devuelve** el array de `permissions` en el usuario. Los permisos se deben:

1. **Opción A:** Obtener del backend después del login
   ```typescript
   const permissions = await rbacService.getPermissionsByRole(user.role);
   ```

2. **Opción B:** Incluirlos en la respuesta del login (modificar backend)
   ```typescript
   // En el backend, agregar permisos al usuario
   return {
     user: {
       ...userData,
       permissions: await this.getPermissionsByRole(userData.rolId)
     },
     accessToken,
     refreshToken
   };
   ```

3. **Opción C (Temporal):** Usar permisos del frontend basados en el rol
   ```typescript
   // En rolePermissions.ts ya están definidos
   const permissions = ROLE_PERMISSIONS[user.role] || [];
   ```

---

## ✅ Checklist

- [x] Mapear `rol` → `role` en loginApi
- [x] Mapear `rol` → `role` en validateToken
- [x] Agregar campos por defecto (avatar, status, etc.)
- [x] Logs de debugging para verificar mapeo
- [ ] Obtener permisos reales del backend
- [ ] Limpiar logs de producción

---

## 🎉 Resultado

**El usuario administrador ahora ve correctamente su dashboard con todos los permisos** ✅

- ✅ `role: "administrador"` mapeado correctamente
- ✅ Sistema de permisos funciona
- ✅ No más "Acceso Denegado"
- ✅ Dashboard completo visible

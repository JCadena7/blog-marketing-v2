# 🐛 Debug: Token No Se Guarda

## ❌ Problema Identificado

El token **NO se está recibiendo** del backend o **NO se está guardando** correctamente.

### Logs Actuales
```
AuthContext.tsx:135 auth_token undefined  ❌ No se guardó
AuthContext.tsx:137 user_data {...}       ✅ Se guardó
AuthContext.tsx:143 user null             ❌ Estado no actualizado
AuthContext.tsx:145 authToken null        ❌ Estado no actualizado
```

## 🔍 Posibles Causas

### 1. Backend NO Devuelve el Token

**Más probable:** El backend está devolviendo solo el usuario, sin el token.

**Respuesta esperada:**
```json
{
  "user": {
    "id": 2,
    "email": "jugador-2@gmail.com",
    "firstName": "Camilo",
    "lastName": "Andres",
    "rolId": 4
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Respuesta actual (probablemente):**
```json
{
  "id": 2,
  "email": "jugador-2@gmail.com",
  "firstName": "Camilo",
  "lastName": "Andres",
  "rolId": 4
}
```

### 2. Estructura de Respuesta Diferente

El backend podría estar devolviendo el token con otro nombre:
- `accessToken` en lugar de `token`
- `access_token` en lugar de `token`
- `jwt` en lugar de `token`

### 3. Token en Header en Lugar de Body

Algunos backends envían el token en el header `Authorization` en lugar del body.

## 🚀 Solución

### Paso 1: Ver Qué Devuelve el Backend

**Intenta hacer login nuevamente** y busca en la consola:

```
🔍 Respuesta del backend: { ... }
🔍 Token recibido: undefined o "eyJ..."
🔍 Usuario recibido: { ... }
```

### Paso 2: Verificar en Network Tab

1. Abre **DevTools (F12)**
2. Ve a **Network**
3. Haz login
4. Busca la petición `sign-in`
5. Ve a **Response**
6. Copia la respuesta completa

### Paso 3: Ajustar el Código Según la Respuesta

#### Opción A: Token en Campo Diferente

Si el backend devuelve `accessToken`:
```typescript
const response = await apiClient.post(endpoint, { email, password });

// Mapear al formato esperado
return {
  user: response.user,
  token: response.accessToken || response.access_token || response.jwt
};
```

#### Opción B: Token en Header

Si el backend envía el token en el header:
```typescript
// En apiClient.ts, modificar el método request
const response = await fetch(url, options);
const token = response.headers.get('Authorization')?.replace('Bearer ', '');
const data = await response.json();

return {
  ...data,
  token: token || data.token
};
```

#### Opción C: Usuario Directamente (Sin Wrapper)

Si el backend devuelve el usuario directamente:
```typescript
const response = await apiClient.post(endpoint, { email, password });

// Si response ES el usuario directamente
return {
  user: response,
  token: response.token || response.accessToken
};
```

## 🔧 Verificación del Backend

### Endpoint de Login en NestJS

Verifica que tu backend esté devolviendo el token:

```typescript
// auth.controller.ts
@Post('sign-in')
async signIn(@Body() loginDto: LoginDto) {
  const user = await this.authService.validateUser(loginDto.email, loginDto.password);
  
  if (!user) {
    throw new UnauthorizedException('Credenciales inválidas');
  }
  
  // ✅ DEBE devolver user Y token
  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      rolId: user.rolId
    },
    token: await this.authService.generateToken(user)  // ⚠️ Asegúrate de incluir esto
  };
}
```

### Generar Token JWT

```typescript
// auth.service.ts
async generateToken(user: User): Promise<string> {
  const payload = {
    sub: user.id,
    email: user.email,
    rolId: user.rolId
  };
  
  return this.jwtService.sign(payload);
}
```

## 📝 Checklist de Debugging

1. [ ] Ver logs en consola: `🔍 Respuesta del backend:`
2. [ ] Verificar en Network tab la respuesta completa
3. [ ] Confirmar que el backend devuelve el token
4. [ ] Verificar el nombre del campo del token
5. [ ] Ajustar el código del frontend según la respuesta real

## 🎯 Próximos Pasos

Una vez que veas los logs de `🔍 Respuesta del backend:`, podremos:

1. Identificar la estructura exacta de la respuesta
2. Ajustar el mapeo de datos si es necesario
3. Asegurar que el token se guarde correctamente

## ⚠️ Nota sobre localStorage.setItem()

Los logs muestran:
```javascript
localStorage.setItem('auth_token', token);
console.log('auth_token', localStorage.getItem('auth_token'));
// Muestra: undefined
```

Esto es **incorrecto**. Si `token` tiene un valor, `setItem` debería guardarlo.

**Posible causa:** El valor de `token` es `undefined` desde el inicio, por eso no se guarda nada.

## 🔍 Test Rápido

Prueba esto en la consola del navegador:

```javascript
// Test 1: Guardar y leer
localStorage.setItem('test_token', 'mi-token-de-prueba');
console.log(localStorage.getItem('test_token'));
// Debería mostrar: "mi-token-de-prueba"

// Test 2: Guardar undefined
localStorage.setItem('test_undefined', undefined);
console.log(localStorage.getItem('test_undefined'));
// Mostrará: "undefined" (como string)

// Test 3: Ver qué hay en auth_token
console.log('auth_token actual:', localStorage.getItem('auth_token'));
```

Si el Test 1 funciona, el problema es que el token que intentas guardar es `undefined`.

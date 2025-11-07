# 🔧 Solución: Error CORS

## ✅ Problema Resuelto Anterior
La variable de entorno **YA se lee correctamente**:
```
✅ VITE_API_BASE_URL: http://localhost:3000/api/v1
✅ USE_REAL_API: true
```

## ❌ Nuevo Problema: CORS

```
Access to fetch at 'http://localhost:3000/api/v1/auths/sign-in' from origin 'http://localhost:4321' 
has been blocked by CORS policy
```

### ¿Qué es CORS?

CORS (Cross-Origin Resource Sharing) es una medida de seguridad del navegador que bloquea peticiones entre diferentes orígenes (dominios/puertos).

- **Frontend:** `http://localhost:4321` (Astro)
- **Backend:** `http://localhost:3000` (NestJS)
- **Problema:** Son diferentes puertos = diferentes orígenes

## 🚀 Solución: Configurar CORS en NestJS

### Opción 1: Configuración Global (Recomendada)

En tu archivo `main.ts` del backend NestJS:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // ✅ Habilitar CORS
  app.enableCors({
    origin: [
      'http://localhost:4321',  // Frontend Astro
      'http://localhost:3000',  // Si tienes otro frontend
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  await app.listen(3000);
}
bootstrap();
```

### Opción 2: CORS Permisivo (Solo Desarrollo)

```typescript
// ⚠️ Solo para desarrollo - permite TODOS los orígenes
app.enableCors({
  origin: true,  // Permite cualquier origen
  credentials: true,
});
```

### Opción 3: Usando Variables de Entorno

```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4321',
  credentials: true,
});
```

## 📝 Pasos a Seguir

1. **Abre el archivo `main.ts` de tu backend NestJS**
   ```
   c:\Juan\Proyectos\Proyectos de js\microservicios\backend\src\main.ts
   ```

2. **Agrega la configuración CORS** (ver Opción 1 arriba)

3. **Reinicia el servidor del backend**
   ```bash
   # Detener el servidor (Ctrl + C)
   # Iniciar nuevamente
   npm run start:dev
   ```

4. **Recarga el frontend** (F5 en el navegador)

## ✅ Resultado Esperado

Después de configurar CORS, deberías poder hacer login sin errores y ver en la consola:

```
✅ POST http://localhost:3000/api/v1/auths/sign-in 200 OK
```

## 🔍 Verificación

Para verificar que CORS está configurado:

1. Abre las **DevTools** del navegador (F12)
2. Ve a la pestaña **Network**
3. Intenta hacer login
4. Busca la petición a `/auths/sign-in`
5. En los **Response Headers** deberías ver:
   ```
   Access-Control-Allow-Origin: http://localhost:4321
   Access-Control-Allow-Credentials: true
   ```

## 📚 Documentación Adicional

- [NestJS CORS](https://docs.nestjs.com/security/cors)
- [MDN CORS](https://developer.mozilla.org/es/docs/Web/HTTP/CORS)

## ⚠️ Importante para Producción

En producción, **NUNCA uses `origin: true`**. Siempre especifica los dominios permitidos:

```typescript
app.enableCors({
  origin: [
    'https://tu-dominio.com',
    'https://www.tu-dominio.com',
  ],
  credentials: true,
});
```

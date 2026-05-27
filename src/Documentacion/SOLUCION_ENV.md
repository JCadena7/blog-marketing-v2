# 🔧 Solución: Variable de Entorno No Se Lee

## ❌ Problema
```
VITE_API_BASE_URL: undefined
```

## ✅ Solución

### 1. **REINICIAR el servidor de desarrollo**

Vite/Astro **solo carga las variables de entorno al iniciar**. Debes reiniciar el servidor:

#### Opción A: Desde la terminal donde corre `pnpm dev`
1. Presiona `Ctrl + C` para detener el servidor
2. Ejecuta nuevamente: `pnpm dev`

#### Opción B: Desde PowerShell
```powershell
# Detener todos los procesos de Node
Get-Process node | Stop-Process -Force

# Iniciar el servidor nuevamente
pnpm dev
```

### 2. **Verificar archivos creados**

Se crearon dos archivos:
- ✅ `.env` (ya existía)
- ✅ `.env.local` (nuevo, tiene prioridad sobre .env)

Ambos contienen:
```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

### 3. **Configuración actualizada**

Se agregó `envPrefix: 'VITE_'` en `astro.config.mjs` para asegurar que Vite cargue las variables correctamente.

## 🎯 Después de Reiniciar

Deberías ver en la consola del navegador:
```
🔧 API Configuration:
  - VITE_API_BASE_URL: http://localhost:3000/api/v1  ✅
  - BASE_URL (resolved): http://localhost:3000/api/v1
  - USE_REAL_API: true
```

## 📝 Notas Importantes

1. **Siempre reinicia el servidor** después de cambiar archivos `.env`
2. `.env.local` tiene **prioridad** sobre `.env`
3. Las variables **deben empezar con `VITE_`** para ser accesibles en el cliente
4. En Astro/Vite, usa `import.meta.env.VITE_NOMBRE_VARIABLE`

## 🚀 Comandos Útiles

```powershell
# Ver procesos de Node corriendo
Get-Process node

# Detener todos los procesos de Node
Get-Process node | Stop-Process -Force

# Iniciar servidor de desarrollo
pnpm dev

# Ver contenido de .env
Get-Content .env
```

## ⚠️ Si Aún No Funciona

1. **Verifica que el archivo .env existe:**
   ```powershell
   Test-Path .env
   ```

2. **Verifica el contenido:**
   ```powershell
   Get-Content .env
   ```

3. **Limpia la caché de Vite:**
   ```powershell
   Remove-Item -Recurse -Force node_modules/.vite
   pnpm dev
   ```

4. **Verifica que no haya espacios extra:**
   ```env
   # ❌ MAL (espacio antes del =)
   VITE_API_BASE_URL =http://localhost:3000/api/v1
   
   # ✅ BIEN
   VITE_API_BASE_URL=http://localhost:3000/api/v1
   ```

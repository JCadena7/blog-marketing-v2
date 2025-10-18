# Servicios - Arquitectura de Datos

Esta carpeta contiene todos los servicios de la aplicación con una arquitectura que permite cambiar fácilmente entre datos mock y una API real.

## 🏗️ Arquitectura

Cada servicio sigue este patrón de tres capas:

```
┌─────────────────────────────────────┐
│   CAPA PÚBLICA (Exports)            │
│   - Funciones exportadas            │
│   - Auto-switch mock/API            │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│   CAPA MOCK                         │
│   - Funciones con sufijo "Mock"     │
│   - Usa datos de /data              │
│   - Simula delays de red            │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│   CAPA API                          │
│   - Funciones con sufijo "Api"      │
│   - Usa apiClient                   │
│   - Llamadas HTTP reales            │
└─────────────────────────────────────┘
```

## 🔧 Configuración

### Cambiar entre Mock y API Real

Edita el archivo `/src/config/api.ts`:

```typescript
export const API_CONFIG = {
  // false = usa datos mock
  // true = usa API real
  USE_REAL_API: false,
  
  // URL base de tu API
  BASE_URL: 'http://localhost:3000/api',
  
  // ... otros ajustes
};
```

### Variables de Entorno

Puedes usar variables de entorno para configurar la API:

```env
# .env
VITE_API_BASE_URL=https://api.tudominio.com
VITE_USE_REAL_API=false
```

## 📝 Ejemplo de Implementación

### Estructura de un Servicio

```typescript
import { useRealApi, API_CONFIG } from '../config/api';
import { apiClient } from '../lib/apiClient';
import { mockData, type DataType } from '../data/mockData';

// ==================== MOCK DATA LAYER ====================

async function getDataMock(): Promise<DataType[]> {
  await delay(200); // Simula latencia de red
  return [...mockData];
}

async function createDataMock(data: Partial<DataType>): Promise<DataType> {
  await delay(300);
  const newItem = { id: Date.now(), ...data };
  mockData.push(newItem);
  return newItem;
}

// ==================== API DATA LAYER ====================

async function getDataApi(): Promise<DataType[]> {
  try {
    return await apiClient.get<DataType[]>(
      API_CONFIG.ENDPOINTS.DATA
    );
  } catch (error) {
    console.error('Error fetching data from API:', error);
    return [];
  }
}

async function createDataApi(data: Partial<DataType>): Promise<DataType> {
  try {
    return await apiClient.post<DataType>(
      API_CONFIG.ENDPOINTS.DATA,
      data
    );
  } catch (error) {
    console.error('Error creating data via API:', error);
    throw error;
  }
}

// ==================== PUBLIC API ====================

export async function getData(): Promise<DataType[]> {
  return useRealApi() ? getDataApi() : getDataMock();
}

export async function createData(data: Partial<DataType>): Promise<DataType> {
  return useRealApi() ? createDataApi(data) : createDataMock(data);
}
```

## 🚀 Servicios Disponibles

### ✅ Refactorizados (Mock + API)
- `profileService.ts` - Gestión de perfiles de usuario
- `usersService.ts` - Gestión de usuarios

### 🔄 Pendientes de Refactorizar
- `postsService.ts` - Gestión de posts
- `commentsService.ts` - Gestión de comentarios
- `analyticsService.ts` - Datos de analytics
- `categoriesService.ts` - Gestión de categorías

## 🎯 Beneficios de esta Arquitectura

1. **Desarrollo sin Backend**: Trabaja con datos mock mientras el backend está en desarrollo
2. **Testing Fácil**: Cambia a mock para tests sin depender de la API
3. **Transición Suave**: Cambia a API real con un solo flag
4. **Código Limpio**: Separación clara entre lógica mock y API
5. **Type Safety**: TypeScript garantiza tipos consistentes en ambas capas
6. **Error Handling**: Manejo de errores centralizado en apiClient

## 📚 API Client

El `apiClient` en `/src/lib/apiClient.ts` proporciona:

- ✅ Métodos HTTP: `get`, `post`, `put`, `patch`, `delete`
- ✅ Upload de archivos
- ✅ Timeouts configurables
- ✅ Manejo de errores centralizado
- ✅ TypeScript generics para type safety

### Ejemplo de Uso

```typescript
// GET request
const users = await apiClient.get<User[]>('/users');

// POST request
const newUser = await apiClient.post<User>('/users', {
  name: 'Juan',
  email: 'juan@example.com'
});

// Upload file
const result = await apiClient.upload<{ url: string }>(
  '/upload',
  fileObject,
  'image'
);
```

## 🔐 Autenticación

Para agregar autenticación a las peticiones API, modifica `apiClient.ts`:

```typescript
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getAuthToken()}`,
  ...fetchOptions.headers,
}
```

## 🐛 Debugging

Para ver las peticiones en consola, agrega logs en `apiClient.ts`:

```typescript
console.log('[API Request]', method, url, data);
console.log('[API Response]', response);
```

## 📖 Próximos Pasos

1. Refactorizar los servicios restantes siguiendo el patrón
2. Implementar interceptors para autenticación
3. Agregar retry logic para peticiones fallidas
4. Implementar caché de respuestas
5. Agregar loading states globales

## 💡 Tips

- Mantén los delays en funciones mock para simular latencia real
- Usa try-catch en funciones API para manejo robusto de errores
- Documenta los endpoints en `API_CONFIG.ENDPOINTS`
- Mantén la firma de funciones idéntica entre mock y API
- Usa TypeScript generics para type safety

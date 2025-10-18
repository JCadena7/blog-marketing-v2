# Sistema de Tipos del Proyecto

Este proyecto utiliza un sistema de tipos centralizado en TypeScript para garantizar la consistencia y type safety en toda la aplicación.

## 📁 Ubicación

El archivo principal de tipos está ubicado en:
```
src/types.ts
```

También puedes importar desde:
```
src/types/index.ts
```

## 🎯 Uso

### Importar tipos en tus componentes/archivos:

```typescript
// Importar tipos individuales
import type { User, Post, Comment } from '../types';

// Importar múltiples tipos
import type { 
  User, 
  Post, 
  Category, 
  Comment,
  AnalyticsData 
} from '../types';

// Importar desde el índice (alternativa)
import type { User, Post } from '../types/index';
```

## 📚 Categorías de Tipos

### 1. **Roles y Permisos**
- `Role` - Roles de usuario (creador, administrador, editor, escritor, autor, comentador)
- `Permission` - Permisos del sistema
- `RoleConfig` - Configuración visual de roles

### 2. **Usuarios**
- `User` - Usuario básico del sistema
- `UserProfile` - Perfil completo de usuario con preferencias y estadísticas
- `UserPreferences` - Preferencias de usuario
- `UserStats` - Estadísticas de usuario
- `UserActivity` - Actividad del usuario

### 3. **Posts y Contenido**
- `Post` - Post del sistema de gestión
- `PostStatus` - Estados de un post (draft, pending, published, rejected)
- `PostSEO` - Información SEO del post
- `PostEditorial` - Información editorial del post
- `BlogPost` - Post del blog público

### 4. **Categorías**
- `Category` - Categoría de contenido

### 5. **Comentarios**
- `Comment` - Comentario en un post
- `CommentStatus` - Estados de comentario (pending, approved, rejected, spam)

### 6. **Analytics**
- `AnalyticsData` - Datos completos de analytics
- `AnalyticsOverview` - Resumen de analytics
- `TrafficDataPoint` - Punto de datos de tráfico
- `TopPost` - Post más popular
- `ContentAnalytics` - Analytics de contenido
- `UsersAnalytics` - Analytics de usuarios
- `PerformanceAnalytics` - Analytics de rendimiento

### 7. **Autenticación**
- `LoginFormData` - Datos del formulario de login
- `RegisterFormData` - Datos del formulario de registro
- `ForgotPasswordFormData` - Datos del formulario de recuperación
- `ResetPasswordFormData` - Datos del formulario de reset

### 8. **UI Components**
- `ButtonProps` - Props del componente Button
- `ModalProps` - Props del componente Modal
- `TableColumn` - Columna de tabla
- `TableProps` - Props del componente Table

### 9. **Filtros y Búsqueda**
- `FilterOptions` - Opciones de filtrado
- `SortOptions` - Opciones de ordenamiento
- `PaginationOptions` - Opciones de paginación

### 10. **API**
- `ApiResponse<T>` - Respuesta genérica de API
- `PaginatedResponse<T>` - Respuesta paginada de API

### 11. **Dashboard**
- `DashboardWidget` - Widget del dashboard
- `StatCard` - Tarjeta de estadística

### 12. **Editor**
- `EditorConfig` - Configuración del editor
- `EditorContent` - Contenido del editor

### 13. **Media**
- `MediaFile` - Archivo multimedia
- `ImageUploadOptions` - Opciones de subida de imagen

### 14. **Herramientas**
- `ROICalculatorData` - Datos del calculador ROI
- `ROIResult` - Resultado del cálculo ROI

### 15. **Tipos Auxiliares**
- `Nullable<T>` - Tipo que puede ser null
- `Optional<T>` - Tipo que puede ser undefined
- `Maybe<T>` - Tipo que puede ser null o undefined
- `DeepPartial<T>` - Partial profundo recursivo
- `Prettify<T>` - Mejora la visualización de tipos

## ✅ Archivos Actualizados

Los siguientes archivos ya están usando el sistema de tipos centralizado:

- ✅ `src/data/mockPosts.ts`
- ✅ `src/data/mockUsers.ts`
- ✅ `src/data/mockComments.ts`
- ✅ `src/data/mockCategories.ts`
- ✅ `src/data/mockAnalytics.ts`
- ✅ `src/data/mockUserProfiles.ts`
- ✅ `src/data/rolePermissions.ts`
- ✅ `src/data/blogPosts.ts`

## 🔧 Mejores Prácticas

### 1. **Siempre usa `import type`**
```typescript
// ✅ Correcto
import type { User } from '../types';

// ❌ Evitar (importa en runtime)
import { User } from '../types';
```

### 2. **Reutiliza tipos existentes**
```typescript
// ✅ Correcto - Reutiliza el tipo User
function getUser(id: number): User {
  // ...
}

// ❌ Evitar - Duplica la definición
function getUser(id: number): { id: number; name: string; ... } {
  // ...
}
```

### 3. **Extiende tipos cuando sea necesario**
```typescript
// ✅ Correcto - Extiende el tipo base
import type { User } from '../types';

interface ExtendedUser extends User {
  customField: string;
}
```

### 4. **Usa tipos genéricos para APIs**
```typescript
import type { ApiResponse, User } from '../types';

async function fetchUser(id: number): Promise<ApiResponse<User>> {
  // ...
}
```

## 🚀 Ventajas del Sistema Centralizado

1. **Consistencia**: Todos los tipos están en un solo lugar
2. **Mantenibilidad**: Fácil de actualizar y mantener
3. **Reutilización**: Evita duplicación de código
4. **Type Safety**: TypeScript valida correctamente en todo el proyecto
5. **Documentación**: Sirve como documentación de la estructura de datos
6. **Autocompletado**: Mejor experiencia de desarrollo con IntelliSense
7. **Refactoring**: Más fácil refactorizar cuando los tipos cambian

## 📝 Añadir Nuevos Tipos

Cuando necesites añadir un nuevo tipo:

1. Abre `src/types.ts`
2. Añade tu tipo en la sección correspondiente
3. Exporta el tipo con `export`
4. Documenta el tipo con comentarios JSDoc si es complejo

Ejemplo:
```typescript
/**
 * Representa una notificación del sistema
 */
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: string;
  read: boolean;
}
```

## 🔍 Búsqueda de Tipos

Para encontrar un tipo específico:
1. Abre `src/types.ts`
2. Usa Ctrl+F (o Cmd+F en Mac)
3. Busca el nombre del tipo o la categoría

## 🤝 Contribuir

Al contribuir al proyecto:
- Usa siempre los tipos existentes cuando sea posible
- Si necesitas un nuevo tipo, añádelo a `types.ts`
- Mantén la organización por categorías
- Documenta tipos complejos con comentarios

---

**Última actualización**: 2025-10-08

# Profiles Service - Usando Endpoints de Users

## ✅ Solución Implementada

Como el backend **NO tiene módulo `/profiles`**, he actualizado el servicio de profiles para usar los endpoints de **`/users`** del backend.

---

## 🔄 Cambios Realizados

### **1. Endpoint de Obtener Perfil**

**Antes:**
```typescript
// ❌ No existe en el backend
GET /profiles/:id
```

**Ahora:**
```typescript
// ✅ Usa endpoint de users
GET /users/:id
```

**Transformación de datos:**
```typescript
// Backend devuelve (formato users):
{
  id: 1,
  nombre: "Juan Pérez",
  email: "juan@example.com",
  rol: { id: 3, nombre: "autor" },
  created_at: "2024-01-01T00:00:00Z"
}

// Frontend transforma a (formato UserProfile):
{
  id: 1,
  username: "Juan Pérez",
  firstName: "Juan",
  lastName: "Pérez",
  email: "juan@example.com",
  role: "autor",
  joinedAt: "2024-01-01T00:00:00Z",
  // ... más campos
}
```

### **2. Endpoint de Actualizar Perfil**

**Antes:**
```typescript
// ❌ No existe en el backend
PATCH /profiles/:id
```

**Ahora:**
```typescript
// ✅ Usa endpoint de users
PATCH /users/:id
```

**Transformación de datos:**
```typescript
// Frontend envía (formato UserProfile):
{
  firstName: "Juan",
  lastName: "Pérez",
  bio: "Desarrollador",
  location: "Madrid"
}

// Se transforma a (formato backend):
{
  nombre: "Juan Pérez",
  bio: "Desarrollador",
  location: "Madrid"
}
```

### **3. Upload de Avatar y Cover**

**Problema:** El backend no tiene endpoints específicos para upload de imágenes.

**Solución Temporal:**
```typescript
async function uploadAvatarApi(userId: number, imageFile: File) {
  // TODO: Implementar upload a servicio externo (Cloudinary, S3, etc.)
  const avatarUrl = URL.createObjectURL(imageFile);
  
  // Actualizar usuario con nueva URL
  await apiClient.patch(`/users/${userId}`, { avatar: avatarUrl });
  
  return { avatarUrl };
}
```

**Soluciones Recomendadas:**

**Opción A: Servicio Externo (Recomendado)**
```typescript
// Usar Cloudinary, AWS S3, o similar
const formData = new FormData();
formData.append('file', imageFile);
formData.append('upload_preset', 'your_preset');

const response = await fetch('https://api.cloudinary.com/v1_1/your_cloud/upload', {
  method: 'POST',
  body: formData
});

const { secure_url } = await response.json();

// Actualizar usuario con URL de Cloudinary
await apiClient.patch(`/users/${userId}`, { avatar: secure_url });
```

**Opción B: Implementar en Backend**
```typescript
// En el backend, agregar endpoint:
@Post('users/:id/avatar')
@UseInterceptors(FileInterceptor('avatar'))
uploadAvatar(@Param('id') id: number, @UploadedFile() file: Express.Multer.File) {
  // Guardar archivo y retornar URL
}
```

---

## 📋 Funciones del Profile Service

### **Funciones Principales**
```typescript
// Obtener perfil (usa GET /users/:id)
getProfile(userId: number): Promise<UserProfile | null>

// Actualizar perfil (usa PATCH /users/:id)
updateProfile(userId: number, updates: Partial<UserProfile>): Promise<UserProfile | null>

// Upload de avatar (temporal, necesita implementación real)
uploadAvatar(userId: number, imageFile: File): Promise<{ avatarUrl: string }>

// Upload de cover (temporal, necesita implementación real)
uploadCover(userId: number, imageFile: File): Promise<{ coverUrl: string }>
```

### **Funciones Auxiliares (Mock)**
```typescript
// Estadísticas del perfil
getProfileStats(userId: number, timeRange: string): Promise<any>

// Actividad del usuario
getProfileActivity(userId: number, params: object): Promise<any>

// Buscar usuarios
searchUsers(query: string, params: object): Promise<any>

// Verificar disponibilidad
checkUsernameAvailability(username: string): Promise<{ available: boolean }>
checkEmailAvailability(email: string): Promise<{ available: boolean }>

// Gestión de cuenta
changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void>
exportUserData(userId: number): Promise<{ downloadUrl: string }>
requestAccountDeletion(userId: number, reason: string): Promise<void>
```

---

## 🎯 Mapeo de Campos

### **Backend → Frontend**

| Campo Backend | Campo Frontend | Transformación |
|---------------|----------------|----------------|
| `nombre` | `username` | Directo |
| `nombre` | `firstName` | Primera palabra |
| `nombre` | `lastName` | Resto de palabras |
| `email` | `email` | Directo |
| `avatar` | `avatar` | Directo o generado |
| `rol.nombre` | `role` | Extraer nombre del rol |
| `created_at` | `joinedAt` | Directo |
| `bio` | `bio` | Directo |
| `location` | `location` | Directo |
| `website` | `website` | Directo |
| `socialLinks` | `socialLinks` | Directo |

### **Frontend → Backend**

| Campo Frontend | Campo Backend | Transformación |
|----------------|---------------|----------------|
| `firstName` + `lastName` | `nombre` | Concatenar |
| `email` | `email` | Directo |
| `avatar` | `avatar` | Directo |
| `bio` | `bio` | Directo |
| `location` | `location` | Directo |
| `website` | `website` | Directo |
| `socialLinks` | `socialLinks` | Directo |

---

## 💡 Ejemplo de Uso

### **Obtener Perfil**
```typescript
import { getProfile } from '@/services/profileService';

const profile = await getProfile(userId);

console.log(profile);
// {
//   id: 1,
//   username: "Juan Pérez",
//   firstName: "Juan",
//   lastName: "Pérez",
//   email: "juan@example.com",
//   role: "autor",
//   avatar: "https://...",
//   bio: "Desarrollador web",
//   ...
// }
```

### **Actualizar Perfil**
```typescript
import { updateProfile } from '@/services/profileService';

const updatedProfile = await updateProfile(userId, {
  firstName: "Juan Carlos",
  lastName: "Pérez García",
  bio: "Full Stack Developer",
  location: "Madrid, España",
  website: "https://juanperez.dev",
  socialLinks: {
    twitter: "https://twitter.com/juanperez",
    linkedin: "https://linkedin.com/in/juanperez",
    github: "https://github.com/juanperez",
    instagram: ""
  }
});
```

### **Upload de Avatar**
```typescript
import { uploadAvatar } from '@/services/profileService';

const handleAvatarUpload = async (file: File) => {
  try {
    const { avatarUrl } = await uploadAvatar(userId, file);
    console.log('Avatar actualizado:', avatarUrl);
  } catch (error) {
    console.error('Error subiendo avatar:', error);
  }
};
```

---

## ⚠️ Limitaciones Actuales

### **1. Upload de Imágenes**
- **Problema**: No hay endpoints de upload en el backend
- **Solución Temporal**: Usa `URL.createObjectURL()` (solo funciona en sesión actual)
- **Solución Real Necesaria**: Implementar upload a servicio externo o backend

### **2. Estadísticas de Usuario**
- **Problema**: El backend no devuelve stats de usuario
- **Solución Temporal**: Retorna valores por defecto (0)
- **Solución Real**: Implementar en backend o usar User Activities

### **3. Actividad del Usuario**
- **Problema**: No hay endpoint de actividades en `/users`
- **Solución**: Usar el servicio de **User Activities** (`/user-activities`)

---

## 🚀 Mejoras Recomendadas

### **1. Implementar Upload de Imágenes**

**Opción A: Cloudinary (Recomendado)**
```bash
npm install cloudinary
```

```typescript
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'user_avatars');
  
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
    { method: 'POST', body: formData }
  );
  
  const data = await response.json();
  return data.secure_url;
}
```

**Opción B: AWS S3**
```bash
npm install @aws-sdk/client-s3
```

### **2. Integrar User Activities**

```typescript
import { getActivitiesByUser } from '@/services/userActivitiesService';

export async function getProfileActivity(userId: number, params: any) {
  if (useRealApi()) {
    // Usar servicio de User Activities
    return getActivitiesByUser(userId, params);
  }
  
  // Mock data
  return { activities: [], total: 0 };
}
```

### **3. Obtener Estadísticas Reales**

```typescript
import { getMejorRendimientoPorAutor } from '@/services/postsService';
import { getActivitiesByUser } from '@/services/userActivitiesService';

export async function getProfileStats(userId: number) {
  if (useRealApi()) {
    const posts = await getMejorRendimientoPorAutor(userId, 100);
    const activities = await getActivitiesByUser(userId, { limit: 1000 });
    
    return {
      posts: posts.length,
      totalViews: posts.reduce((sum, p) => sum + (p.views || 0), 0),
      totalLikes: posts.reduce((sum, p) => sum + (p.likes || 0), 0),
      // ... más stats
    };
  }
  
  // Mock data
}
```

---

## ✅ Resumen

| Aspecto | Estado | Solución |
|---------|--------|----------|
| **Obtener perfil** | ✅ Funcionando | Usa `/users/:id` |
| **Actualizar perfil** | ✅ Funcionando | Usa `PATCH /users/:id` |
| **Upload avatar** | ⚠️ Temporal | Necesita servicio externo |
| **Upload cover** | ⚠️ Temporal | Necesita servicio externo |
| **Estadísticas** | ⚠️ Mock | Integrar con otros servicios |
| **Actividades** | ⚠️ Mock | Usar User Activities |

---

## 📝 Próximos Pasos

1. **Implementar upload de imágenes** con Cloudinary o S3
2. **Integrar User Activities** para actividades reales
3. **Calcular estadísticas** usando datos de posts y actividades
4. **Agregar búsqueda de usuarios** usando `/users` con filtros
5. **Implementar seguir/dejar de seguir** si el backend lo soporta

---

El servicio de profiles ahora funciona correctamente usando los endpoints de `/users` del backend. Las funciones de upload necesitan implementación real con un servicio de almacenamiento externo.

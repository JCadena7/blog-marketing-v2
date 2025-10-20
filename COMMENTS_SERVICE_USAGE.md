# Guía de Uso del Servicio de Comentarios

## Estructura del Backend

El servicio de comentarios ahora está completamente integrado con tu backend y maneja dos tipos de respuestas:

### 1. Respuesta Simple (sin queries)
```json
{
  "items": [
    {
      "id": 2,
      "contenido": "Contenido del comentario...",
      "post_id": 7,
      "usuario_id": 2,
      "parent_id": 1,
      "status": "approved",
      "likes": 2,
      "is_edited": false,
      "edited_at": null,
      "moderated_by": null,
      "moderated_at": null,
      "moderation_notes": null,
      "created_at": "2025-10-20T05:36:48.818Z",
      "updated_at": "2025-10-20T05:36:48.818Z"
    }
  ],
  "total": 2,
  "page": 1,
  "limit": 10,
  "pages": 1
}
```

### 2. Respuesta Completa (con `withUser=true` y `withReplies=true`)
```json
{
  "items": [
    {
      "id": 1,
      "contenido": "Comentario padre...",
      "post_id": 7,
      "usuario_id": 2,
      "parent_id": null,
      "status": "approved",
      "likes": 1,
      "is_edited": false,
      "edited_at": null,
      "depth": 0,
      "path": [1],
      "usuario": {
        "id": 2,
        "username": "Camilo_Andres",
        "email": "jugador-2@gmail.com",
        "first_name": "Camilo",
        "last_name": "Andres",
        "avatar": null
      },
      "replies": [
        {
          "id": 2,
          "contenido": "Respuesta al comentario...",
          "post_id": 7,
          "usuario_id": 2,
          "parent_id": 1,
          "status": "approved",
          "likes": 2,
          "depth": 1,
          "path": [1, 2],
          "usuario": {
            "id": 2,
            "username": "Camilo_Andres",
            "email": "jugador-2@gmail.com",
            "first_name": "Camilo",
            "last_name": "Andres",
            "avatar": null
          },
          "replies": []
        }
      ]
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "pages": 1
}
```

## Funciones Principales

### 1. Obtener Comentarios por Post (Recomendado)

```typescript
import { getCommentsByPostId } from '@/services/commentsService';

// Obtener comentarios con usuarios y respuestas anidadas
const result = await getCommentsByPostId(7, {
  withUser: true,      // Incluir información del usuario
  withReplies: true,   // Incluir respuestas anidadas
  page: 1,            // Página actual
  limit: 10           // Comentarios por página
});

console.log(result.comments);  // Array de comentarios transformados
console.log(result.total);     // Total de comentarios
console.log(result.page);      // Página actual
console.log(result.pages);     // Total de páginas
```

### 2. Estructura del Comentario Transformado

El servicio transforma automáticamente de `snake_case` (backend) a `camelCase` (frontend):

```typescript
interface Comment {
  id: number;
  content: string;              // ← contenido
  postId: number;               // ← post_id
  authorId: number;             // ← usuario_id
  author: {
    id: number;
    name: string;               // ← first_name + last_name
    email: string;
    avatar: string | null;
    username: string;
    firstName: string;          // ← first_name
    lastName: string;           // ← last_name
  };
  status: 'pending' | 'approved' | 'rejected' | 'spam';
  parentId: number | null;      // ← parent_id
  likes: number;
  isEdited: boolean;            // ← is_edited
  editedAt: string | null;      // ← edited_at
  moderatedBy: number | null;   // ← moderated_by
  moderatedAt: string | null;   // ← moderated_at
  moderationNotes: string | null; // ← moderation_notes
  createdAt: string;            // ← created_at
  updatedAt: string;            // ← updated_at
  depth?: number;               // Profundidad en el árbol
  path?: number[];              // Ruta en el árbol
  replies?: Comment[];          // Respuestas anidadas
}
```

### 3. Crear un Comentario

```typescript
import { createComment } from '@/services/commentsService';

const newComment = await createComment({
  content: "¡Excelente artículo!",
  postId: 7,
  authorId: 2,
  parentId: null  // null para comentario raíz, o ID del comentario padre
});
```

### 4. Moderar un Comentario

```typescript
import { updateCommentStatus } from '@/services/commentsService';

// Aprobar comentario
await updateCommentStatus(1, 'approved');

// Rechazar con notas
await updateCommentStatus(1, 'rejected', 'Contenido inapropiado');

// Marcar como spam
await updateCommentStatus(1, 'spam');
```

### 5. Dar Like a un Comentario

```typescript
import { likeComment } from '@/services/commentsService';

const success = await likeComment(1);
```

### 6. Eliminar un Comentario

```typescript
import { deleteComment } from '@/services/commentsService';

const success = await deleteComment(1);
```

### 7. Obtener Estadísticas

```typescript
import { 
  getCommentsStats,
  getTopCommentedPosts,
  getMostActiveCommenters 
} from '@/services/commentsService';

// Estadísticas generales
const stats = await getCommentsStats();
// { total, approved, pending, spam, rejected }

// Posts más comentados
const topPosts = await getTopCommentedPosts(10);

// Usuarios más activos
const activeUsers = await getMostActiveCommenters(10);
```

## Ejemplo de Uso en un Componente React

```typescript
import React, { useEffect, useState } from 'react';
import { getCommentsByPostId } from '@/services/commentsService';
import type { Comment } from '@/types';

interface CommentsSectionProps {
  postId: number;
}

export function CommentsSection({ postId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    loadComments();
  }, [postId, pagination.page]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const result = await getCommentsByPostId(postId, {
        withUser: true,
        withReplies: true,
        page: pagination.page,
        limit: 10
      });
      
      setComments(result.comments);
      setPagination({
        page: result.page,
        total: result.total,
        pages: result.pages
      });
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderComment = (comment: Comment, depth: number = 0) => (
    <div 
      key={comment.id} 
      style={{ marginLeft: `${depth * 20}px` }}
      className="comment"
    >
      <div className="comment-header">
        <img 
          src={comment.author.avatar || '/default-avatar.png'} 
          alt={comment.author.name}
          className="avatar"
        />
        <span className="author-name">{comment.author.name}</span>
        <span className="username">@{comment.author.username}</span>
        <span className="date">
          {new Date(comment.createdAt).toLocaleDateString()}
        </span>
      </div>
      
      <div className="comment-content">
        {comment.content}
      </div>
      
      <div className="comment-actions">
        <button onClick={() => handleLike(comment.id)}>
          ❤️ {comment.likes}
        </button>
        <button onClick={() => handleReply(comment.id)}>
          💬 Responder
        </button>
      </div>

      {/* Renderizar respuestas recursivamente */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="replies">
          {comment.replies.map(reply => renderComment(reply, depth + 1))}
        </div>
      )}
    </div>
  );

  if (loading) return <div>Cargando comentarios...</div>;

  return (
    <div className="comments-section">
      <h3>Comentarios ({pagination.total})</h3>
      
      <div className="comments-list">
        {comments.map(comment => renderComment(comment))}
      </div>

      {/* Paginación */}
      {pagination.pages > 1 && (
        <div className="pagination">
          <button 
            disabled={pagination.page === 1}
            onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
          >
            Anterior
          </button>
          <span>Página {pagination.page} de {pagination.pages}</span>
          <button 
            disabled={pagination.page === pagination.pages}
            onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
```

## Características Clave

✅ **Transformación Automática**: Convierte automáticamente entre snake_case (backend) y camelCase (frontend)

✅ **Respuestas Anidadas**: Maneja comentarios con respuestas recursivas usando `withReplies=true`

✅ **Información de Usuario**: Incluye datos completos del autor con `withUser=true`

✅ **Paginación**: Soporte completo para paginación de comentarios

✅ **Avatar Fallback**: Genera avatares automáticos si el usuario no tiene uno

✅ **Profundidad y Ruta**: Incluye información de profundidad (`depth`) y ruta (`path`) para renderizado de árbol

✅ **TypeScript**: Completamente tipado con interfaces TypeScript

## Notas Importantes

1. **Query Parameters**: Por defecto, `getCommentsByPostId` usa `withUser=true` y `withReplies=true` para obtener la estructura completa.

2. **Recursividad**: Las respuestas se transforman recursivamente, manteniendo la estructura de árbol.

3. **Nombres de Usuario**: El servicio combina `first_name` y `last_name` para crear el campo `name`, con fallback a `username`.

4. **Avatares**: Si el usuario no tiene avatar, se genera uno automáticamente usando ui-avatars.com.

5. **Moderación**: Los campos de moderación (`moderatedBy`, `moderatedAt`, `moderationNotes`) están disponibles cuando un comentario ha sido moderado.

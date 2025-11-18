import React, { useEffect } from 'react';
import { incrementarVista } from '../../services/postsService';

interface PostViewTrackerProps {
  postId: number;
}

const PostViewTracker: React.FC<PostViewTrackerProps> = ({ postId }) => {
  useEffect(() => {
    if (!postId || typeof window === 'undefined') return;

    const storageKey = `viewed_post_${postId}`;
    if (sessionStorage.getItem(storageKey)) {
      return;
    }

    let cancelled = false;

    const getUserId = (): number | undefined => {
      try {
        const raw = localStorage.getItem('user_data');
        if (!raw) return undefined;
        const parsed = JSON.parse(raw);
        return typeof parsed?.id === 'number' ? parsed.id : undefined;
      } catch (error) {
        console.warn('PostViewTracker: no se pudo leer user_data de localStorage', error);
        return undefined;
      }
    };

    const userId = getUserId();

    incrementarVista(postId, userId)
      .then((success) => {
        if (success && !cancelled) {
          sessionStorage.setItem(storageKey, new Date().toISOString());
        }
      })
      .catch((error) => {
        console.error('PostViewTracker: error incrementando vista', error);
      });

    return () => {
      cancelled = true;
    };
  }, [postId]);

  return null;
};

export default PostViewTracker;

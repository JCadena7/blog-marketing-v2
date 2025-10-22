import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
import { darLike, quitarLike } from '../../services/postsService';

interface PostReactionsProps {
  postId: number;
  initialLikes: number;
  initialComments: number;
}

const PostReactions: React.FC<PostReactionsProps> = ({ 
  postId, 
  initialLikes, 
  initialComments 
}) => {
  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    // Verificar si el usuario ya dio like (desde localStorage)
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
    setHasLiked(likedPosts.includes(postId));
  }, [postId]);

  const handleLike = async () => {
    if (isAnimating) return;

    // Obtener userId del usuario autenticado
    const userStr = localStorage.getItem('user_data');
    if (!userStr) {
      console.warn('⚠️ Usuario no autenticado. Por favor inicia sesión para dar like.');
      setShowLoginPrompt(true);
      setTimeout(() => setShowLoginPrompt(false), 3000);
      return;
    }

    let userId: number;
    try {
      const user = JSON.parse(userStr);
      userId = user.id;
      
      if (!userId) {
        console.error('❌ Usuario sin ID válido');
        return;
      }
    } catch (error) {
      console.error('❌ Error al parsear datos de usuario:', error);
      return;
    }

    setIsAnimating(true);
    const newHasLiked = !hasLiked;
    
    // Actualizar estado local optimísticamente
    setHasLiked(newHasLiked);
    setLikes(prev => newHasLiked ? prev + 1 : prev - 1);

    // Guardar en localStorage
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
    if (newHasLiked) {
      likedPosts.push(postId);
    } else {
      const index = likedPosts.indexOf(postId);
      if (index > -1) likedPosts.splice(index, 1);
    }
    localStorage.setItem('likedPosts', JSON.stringify(likedPosts));

    // Llamar a la API del backend
    try {
      if (newHasLiked) {
        await darLike(postId, userId);
        console.log(`✅ Like registrado: Post ${postId}, Usuario ${userId}`);
      } else {
        await quitarLike(postId, userId);
        console.log(`✅ Like eliminado: Post ${postId}, Usuario ${userId}`);
      }
    } catch (error) {
      console.error('❌ Error al procesar like:', error);
      // Revertir en caso de error
      setHasLiked(!newHasLiked);
      setLikes(prev => newHasLiked ? prev - 1 : prev + 1);
      
      // Revertir localStorage
      const revertedLikes = JSON.parse(localStorage.getItem('likedPosts') || '[]');
      if (!newHasLiked) {
        revertedLikes.push(postId);
      } else {
        const index = revertedLikes.indexOf(postId);
        if (index > -1) revertedLikes.splice(index, 1);
      }
      localStorage.setItem('likedPosts', JSON.stringify(revertedLikes));
    }

    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <div className="relative">
      <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400">
        <motion.button
          onClick={handleLike}
          className={`flex items-center space-x-1 transition-colors ${
            hasLiked 
              ? 'text-red-500' 
              : 'hover:text-red-500'
          }`}
          whileTap={{ scale: 0.9 }}
        >
          <motion.div
            animate={isAnimating ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <Heart 
              size={20} 
              className={hasLiked ? 'fill-current' : ''} 
            />
          </motion.div>
          <span className="font-medium">{likes}</span>
        </motion.button>

        <button className="flex items-center space-x-1 hover:text-primary-500 transition-colors">
          <MessageCircle size={20} />
          <span className="font-medium">{initialComments}</span>
        </button>
      </div>

      {/* Login Prompt */}
      {showLoginPrompt && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full mt-2 left-0 bg-gray-900 dark:bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 whitespace-nowrap z-50"
        >
          <LogIn size={16} />
          <span className="text-sm">Inicia sesión para dar like</span>
        </motion.div>
      )}
    </div>
  );
};

export default PostReactions;

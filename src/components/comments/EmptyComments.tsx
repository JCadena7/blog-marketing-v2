import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, PenTool } from 'lucide-react';

const EmptyComments: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-gray-50 dark:bg-gray-800 rounded-lg p-12 text-center border border-gray-200 dark:border-gray-700"
  >
    <div className="relative">
      <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <PenTool className="w-6 h-6 text-primary-500 absolute -bottom-1 -right-1" />
    </div>
    
    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
      Sé el primero en comentar
    </h3>
    <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
      Comparte tu opinión sobre este artículo y comienza la conversación. 
      Tu perspectiva es valiosa para la comunidad.
    </p>
    
    <div className="mt-6 flex items-center justify-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
      <div className="flex items-center">
        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
        Moderación activa
      </div>
      <div className="flex items-center">
        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
        Comunidad respetuosa
      </div>
      <div className="flex items-center">
        <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
        Discusión constructiva
      </div>
    </div>
  </motion.div>
);

export default EmptyComments;
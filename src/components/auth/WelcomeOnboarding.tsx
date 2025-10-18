import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Shield, CreditCard as Edit, PenTool, User, MessageCircle, ArrowRight, CircleCheck as CheckCircle, Send } from 'lucide-react';
import { ROLE_CONFIG, type Role } from '../../data/rolePermissions';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../admin/AdminNotificationSystem';
import Button from '../ui/Button';
import Card from '../ui/Card';
import RoleBadge from '../admin/RoleBadge';

interface WelcomeOnboardingProps {
  isOpen: boolean;
  onComplete: () => void;
}

const WelcomeOnboarding: React.FC<WelcomeOnboardingProps> = ({ isOpen, onComplete }) => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [requestReason, setRequestReason] = useState('');
  const [experience, setExperience] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const steps = [
    { id: 1, title: 'Bienvenido', description: 'Te damos la bienvenida a Marketing Pro' },
    { id: 2, title: 'Tu Rol Actual', description: 'Conoce tus permisos actuales' },
    { id: 3, title: 'Solicitar Nuevo Rol', description: 'Opcional: solicita un rol diferente' },
    { id: 4, title: '¡Listo!', description: 'Comienza a usar la plataforma' }
  ];

  const availableRoles: Role[] = ['administrador', 'editor', 'escritor'];

  const handleRoleRequest = async () => {
    if (!selectedRole || !requestReason.trim()) return;

    setSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      addNotification({
        type: 'success',
        title: 'Solicitud enviada',
        message: `Tu solicitud para el rol ${selectedRole} ha sido enviada. Te notificaremos cuando sea revisada.`
      });
      
      setCurrentStep(4);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo enviar la solicitud. Inténtalo más tarde.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = () => {
    // Mark user as no longer new
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboarding_completed', 'true');
    }
    onComplete();
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-gray-800 dark:to-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white">
                ¡Bienvenido a Marketing Pro!
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {steps[currentStep - 1].description}
              </p>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Paso {currentStep} de {steps.length}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <motion.div
                    animate={{
                      backgroundColor: currentStep >= step.id ? '#3B82F6' : '#E5E7EB',
                      scale: currentStep === step.id ? 1.1 : 1
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                  >
                    {step.id}
                  </motion.div>
                  {index < steps.length - 1 && (
                    <motion.div 
                      className="w-16 h-0.5 bg-gray-200 dark:bg-gray-600 mx-2"
                      animate={{
                        backgroundColor: currentStep > step.id ? '#3B82F6' : '#E5E7EB'
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center space-y-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="w-20 h-20 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto"
                >
                  <Crown size={40} className="text-primary-600 dark:text-primary-400" />
                </motion.div>
                
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    ¡Hola {user.firstName}!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Te damos la bienvenida a Marketing Pro, la plataforma líder en marketing digital. 
                    Estamos emocionados de tenerte en nuestra comunidad.
                  </p>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    A continuación te mostraremos tu rol actual y cómo puedes aprovechar al máximo la plataforma.
                  </p>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Tu Rol Actual
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Has sido asignado al siguiente rol:
                  </p>
                </div>

                <Card className="text-center">
                  <div className="space-y-4">
                    <div className="text-4xl">{ROLE_CONFIG[user.role as Role].icon}</div>
                    <RoleBadge role={user.role as Role} size="lg" />
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Rol: {ROLE_CONFIG[user.role as Role].name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {getRoleDescription(user.role as Role)}
                      </p>
                    </div>
                  </div>
                </Card>

                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">
                    ¿Qué puedes hacer con este rol?
                  </h4>
                  <ul className="text-sm text-green-700 dark:text-green-400 space-y-1">
                    {getRoleCapabilities(user.role as Role).map((capability, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle size={14} className="mr-2 flex-shrink-0" />
                        {capability}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    ¿Necesitas un rol diferente?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Si crees que necesitas permisos adicionales, puedes solicitar un rol diferente.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Selecciona el rol que necesitas:
                    </label>
                    <div className="space-y-2">
                      {availableRoles.map((role) => (
                        <motion.button
                          key={role}
                          type="button"
                          onClick={() => setSelectedRole(role)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`w-full text-left p-4 border-2 rounded-lg transition-all ${
                            selectedRole === role
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="text-2xl">{ROLE_CONFIG[role].icon}</div>
                            <div>
                              <RoleBadge role={role} />
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {getRoleDescription(role)}
                              </p>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {selectedRole && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          ¿Por qué necesitas este rol? *
                        </label>
                        <textarea
                          value={requestReason}
                          onChange={(e) => setRequestReason(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                          placeholder="Explica por qué necesitas este rol y cómo planeas usarlo..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Experiencia relevante (opcional)
                        </label>
                        <textarea
                          value={experience}
                          onChange={(e) => setExperience(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                          placeholder="Describe tu experiencia en marketing digital, escritura, etc..."
                        />
                      </div>
                    </motion.div>
                  )}

                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(4)}
                      className="flex-1"
                    >
                      Continuar con rol actual
                    </Button>
                    {selectedRole && requestReason.trim() && (
                      <Button
                        onClick={handleRoleRequest}
                        loading={submitting}
                        className="flex-1"
                      >
                        <Send size={16} className="mr-2" />
                        Enviar Solicitud
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center space-y-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto"
                >
                  <CheckCircle size={40} className="text-green-600 dark:text-green-400" />
                </motion.div>
                
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    ¡Todo listo!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Ya puedes comenzar a usar Marketing Pro. Explora el dashboard, 
                    crea contenido y conecta con nuestra comunidad.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Edit size={24} className="text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                    <p className="font-medium text-blue-800 dark:text-blue-300">Crear Posts</p>
                    <p className="text-blue-600 dark:text-blue-400">Comparte tu conocimiento</p>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <MessageCircle size={24} className="text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                    <p className="font-medium text-purple-800 dark:text-purple-300">Comentar</p>
                    <p className="text-purple-600 dark:text-purple-400">Participa en discusiones</p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <User size={24} className="text-green-600 dark:text-green-400 mx-auto mb-2" />
                    <p className="font-medium text-green-800 dark:text-green-300">Perfil</p>
                    <p className="text-green-600 dark:text-green-400">Personaliza tu cuenta</p>
                  </div>
                </div>

                <Button onClick={handleComplete} className="w-full">
                  <ArrowRight size={16} className="mr-2" />
                  Ir al Dashboard
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        {currentStep < 4 && currentStep !== 3 && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
              >
                Anterior
              </Button>
              <Button
                onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
              >
                {currentStep === steps.length - 1 ? 'Finalizar' : 'Siguiente'}
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const getRoleDescription = (role: Role): string => {
  const descriptions = {
    creador: 'Acceso completo al sistema y gestión de todos los aspectos',
    administrador: 'Gestión completa de usuarios, contenido y configuración',
    editor: 'Edición y moderación de contenido, gestión de categorías',
    escritor: 'Creación y edición de posts propios, participación activa',
    autor: 'Creación de posts con aprobación, comentarios y reacciones',
    comentador: 'Participación en discusiones y reacciones a contenido'
  };
  return descriptions[role];
};

const getRoleCapabilities = (role: Role): string[] => {
  const capabilities = {
    creador: ['Acceso completo', 'Gestión de roles', 'Configuración avanzada'],
    administrador: ['Gestión de usuarios', 'Moderación completa', 'Analytics avanzados'],
    editor: ['Editar cualquier post', 'Moderar comentarios', 'Gestionar categorías'],
    escritor: ['Crear posts', 'Editar posts propios', 'Comentar y reaccionar'],
    autor: ['Crear posts (con aprobación)', 'Editar borradores', 'Participar en comunidad'],
    comentador: ['Comentar posts', 'Dar likes', 'Perfil básico']
  };
  return capabilities[role] || [];
};

export default WelcomeOnboarding;
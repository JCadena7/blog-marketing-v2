import React, { useState, useRef } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { Mail, Lock, Eye, EyeOff, LogIn, CircleAlert as AlertCircle } from 'lucide-react';
import { useFormValidation } from '../../hooks/useFormValidation';
import { loginSchema, type LoginFormData } from '../../schemas/authSchemas';
import { login } from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../admin/AdminNotificationSystem';
import Input from '../ui/Input';
import Button from '../ui/Button';
import SocialButtons from './SocialButtons';
import LoadingSpinner from '../animations/LoadingSpinner';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onForgotPassword: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister, onForgotPassword }) => {
  const { login: authLogin } = useAuth();
  const { addNotification } = useNotifications();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors
  } = useFormValidation<LoginFormData>({
    schema: loginSchema,
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  });

  // Shake animation on error
  const shakeForm = () => {
    if (formRef.current) {
      gsap.fromTo(formRef.current, 
        { x: 0 },
        // { 
        //   x: [-10, 10, -10, 10, 0],
        //   duration: 0.4,
        //   ease: 'power2.inOut'
        // }
        {
          keyframes: [
            { x: -10 },
            { x: 10 },
            { x: -10 },
            { x: 10 },
            { x: 0 }
          ],
          duration: 0.4,
          ease: "power2.inOut"
        }
      );
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    clearErrors();

    try {
      const result = await login(data);
      
      // Success animation
      if (formRef.current) {
        gsap.to(formRef.current, {
          scale: 0.95,
          opacity: 0.8,
          duration: 0.3,
          ease: 'power2.inOut'
        });
      }

      // Login to context and redirect
      await authLogin(result.user, result.token);
      
      addNotification({
        type: 'success',
        title: '¡Bienvenido de vuelta!',
        message: `Hola ${result.user.firstName}, has iniciado sesión exitosamente.`
      });

      // Redirect will be handled by AuthContext
      
    } catch (error: any) {
      setSubmitError(error.message);
      shakeForm();
      
      addNotification({
        type: 'error',
        title: 'Error de autenticación',
        message: error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialSuccess = async (provider: string, userData: any) => {
    try {
      // Mock social login success
      await authLogin(userData, 'mock_social_token');
      
      addNotification({
        type: 'success',
        title: '¡Bienvenido!',
        message: `Has iniciado sesión con ${provider} exitosamente.`
      });
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Error de autenticación',
        message: 'No se pudo completar el inicio de sesión social.'
      });
      console.error('Social login failed', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="text-center mb-8">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2"
        >
          Iniciar Sesión
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-gray-600 dark:text-gray-400"
        >
          Accede a tu cuenta de Marketing Pro
        </motion.p>
      </div>

      <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Submit Error */}
        <AnimatePresence>
          {submitError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
            >
              <div className="flex items-center space-x-2">
                <AlertCircle size={16} className="text-red-600 dark:text-red-400" />
                <span className="text-sm text-red-800 dark:text-red-300">{submitError}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Input
            label="Email"
            type="email"
            {...register('email')}
            error={errors.email?.message}
            icon={<Mail size={20} className="text-gray-400" />}
            placeholder="tu@email.com"
            autoComplete="email"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="relative">
            <Input
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              error={errors.password?.message}
              icon={<Lock size={20} className="text-gray-400" />}
              placeholder="Tu contraseña"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <motion.div
                animate={{ rotate: showPassword ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </motion.div>
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              {...register('rememberMe')}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">Recordarme</span>
          </div>
          
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            type="submit"
            className="w-full"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <LoadingSpinner size="sm" text="Iniciando sesión..." />
            ) : (
              <>
                <LogIn size={20} className="mr-2" />
                Iniciar Sesión
              </>
            )}
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <SocialButtons mode="login" onSuccess={handleSocialSuccess} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <span className="text-gray-600 dark:text-gray-400">¿No tienes cuenta? </span>
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 font-medium transition-colors"
          >
            Regístrate aquí
          </button>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default LoginForm;
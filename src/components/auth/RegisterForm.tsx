import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { User, Mail, Lock, Eye, EyeOff, UserPlus, CircleAlert as AlertCircle, CircleCheck as CheckCircle } from 'lucide-react';
import { useFormValidation } from '../../hooks/useFormValidation';
import { registerSchema, type RegisterFormData } from '../../schemas/authSchemas';
import { register as registerUser, checkEmailAvailability } from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../admin/AdminNotificationSystem';
import Input from '../ui/Input';
import Button from '../ui/Button';
import SocialButtons from './SocialButtons';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import LoadingSpinner from '../animations/LoadingSpinner';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const { login: authLogin } = useAuth();
  const { addNotification } = useNotifications();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
    clearErrors
  } = useFormValidation<RegisterFormData>({
    schema: registerSchema,
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false
    }
  });

  const watchedEmail = watch('email');
  const watchedPassword = watch('password');

  // Check email availability with debounce
  useEffect(() => {
    if (!watchedEmail || !watchedEmail.includes('@')) {
      setEmailAvailable(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setEmailChecking(true);
        const available = await checkEmailAvailability(watchedEmail);
        setEmailAvailable(available);
        
        if (!available) {
          setError('email', { message: 'Este email ya está registrado' });
        } else {
          clearErrors('email');
        }
      } catch (error) {
        setEmailAvailable(null);
      } finally {
        setEmailChecking(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [watchedEmail, setError, clearErrors]);

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

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    clearErrors();

    try {
      const result = await registerUser(data);
      
      // Success animation
      if (formRef.current) {
        gsap.to(formRef.current, {
          scale: 0.95,
          opacity: 0.8,
          duration: 0.3,
          ease: 'power2.inOut'
        });
      }

      // Auto-login after successful registration
      await authLogin(result.user, result.token, true); // true indicates new user
      
      addNotification({
        type: 'success',
        title: '¡Cuenta creada exitosamente!',
        message: `Bienvenido ${result.user.firstName}. Tu cuenta ha sido creada.`
      });

      // Redirect will be handled by AuthContext
      
    } catch (error: any) {
      setSubmitError(error.message);
      shakeForm();
      
      addNotification({
        type: 'error',
        title: 'Error al crear cuenta',
        message: error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialSuccess = async (provider: string, userData: any) => {
    try {
      // Mock social registration success
      await authLogin(userData, 'mock_social_token', true);
      
      addNotification({
        type: 'success',
        title: '¡Cuenta creada!',
        message: `Te has registrado con ${provider} exitosamente.`
      });
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Error de registro',
        message: 'No se pudo completar el registro social.'
      });
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
          Crear Cuenta
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-gray-600 dark:text-gray-400"
        >
          Únete a la comunidad de Marketing Pro
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

        {/* Name fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Input
              label="Nombre"
              {...register('firstName')}
              error={errors.firstName?.message}
              icon={<User size={20} className="text-gray-400" />}
              placeholder="Tu nombre"
              autoComplete="given-name"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Input
              label="Apellidos"
              {...register('lastName')}
              error={errors.lastName?.message}
              icon={<User size={20} className="text-gray-400" />}
              placeholder="Tus apellidos"
              autoComplete="family-name"
            />
          </motion.div>
        </div>

        {/* Email field with availability check */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="relative">
            <Input
              label="Email"
              type="email"
              {...register('email')}
              error={errors.email?.message}
              icon={<Mail size={20} className="text-gray-400" />}
              placeholder="tu@email.com"
              autoComplete="email"
            />
            <div className="absolute right-3 top-8">
              {emailChecking && (
                <LoadingSpinner size="sm" />
              )}
              {!emailChecking && emailAvailable === true && (
                <CheckCircle size={20} className="text-green-500" />
              )}
              {!emailChecking && emailAvailable === false && (
                <AlertCircle size={20} className="text-red-500" />
              )}
            </div>
          </div>
        </motion.div>

        {/* Password field */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="relative">
            <Input
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              error={errors.password?.message}
              icon={<Lock size={20} className="text-gray-400" />}
              placeholder="Crea una contraseña segura"
              autoComplete="new-password"
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
          
          {/* Password strength meter */}
          <AnimatePresence>
            {watchedPassword && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3"
              >
                <PasswordStrengthMeter password={watchedPassword} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Confirm password field */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="relative">
            <Input
              label="Confirmar Contraseña"
              type={showConfirmPassword ? 'text' : 'password'}
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
              icon={<Lock size={20} className="text-gray-400" />}
              placeholder="Confirma tu contraseña"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <motion.div
                animate={{ rotate: showConfirmPassword ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </motion.div>
            </button>
          </div>
        </motion.div>

        {/* Terms checkbox */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              {...register('acceptTerms')}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 mt-1"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Acepto los{' '}
              <a href="/terminos" target="_blank" className="text-primary-600 dark:text-primary-400 hover:underline">
                términos y condiciones
              </a>{' '}
              y la{' '}
              <a href="/privacidad" target="_blank" className="text-primary-600 dark:text-primary-400 hover:underline">
                política de privacidad
              </a>
            </span>
          </label>
          {errors.acceptTerms && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-600 dark:text-red-400 mt-1"
            >
              {errors.acceptTerms.message}
            </motion.p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Button
            type="submit"
            className="w-full"
            loading={isSubmitting}
            disabled={isSubmitting || emailAvailable === false}
          >
            {isSubmitting ? (
              <LoadingSpinner size="sm" text="Creando cuenta..." />
            ) : (
              <>
                <UserPlus size={20} className="mr-2" />
                Crear Cuenta
              </>
            )}
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          {/* <SocialButtons mode="register" onSuccess={handleSocialSuccess} /> */}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="text-center"
        >
          <span className="text-gray-600 dark:text-gray-400">¿Ya tienes cuenta? </span>
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 font-medium transition-colors"
          >
            Inicia sesión aquí
          </button>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default RegisterForm;
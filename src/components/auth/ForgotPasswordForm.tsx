import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { Mail, ArrowLeft, Send, CircleAlert as AlertCircle, CircleCheck as CheckCircle } from 'lucide-react';
import { useFormValidation } from '../../hooks/useFormValidation';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '../../schemas/authSchemas';
import { forgotPassword } from '../../services/authService';
import { useNotifications } from '../admin/AdminNotificationSystem';
import Input from '../ui/Input';
import Button from '../ui/Button';
import LoadingSpinner from '../animations/LoadingSpinner';

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBackToLogin }) => {
  const { addNotification } = useNotifications();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
    watch
  } = useFormValidation<ForgotPasswordFormData>({
    schema: forgotPasswordSchema,
    defaultValues: {
      email: ''
    }
  });

  const watchedEmail = watch('email');

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

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    clearErrors();

    try {
      await forgotPassword(data.email);
      setEmailSent(true);
      
      addNotification({
        type: 'success',
        title: 'Email enviado',
        message: 'Revisa tu bandeja de entrada para restablecer tu contraseña.'
      });
      
    } catch (error: any) {
      setSubmitError(error.message);
      shakeForm();
      
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (emailSent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto"
        >
          <CheckCircle size={32} className="text-green-600 dark:text-green-400" />
        </motion.div>
        
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Email Enviado
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Hemos enviado un enlace de restablecimiento a:
          </p>
          <p className="font-medium text-primary-600 dark:text-primary-400">
            {watchedEmail}
          </p>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            Si no recibes el email en unos minutos, revisa tu carpeta de spam o solicita un nuevo enlace.
          </p>
        </div>
        
        <Button variant="outline" onClick={onBackToLogin} className="w-full">
          <ArrowLeft size={16} className="mr-2" />
          Volver al Login
        </Button>
      </motion.div>
    );
  }

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
          ¿Olvidaste tu contraseña?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-gray-600 dark:text-gray-400"
        >
          Ingresa tu email y te enviaremos un enlace para restablecerla
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
          className="space-y-3"
        >
          <Button
            type="submit"
            className="w-full"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <LoadingSpinner size="sm" text="Enviando..." />
            ) : (
              <>
                <Send size={20} className="mr-2" />
                Enviar Enlace de Restablecimiento
              </>
            )}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={onBackToLogin}
            className="w-full"
            disabled={isSubmitting}
          >
            <ArrowLeft size={16} className="mr-2" />
            Volver al Login
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default ForgotPasswordForm;
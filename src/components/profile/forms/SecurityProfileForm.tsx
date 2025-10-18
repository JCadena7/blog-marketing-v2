import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, Lock, Key, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Eye, EyeOff } from 'lucide-react';
import { changePassword } from '../../../services/profileService';
import { useNotifications } from '../../admin/AdminNotificationSystem';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Card from '../../ui/Card';

interface SecurityProfileFormProps {
  userId: number;
}

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Contraseña actual requerida'),
  newPassword: z.string()
    .min(8, 'Contraseña debe tener al menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'Contraseña debe contener mayúscula, minúscula, número y carácter especial'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

const SecurityProfileForm: React.FC<SecurityProfileFormProps> = ({ userId }) => {
  const { addNotification } = useNotifications();
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [changing, setChanging] = useState(false);

  const form = useForm({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  const { register, handleSubmit, formState: { errors }, reset, watch } = form;

  const newPassword = watch('newPassword');

  const onSubmit = async (data: any) => {
    try {
      setChanging(true);
      
      await changePassword(userId, data.currentPassword, data.newPassword);
      
      addNotification({
        type: 'success',
        title: 'Contraseña actualizada',
        message: 'Tu contraseña ha sido cambiada exitosamente'
      });
      
      reset();
      
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Error al cambiar contraseña',
        message: error.message || 'No se pudo cambiar la contraseña'
      });
    } finally {
      setChanging(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&]/.test(password)
    };

    strength = Object.values(checks).filter(Boolean).length;

    const strengthConfig = {
      0: { label: 'Muy débil', color: 'bg-red-500', textColor: 'text-red-600' },
      1: { label: 'Débil', color: 'bg-red-400', textColor: 'text-red-600' },
      2: { label: 'Regular', color: 'bg-yellow-500', textColor: 'text-yellow-600' },
      3: { label: 'Buena', color: 'bg-yellow-400', textColor: 'text-yellow-600' },
      4: { label: 'Fuerte', color: 'bg-green-500', textColor: 'text-green-600' },
      5: { label: 'Muy fuerte', color: 'bg-green-600', textColor: 'text-green-600' }
    };

    return { strength, checks, config: strengthConfig[strength as keyof typeof strengthConfig] };
  };

  const passwordAnalysis = newPassword ? getPasswordStrength(newPassword) : null;

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="space-y-8">
      {/* Security Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Shield size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Seguridad de la Cuenta
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                Mantén tu cuenta segura actualizando regularmente tu contraseña y habilitando 
                la autenticación de dos factores cuando esté disponible.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Change Password */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <Key size={20} className="mr-2 text-primary-500" />
            Cambiar Contraseña
          </h3>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <Input
                  label="Contraseña actual"
                  type={showPasswords.current ? 'text' : 'password'}
                  {...register('currentPassword')}
                  error={errors.currentPassword?.message}
                  icon={<Lock size={20} className="text-gray-400" />}
                  placeholder="Ingresa tu contraseña actual"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div className="relative">
                <Input
                  label="Nueva contraseña"
                  type={showPasswords.new ? 'text' : 'password'}
                  {...register('newPassword')}
                  error={errors.newPassword?.message}
                  icon={<Key size={20} className="text-gray-400" />}
                  placeholder="Ingresa tu nueva contraseña"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {passwordAnalysis && newPassword && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Fortaleza de la contraseña
                      </span>
                      <span className={`text-sm font-medium ${passwordAnalysis.config.textColor}`}>
                        {passwordAnalysis.config.label}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${passwordAnalysis.config.color}`}
                        style={{ width: `${(passwordAnalysis.strength / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    {Object.entries(passwordAnalysis.checks).map(([check, passed]) => (
                      <div key={check} className={`flex items-center ${passed ? 'text-green-600' : 'text-gray-400'}`}>
                        <CheckCircle size={14} className="mr-2" />
                        <span>
                          {check === 'length' && 'Al menos 8 caracteres'}
                          {check === 'lowercase' && 'Letra minúscula'}
                          {check === 'uppercase' && 'Letra mayúscula'}
                          {check === 'number' && 'Número'}
                          {check === 'special' && 'Carácter especial'}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              <div className="relative">
                <Input
                  label="Confirmar nueva contraseña"
                  type={showPasswords.confirm ? 'text' : 'password'}
                  {...register('confirmPassword')}
                  error={errors.confirmPassword?.message}
                  icon={<Key size={20} className="text-gray-400" />}
                  placeholder="Confirma tu nueva contraseña"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                loading={changing}
                disabled={!form.formState.isValid}
              >
                <Key size={16} className="mr-2" />
                Cambiar Contraseña
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>

      {/* Security Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start space-x-3">
            <AlertTriangle size={20} className="text-yellow-600 dark:text-yellow-400 mt-1" />
            <div>
              <h4 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
                Consejos de Seguridad
              </h4>
              <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
                <li>• Usa una contraseña única que no uses en otros sitios</li>
                <li>• Incluye una combinación de letras, números y símbolos</li>
                <li>• Cambia tu contraseña regularmente (cada 3-6 meses)</li>
                <li>• No compartas tu contraseña con nadie</li>
                <li>• Considera usar un gestor de contraseñas</li>
              </ul>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Two-Factor Authentication (Future Feature) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="opacity-75">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <Shield size={20} className="text-gray-500" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Autenticación de Dos Factores
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Añade una capa extra de seguridad a tu cuenta
                </p>
              </div>
            </div>
            <Button variant="outline" disabled>
              Próximamente
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default SecurityProfileForm;
import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Users, Mail, MessageCircle, ChartBar as BarChart3, Globe, Download, Trash2, TriangleAlert as AlertTriangle, Shield, UserCheck, ExternalLink } from 'lucide-react';
import { useNotifications } from '../../admin/AdminNotificationSystem';
import { exportUserData, requestAccountDeletion } from '../../../services/profileService';
import Button from '../../ui/Button';
import Card from '../../ui/Card';

interface PrivacySettingsFormProps {
  form: any;
}

const PrivacySettingsForm: React.FC<PrivacySettingsFormProps> = ({ form }) => {
  const { addNotification } = useNotifications();
  const { watch } = form;

  const ToggleSwitch: React.FC<{
    name: string;
    label: string;
    description: string;
    icon?: React.ComponentType<{ size?: number; className?: string }>;
  }> = ({ name, label, description, icon: Icon }) => {
    const isEnabled = watch(name);
    
    return (
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
        onClick={() => {
          const currentValue = watch(name);
          form.setValue(name, !currentValue, { shouldDirty: true });
        }}
      >
        <div className="flex items-start space-x-3">
          {Icon && (
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <Icon size={16} className="text-gray-600 dark:text-gray-400" />
            </div>
          )}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">{label}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
          </div>
        </div>
        <div className="ml-4">
          <div
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isEnabled ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </div>
        </div>
      </motion.div>
    );
  };

  const SelectSetting: React.FC<{
    name: string;
    label: string;
    description: string;
    options: Array<{ value: string; label: string; description?: string }>;
    icon?: React.ComponentType<{ size?: number; className?: string }>;
  }> = ({ name, label, description, options, icon: Icon }) => {
    return (
      <div className="flex items-start justify-between p-4">
        <div className="flex items-start space-x-3 flex-1">
          {Icon && (
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <Icon size={16} className="text-gray-600 dark:text-gray-400" />
            </div>
          )}
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 dark:text-white">{label}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
          </div>
        </div>
        <div className="ml-4 min-w-48">
          <select
            {...form.register(name)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
          >
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  };

  const handleExportData = async () => {
    try {
      addNotification({
        type: 'info',
        title: 'Generando exportación',
        message: 'Estamos preparando tus datos. Te notificaremos cuando esté listo.'
      });
      
      const result = await exportUserData(1); // Current user ID
      
      addNotification({
        type: 'success',
        title: 'Datos exportados',
        message: 'Tu archivo de datos está listo para descargar.',
        action: {
          label: 'Descargar',
          onClick: () => window.open(result.downloadUrl, '_blank')
        }
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error en exportación',
        message: 'No se pudieron exportar tus datos. Inténtalo más tarde.'
      });
    }
  };

  const handleDeleteAccount = async () => {
    const reason = prompt('¿Por qué quieres eliminar tu cuenta? (opcional)');
    
    if (confirm('¿Estás COMPLETAMENTE seguro? Esta acción NO se puede deshacer.')) {
      try {
        await requestAccountDeletion(1, reason || ''); // Current user ID
        
        addNotification({
          type: 'warning',
          title: 'Solicitud de eliminación enviada',
          message: 'Tu solicitud ha sido enviada. Recibirás un email con los próximos pasos.'
        });
      } catch (error) {
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'No se pudo procesar tu solicitud. Contacta al soporte.'
        });
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Profile Visibility */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <Eye size={20} className="mr-2 text-primary-500" />
            Visibilidad del Perfil
          </h3>
          
          <div className="space-y-1">
            <SelectSetting
              name="preferences.profileVisibility"
              label="Perfil público"
              description="Controla quién puede ver tu perfil completo"
              icon={Users}
              options={[
                { value: 'public', label: 'Público - Visible para todos' },
                { value: 'users', label: 'Solo usuarios registrados' },
                { value: 'followers', label: 'Solo seguidores' },
                { value: 'private', label: 'Privado - Solo tú' }
              ]}
            />
            
            <ToggleSwitch
              name="preferences.showEmail"
              label="Mostrar email"
              description="Tu email será visible en tu perfil público"
              icon={Mail}
            />
            
            <ToggleSwitch
              name="preferences.showSocialLinks"
              label="Mostrar enlaces sociales"
              description="Tus redes sociales serán visibles en tu perfil"
              icon={Globe}
            />
            
            <ToggleSwitch
              name="preferences.showOnlineStatus"
              label="Mostrar estado en línea"
              description="Otros pueden ver cuando estás conectado"
              icon={UserCheck}
            />
          </div>
        </Card>
      </motion.div>

      {/* Communication */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <MessageCircle size={20} className="mr-2 text-primary-500" />
            Comunicación
          </h3>
          
          <div className="space-y-1">
            <SelectSetting
              name="preferences.allowDirectMessages"
              label="Mensajes directos"
              description="Controla quién puede enviarte mensajes privados"
              icon={MessageCircle}
              options={[
                { value: 'everyone', label: 'Cualquier usuario' },
                { value: 'followers', label: 'Solo seguidores' },
                { value: 'none', label: 'Nadie' }
              ]}
            />
          </div>
        </Card>
      </motion.div>

      {/* Content & Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <BarChart3 size={20} className="mr-2 text-primary-500" />
            Contenido y Analytics
          </h3>
          
          <div className="space-y-1">
            <ToggleSwitch
              name="preferences.allowAnalytics"
              label="Analytics de perfil"
              description="Permite recopilar datos sobre las visitas a tu perfil"
              icon={BarChart3}
            />
            
            <ToggleSwitch
              name="preferences.indexPosts"
              label="Indexar posts"
              description="Permitir que los motores de búsqueda indexen tus posts"
              icon={Globe}
            />
            
            <ToggleSwitch
              name="preferences.allowComments"
              label="Comentarios en posts"
              description="Permitir comentarios en tus posts por defecto"
              icon={MessageCircle}
            />
            
            <ToggleSwitch
              name="preferences.moderateComments"
              label="Moderar comentarios"
              description="Revisar comentarios antes de publicarlos"
              icon={Shield}
            />
          </div>
        </Card>
      </motion.div>

      {/* Data Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <Lock size={20} className="mr-2 text-primary-500" />
            Gestión de Datos
          </h3>
          
          <div className="space-y-6">
            {/* Export Data */}
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start space-x-3">
                <Download size={20} className="text-blue-600 dark:text-blue-400 mt-1" />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-300">
                    Exportar mis datos
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    Descarga una copia completa de todos tus datos personales
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleExportData}
                className="border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400"
              >
                <Download size={16} className="mr-2" />
                Exportar
              </Button>
            </div>

            {/* Delete Account */}
            <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-start space-x-3">
                <Trash2 size={20} className="text-red-600 dark:text-red-400 mt-1" />
                <div>
                  <h4 className="font-medium text-red-900 dark:text-red-300">
                    Eliminar cuenta
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-400">
                    Elimina permanentemente tu cuenta y todos tus datos
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleDeleteAccount}
                className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400"
              >
                <Trash2 size={16} className="mr-2" />
                Eliminar
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Privacy Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <div className="flex items-start space-x-3">
            <Shield size={20} className="text-gray-600 dark:text-gray-400 mt-1" />
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Política de Privacidad
              </h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Respetamos tu privacidad y protegemos tus datos personales. Puedes revisar nuestra 
                política de privacidad completa para entender cómo recopilamos, usamos y protegemos 
                tu información.
              </p>
              <div className="mt-4">
                <a
                  href="/privacidad"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Leer Política de Privacidad
                  <ExternalLink size={12} className="ml-1" />
                </a>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default PrivacySettingsForm;
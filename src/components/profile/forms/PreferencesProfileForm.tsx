import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Bell, Palette, Globe, CreditCard as Edit, Save, Monitor } from 'lucide-react';
import Card from '../../ui/Card';

interface PreferencesProfileFormProps {
  form: any;
  userRole: string;
}

const PreferencesProfileForm: React.FC<PreferencesProfileFormProps> = ({ form, userRole }) => {
  const { register, watch } = form;

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

  return (
    <div className="space-y-8">
      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <Bell size={20} className="mr-2 text-primary-500" />
            Notificaciones
          </h3>
          
          <div className="space-y-1">
            <ToggleSwitch
              name="preferences.emailNotifications"
              label="Notificaciones por email"
              description="Recibe notificaciones importantes por correo electrónico"
              icon={Bell}
            />
            
            <ToggleSwitch
              name="preferences.pushNotifications"
              label="Notificaciones push"
              description="Recibe notificaciones en tiempo real en el navegador"
              icon={Bell}
            />
            
            <ToggleSwitch
              name="preferences.marketingEmails"
              label="Emails de marketing"
              description="Recibe newsletters y contenido promocional"
              icon={Bell}
            />
          </div>
        </Card>
      </motion.div>

      {/* Appearance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <Palette size={20} className="mr-2 text-primary-500" />
            Apariencia
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Tema
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'light', label: 'Claro', icon: '☀️' },
                  { value: 'dark', label: 'Oscuro', icon: '🌙' },
                  { value: 'system', label: 'Sistema', icon: '💻' }
                ].map((theme) => (
                  <label
                    key={theme.value}
                    className={`relative flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      watch('preferences.theme') === theme.value
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <input
                      type="radio"
                      {...register('preferences.theme')}
                      value={theme.value}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <div className="text-2xl mb-2">{theme.icon}</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {theme.label}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Idioma
                </label>
                <select
                  {...register('preferences.language')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Zona horaria
                </label>
                <select
                  {...register('preferences.timezone')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="Europe/Madrid">Madrid (UTC+1)</option>
                  <option value="America/Mexico_City">Ciudad de México (UTC-6)</option>
                  <option value="America/New_York">Nueva York (UTC-5)</option>
                  <option value="America/Los_Angeles">Los Ángeles (UTC-8)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Editor Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <Edit size={20} className="mr-2 text-primary-500" />
            Editor de Contenido
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Editor predeterminado
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { value: 'markdown', label: 'Markdown', description: 'Editor de texto plano con sintaxis Markdown' },
                  { value: 'wysiwyg', label: 'Visual', description: 'Editor visual tipo Word' },
                  { value: 'hybrid', label: 'Híbrido', description: 'Combina ambos editores' }
                ].map((editor) => (
                  <label
                    key={editor.value}
                    className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      watch('preferences.defaultEditor') === editor.value
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <input
                      type="radio"
                      {...register('preferences.defaultEditor')}
                      value={editor.value}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <div className="font-medium text-gray-900 dark:text-white mb-1">
                        {editor.label}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {editor.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <ToggleSwitch
              name="preferences.autoSave"
              label="Guardado automático"
              description="Guarda automáticamente tus borradores mientras escribes"
              icon={Save}
            />
          </div>
        </Card>
      </motion.div>

      {/* Content Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <Settings size={20} className="mr-2 text-primary-500" />
            Configuración de Contenido
          </h3>
          
          <div className="space-y-1">
            <ToggleSwitch
              name="preferences.allowComments"
              label="Permitir comentarios por defecto"
              description="Los nuevos posts permitirán comentarios automáticamente"
            />
            
            {['editor', 'administrador', 'creador'].includes(userRole) && (
              <ToggleSwitch
                name="preferences.moderateComments"
                label="Moderar comentarios"
                description="Revisar comentarios antes de publicarlos"
              />
            )}
            
            <ToggleSwitch
              name="preferences.indexPosts"
              label="Indexar posts en buscadores"
              description="Permitir que Google y otros buscadores indexen tus posts"
            />
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default PreferencesProfileForm;
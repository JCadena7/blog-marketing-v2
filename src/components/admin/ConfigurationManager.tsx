import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Database, Shield, Mail, Globe, Palette, Bell, Save, RefreshCw, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Info } from 'lucide-react';
import { useNotifications } from './AdminNotificationSystem';
import { usePermissions } from '../../hooks/usePermissions';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';

interface ConfigSection {
  id: string;
  name: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  description: string;
  permission?: string;
}

const ConfigurationManager: React.FC = () => {
  const { hasPermission } = usePermissions();
  const { addNotification } = useNotifications();
  const [activeSection, setActiveSection] = useState('general');
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    general: {
      siteName: 'Marketing Pro',
      siteDescription: 'Blog de Marketing Digital',
      siteUrl: 'https://marketing-digital-pro.com',
      adminEmail: 'admin@marketing-digital-pro.com',
      timezone: 'Europe/Madrid',
      language: 'es'
    },
    seo: {
      metaTitle: 'Marketing Pro - Blog de Marketing Digital',
      metaDescription: 'Descubre las mejores estrategias de marketing digital',
      googleAnalyticsId: 'GA_MEASUREMENT_ID',
      googleSearchConsole: '',
      sitemapEnabled: true,
      robotsTxt: 'User-agent: *\nAllow: /'
    },
    email: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: '587',
      smtpUser: '',
      smtpPassword: '',
      fromEmail: 'noreply@marketing-digital-pro.com',
      fromName: 'Marketing Pro'
    },
    security: {
      enableTwoFactor: false,
      sessionTimeout: '24',
      maxLoginAttempts: '5',
      passwordMinLength: '8',
      requirePasswordChange: false
    },
    notifications: {
      emailNotifications: true,
      newPostNotifications: true,
      commentNotifications: true,
      userRegistrationNotifications: true,
      systemAlerts: true
    }
  });

  const sections: ConfigSection[] = [
    {
      id: 'general',
      name: 'General',
      icon: Settings,
      description: 'Configuración básica del sitio'
    },
    {
      id: 'seo',
      name: 'SEO',
      icon: Globe,
      description: 'Optimización para motores de búsqueda'
    },
    {
      id: 'email',
      name: 'Email',
      icon: Mail,
      description: 'Configuración de correo electrónico',
      permission: 'admin_completo'
    },
    {
      id: 'security',
      name: 'Seguridad',
      icon: Shield,
      description: 'Configuración de seguridad del sistema',
      permission: 'admin_completo'
    },
    {
      id: 'notifications',
      name: 'Notificaciones',
      icon: Bell,
      description: 'Configuración de notificaciones'
    }
  ].filter(section => !section.permission || hasPermission(section.permission as any));

  const handleSave = async (sectionId: string) => {
    try {
      setSaving(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      addNotification({
        type: 'success',
        title: 'Configuración guardada',
        message: `La configuración de ${sections.find(s => s.id === sectionId)?.name} ha sido actualizada.`
      });
      
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error al guardar',
        message: 'No se pudo guardar la configuración.'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async (type: string) => {
    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      addNotification({
        type: 'success',
        title: 'Conexión exitosa',
        message: `La conexión ${type} se ha establecido correctamente.`
      });
      
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error de conexión',
        message: `No se pudo establecer la conexión ${type}.`
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Configuración del Sistema
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Gestiona la configuración global del blog y sistema administrativo
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sections Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Secciones
            </h2>
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${
                    activeSection === section.id
                      ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <section.icon size={20} className={
                      activeSection === section.id
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-gray-400'
                    } />
                    <div>
                      <div className="font-medium">{section.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {section.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </nav>
          </Card>
        </div>

        {/* Configuration Content */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeSection === 'general' && (
              <GeneralConfig 
                config={config.general}
                onChange={(newConfig) => setConfig(prev => ({ ...prev, general: newConfig }))}
                onSave={() => handleSave('general')}
                saving={saving}
              />
            )}
            
            {activeSection === 'seo' && (
              <SEOConfig 
                config={config.seo}
                onChange={(newConfig) => setConfig(prev => ({ ...prev, seo: newConfig }))}
                onSave={() => handleSave('seo')}
                saving={saving}
              />
            )}
            
            {activeSection === 'email' && (
              <EmailConfig 
                config={config.email}
                onChange={(newConfig) => setConfig(prev => ({ ...prev, email: newConfig }))}
                onSave={() => handleSave('email')}
                onTest={() => handleTestConnection('email')}
                saving={saving}
              />
            )}
            
            {activeSection === 'security' && (
              <SecurityConfig 
                config={config.security}
                onChange={(newConfig) => setConfig(prev => ({ ...prev, security: newConfig }))}
                onSave={() => handleSave('security')}
                saving={saving}
              />
            )}
            
            {activeSection === 'notifications' && (
              <NotificationsConfig 
                config={config.notifications}
                onChange={(newConfig) => setConfig(prev => ({ ...prev, notifications: newConfig }))}
                onSave={() => handleSave('notifications')}
                saving={saving}
              />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const GeneralConfig: React.FC<{
  config: any;
  onChange: (config: any) => void;
  onSave: () => void;
  saving: boolean;
}> = ({ config, onChange, onSave, saving }) => (
  <Card>
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        Configuración General
      </h2>
      <Button onClick={onSave} loading={saving}>
        <Save size={16} className="mr-2" />
        Guardar Cambios
      </Button>
    </div>

    <div className="space-y-4">
      <Input
        label="Nombre del Sitio"
        value={config.siteName}
        onChange={(e) => onChange({ ...config, siteName: e.target.value })}
        placeholder="Nombre de tu blog"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Descripción del Sitio
        </label>
        <textarea
          value={config.siteDescription}
          onChange={(e) => onChange({ ...config, siteDescription: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          placeholder="Descripción breve de tu blog"
        />
      </div>

      <Input
        label="URL del Sitio"
        value={config.siteUrl}
        onChange={(e) => onChange({ ...config, siteUrl: e.target.value })}
        placeholder="https://tu-blog.com"
      />

      <Input
        label="Email del Administrador"
        type="email"
        value={config.adminEmail}
        onChange={(e) => onChange({ ...config, adminEmail: e.target.value })}
        placeholder="admin@tu-blog.com"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Zona Horaria
          </label>
          <select
            value={config.timezone}
            onChange={(e) => onChange({ ...config, timezone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="Europe/Madrid">Madrid (UTC+1)</option>
            <option value="America/New_York">Nueva York (UTC-5)</option>
            <option value="America/Los_Angeles">Los Ángeles (UTC-8)</option>
            <option value="UTC">UTC</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Idioma
          </label>
          <select
            value={config.language}
            onChange={(e) => onChange({ ...config, language: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="es">Español</option>
            <option value="en">English</option>
            <option value="fr">Français</option>
          </select>
        </div>
      </div>
    </div>
  </Card>
);

const SEOConfig: React.FC<{
  config: any;
  onChange: (config: any) => void;
  onSave: () => void;
  saving: boolean;
}> = ({ config, onChange, onSave, saving }) => (
  <Card>
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        Configuración SEO
      </h2>
      <Button onClick={onSave} loading={saving}>
        <Save size={16} className="mr-2" />
        Guardar Cambios
      </Button>
    </div>

    <div className="space-y-4">
      <Input
        label="Meta Title Global"
        value={config.metaTitle}
        onChange={(e) => onChange({ ...config, metaTitle: e.target.value })}
        placeholder="Título principal del sitio"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Meta Description Global
        </label>
        <textarea
          value={config.metaDescription}
          onChange={(e) => onChange({ ...config, metaDescription: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          placeholder="Descripción principal del sitio"
        />
      </div>

      <Input
        label="Google Analytics ID"
        value={config.googleAnalyticsId}
        onChange={(e) => onChange({ ...config, googleAnalyticsId: e.target.value })}
        placeholder="G-XXXXXXXXXX"
      />

      <Input
        label="Google Search Console"
        value={config.googleSearchConsole}
        onChange={(e) => onChange({ ...config, googleSearchConsole: e.target.value })}
        placeholder="Código de verificación"
      />

      <div className="space-y-3">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={config.sitemapEnabled}
            onChange={(e) => onChange({ ...config, sitemapEnabled: e.target.checked })}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Generar sitemap automáticamente</span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Robots.txt
        </label>
        <textarea
          value={config.robotsTxt}
          onChange={(e) => onChange({ ...config, robotsTxt: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm"
          placeholder="User-agent: *&#10;Allow: /"
        />
      </div>
    </div>
  </Card>
);

const EmailConfig: React.FC<{
  config: any;
  onChange: (config: any) => void;
  onSave: () => void;
  onTest: () => void;
  saving: boolean;
}> = ({ config, onChange, onSave, onTest, saving }) => (
  <Card>
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        Configuración de Email
      </h2>
      <div className="flex items-center space-x-3">
        <Button variant="outline" onClick={onTest}>
          <RefreshCw size={16} className="mr-2" />
          Probar Conexión
        </Button>
        <Button onClick={onSave} loading={saving}>
          <Save size={16} className="mr-2" />
          Guardar
        </Button>
      </div>
    </div>

    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Servidor SMTP"
          value={config.smtpHost}
          onChange={(e) => onChange({ ...config, smtpHost: e.target.value })}
          placeholder="smtp.gmail.com"
        />

        <Input
          label="Puerto SMTP"
          value={config.smtpPort}
          onChange={(e) => onChange({ ...config, smtpPort: e.target.value })}
          placeholder="587"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Usuario SMTP"
          value={config.smtpUser}
          onChange={(e) => onChange({ ...config, smtpUser: e.target.value })}
          placeholder="tu-email@gmail.com"
        />

        <Input
          label="Contraseña SMTP"
          type="password"
          value={config.smtpPassword}
          onChange={(e) => onChange({ ...config, smtpPassword: e.target.value })}
          placeholder="••••••••"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Email Remitente"
          value={config.fromEmail}
          onChange={(e) => onChange({ ...config, fromEmail: e.target.value })}
          placeholder="noreply@tu-blog.com"
        />

        <Input
          label="Nombre Remitente"
          value={config.fromName}
          onChange={(e) => onChange({ ...config, fromName: e.target.value })}
          placeholder="Tu Blog"
        />
      </div>

      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-start space-x-2">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-300">
            <strong>Configuración recomendada para Gmail:</strong>
            <ul className="mt-2 space-y-1 text-xs">
              <li>• Servidor: smtp.gmail.com</li>
              <li>• Puerto: 587</li>
              <li>• Usar contraseña de aplicación en lugar de contraseña normal</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </Card>
);

const SecurityConfig: React.FC<{
  config: any;
  onChange: (config: any) => void;
  onSave: () => void;
  saving: boolean;
}> = ({ config, onChange, onSave, saving }) => (
  <Card>
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        Configuración de Seguridad
      </h2>
      <Button onClick={onSave} loading={saving}>
        <Save size={16} className="mr-2" />
        Guardar Cambios
      </Button>
    </div>

    <div className="space-y-6">
      <div className="space-y-4">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={config.enableTwoFactor}
            onChange={(e) => onChange({ ...config, enableTwoFactor: e.target.checked })}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Habilitar autenticación de dos factores</span>
        </label>

        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={config.requirePasswordChange}
            onChange={(e) => onChange({ ...config, requirePasswordChange: e.target.checked })}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Requerir cambio de contraseña cada 90 días</span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Timeout de Sesión (horas)"
          type="number"
          value={config.sessionTimeout}
          onChange={(e) => onChange({ ...config, sessionTimeout: e.target.value })}
          placeholder="24"
        />

        <Input
          label="Máximo Intentos de Login"
          type="number"
          value={config.maxLoginAttempts}
          onChange={(e) => onChange({ ...config, maxLoginAttempts: e.target.value })}
          placeholder="5"
        />

        <Input
          label="Longitud Mínima Contraseña"
          type="number"
          value={config.passwordMinLength}
          onChange={(e) => onChange({ ...config, passwordMinLength: e.target.value })}
          placeholder="8"
        />
      </div>

      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <div className="flex items-start space-x-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
          <div className="text-sm text-yellow-800 dark:text-yellow-300">
            <strong>Importante:</strong> Los cambios en la configuración de seguridad afectan a todos los usuarios.
            Asegúrate de comunicar cualquier cambio importante al equipo.
          </div>
        </div>
      </div>
    </div>
  </Card>
);

const NotificationsConfig: React.FC<{
  config: any;
  onChange: (config: any) => void;
  onSave: () => void;
  saving: boolean;
}> = ({ config, onChange, onSave, saving }) => (
  <Card>
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        Configuración de Notificaciones
      </h2>
      <Button onClick={onSave} loading={saving}>
        <Save size={16} className="mr-2" />
        Guardar Cambios
      </Button>
    </div>

    <div className="space-y-4">
      <div className="space-y-3">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={config.emailNotifications}
            onChange={(e) => onChange({ ...config, emailNotifications: e.target.checked })}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Notificaciones por email</span>
        </label>

        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={config.newPostNotifications}
            onChange={(e) => onChange({ ...config, newPostNotifications: e.target.checked })}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Notificar nuevos posts</span>
        </label>

        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={config.commentNotifications}
            onChange={(e) => onChange({ ...config, commentNotifications: e.target.checked })}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Notificar nuevos comentarios</span>
        </label>

        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={config.userRegistrationNotifications}
            onChange={(e) => onChange({ ...config, userRegistrationNotifications: e.target.checked })}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Notificar nuevos usuarios</span>
        </label>

        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={config.systemAlerts}
            onChange={(e) => onChange({ ...config, systemAlerts: e.target.checked })}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Alertas del sistema</span>
        </label>
      </div>

      <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <div className="flex items-start space-x-2">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
          <div className="text-sm text-green-800 dark:text-green-300">
            Las notificaciones están funcionando correctamente. Los usuarios recibirán alertas según su configuración personal.
          </div>
        </div>
      </div>
    </div>
  </Card>
);

export default ConfigurationManager;
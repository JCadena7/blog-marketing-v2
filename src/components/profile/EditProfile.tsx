import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, ArrowLeft, TriangleAlert as AlertTriangle, Clock, User, Shield, Settings, Globe, Lock } from 'lucide-react';
import { getProfile, updateProfile, checkUsernameAvailability, checkEmailAvailability } from '../../services/profileService';
import { type UserProfile } from '../../data/mockUserProfiles';
import { useNotifications } from '../admin/AdminNotificationSystem';
import Button from '../ui/Button';
import Card from '../ui/Card';

import GeneralProfileForm from './forms/GeneralProfileForm';
import SecurityProfileForm from './forms/SecurityProfileForm';
import PreferencesProfileForm from './forms/PreferencesProfileForm';
import SocialLinksForm from './forms/SocialLinksForm';
import PrivacySettingsForm from './forms/PrivacySettingsForm';

interface EditProfileProps {
  userId: number;
}

// Validation schema
const profileSchema = z.object({
  firstName: z.string()
    .min(2, 'Nombre debe tener al menos 2 caracteres')
    .max(50, 'Nombre no puede exceder 50 caracteres')
    .regex(/^[-\p{L}\s]+$/u, 'Solo letras y espacios permitidos'),

  lastName: z.string()
    .min(2, 'Apellido debe tener al menos 2 caracteres')
    .max(50, 'Apellido no puede exceder 50 caracteres')
    .regex(/^[-\p{L}\s]+$/u, 'Solo letras y espacios permitidos'),

  username: z.string()
    .min(3, 'Username debe tener al menos 3 caracteres')
    .max(20, 'Username no puede exceder 20 caracteres')
    .regex(/^\w+$/, 'Solo letras, números y guiones bajos'),

  email: z.string().email('Email inválido'),

  bio: z.string()
    .max(500, 'Bio no puede exceder 500 caracteres')
    .transform(val => val.trim())
    .optional(),

  website: z.string()
    .url('URL inválida')
    .optional()
    .or(z.literal('')),

  location: z.string()
    .max(100, 'Ubicación muy larga')
    .optional(),

  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Formato de teléfono inválido')
    .optional()
    .or(z.literal('')),

  birthDate: z.string().optional(),

  socialLinks: z.object({
    twitter: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
    instagram: z.string().optional()
  }),

  preferences: z.object({
    emailNotifications: z.boolean(),
    pushNotifications: z.boolean(),
    marketingEmails: z.boolean(),
    theme: z.enum(['light', 'dark', 'system']),
    language: z.string(),
    timezone: z.string(),
    defaultEditor: z.enum(['markdown', 'wysiwyg', 'hybrid']),
    autoSave: z.boolean(),
    showSocialLinks: z.boolean(),
    showEmail: z.boolean(),
    profileVisibility: z.enum(['public', 'users', 'followers', 'private']),
    allowDirectMessages: z.enum(['everyone', 'followers', 'none']),
    showOnlineStatus: z.boolean(),
    allowAnalytics: z.boolean(),
    indexPosts: z.boolean(),
    allowComments: z.boolean(),
    moderateComments: z.boolean()
  })
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const EditProfile: React.FC<EditProfileProps> = ({ userId }) => {
  const { addNotification } = useNotifications();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange'
  });

  useEffect(() => {
    loadUserProfile();
  }, [userId]);

  useEffect(() => {
    const subscription = form.watch(() => {
      setHasUnsavedChanges(form.formState.isDirty);
    });
    return () => subscription.unsubscribe();
  }, [form.watch, form.formState.isDirty]);

  // Warn about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const loadUserProfile = async () => {
    try {
      const userData = await getProfile(userId);
      if (userData) {
        setUser(userData);
        form.reset({
          firstName: userData.firstName,
          lastName: userData.lastName,
          username: userData.username,
          email: userData.email,
          bio: userData.bio || '',
          website: userData.website || '',
          location: userData.location || '',
          phone: userData.phone || '',
          birthDate: userData.birthDate || '',
          socialLinks: userData.socialLinks,
          preferences: userData.preferences
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const onSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    if (!user) return;

    try {
      setSaving(true);

      // Validate unique username and email
      if (data.username !== user.username) {
        const usernameCheck = await checkUsernameAvailability(data.username, user.username);
        if (!usernameCheck.available) {
          form.setError('username', { message: 'Este username ya está en uso' });
          return;
        }
      }

      if (data.email !== user.email) {
        const emailCheck = await checkEmailAvailability(data.email, user.email);
        if (!emailCheck.available) {
          form.setError('email', { message: 'Este email ya está registrado' });
          return;
        }
      }

      const updatedUser = await updateProfile(userId, data);
      if (updatedUser) {
        setUser(updatedUser);
        form.reset(data);
        setHasUnsavedChanges(false);

        addNotification({
          type: 'success',
          title: 'Perfil actualizado',
          message: 'Tus cambios se han guardado correctamente'
        });
      }

    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Error al actualizar',
        message: error.message || 'Ha ocurrido un error inesperado'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (hasUnsavedChanges) {
      const canConfirm = typeof globalThis !== 'undefined' && 'confirm' in globalThis && typeof globalThis.confirm === 'function';
      const shouldReset = canConfirm ? globalThis.confirm('¿Estás seguro de que quieres descartar los cambios?') : true;
      if (shouldReset) {
        form.reset();
        setHasUnsavedChanges(false);
      }
    }
  };

  const tabs = [
    { id: 'general', name: 'General', icon: User, description: 'Información personal básica' },
    { id: 'seguridad', name: 'Seguridad', icon: Shield, description: 'Contraseña y autenticación' },
    { id: 'preferencias', name: 'Preferencias', icon: Settings, description: 'Configuración de la cuenta' },
    { id: 'social', name: 'Redes Sociales', icon: Globe, description: 'Enlaces a redes sociales' },
    { id: 'privacidad', name: 'Privacidad', icon: Lock, description: 'Control de privacidad y visibilidad' }
  ];

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <Card>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </Card>
          <Card>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </Card>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <div className="text-center py-12">
            <User size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Usuario no encontrado
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              No se pudo cargar la información del perfil.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Button variant="outline" href="/admin/dashboard">
              <ArrowLeft size={16} className="mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Editar Perfil
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Actualiza tu información personal y preferencias
              </p>
            </div>
          </div>
          
          {hasUnsavedChanges && (
            <div className="flex items-center text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-800">
              <Clock size={16} className="mr-2" />
              <span className="text-sm font-medium">Cambios sin guardar</span>
            </div>
          )}
        </div>
      </Card>

      {/* Main Form */}
      <Card className="p-0">
        {/* Tabs Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative py-4 px-1 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <tab.icon size={16} />
                  <span>{tab.name}</span>
                </div>
                
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeEditTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Form Content */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'general' && (
                <GeneralProfileForm form={form} user={user} />
              )}
              {activeTab === 'seguridad' && (
                <SecurityProfileForm userId={userId} />
              )}
              {activeTab === 'preferencias' && (
                <PreferencesProfileForm form={form} userRole={user.role} />
              )}
              {activeTab === 'social' && (
                <SocialLinksForm form={form} />
              )}
              {activeTab === 'privacidad' && (
                <PrivacySettingsForm form={form} />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Form Actions - Only show on tabs that require saving */}
          {['general', 'preferencias', 'social', 'privacidad'].includes(activeTab) && (
            <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700 mt-8">
              <div className="flex items-center space-x-4">
                {hasUnsavedChanges && (
                  <div className="flex items-center text-sm text-amber-600 dark:text-amber-400">
                    <AlertTriangle size={16} className="mr-1" />
                    <span>Tienes cambios sin guardar</span>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={!hasUnsavedChanges}
                >
                  Restablecer
                </Button>
                
                <Button
                  type="submit"
                  loading={saving}
                  disabled={!form.formState.isDirty || !form.formState.isValid}
                >
                  <Save size={16} className="mr-2" />
                  Guardar Cambios
                </Button>
              </div>
            </div>
          )}
        </form>
      </Card>
    </div>
  );
};

export default EditProfile;
import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Globe, Calendar, FileText, CheckCircle } from 'lucide-react';
import { type UserProfile } from '../../../data/mockUserProfiles';
import Input from '../../ui/Input';
import Card from '../../ui/Card';

interface GeneralProfileFormProps {
  form: any;
  user: UserProfile;
}

const GeneralProfileForm: React.FC<GeneralProfileFormProps> = ({ form, user }) => {
  const { register, formState: { errors }, watch } = form;
  
  const bioLength = watch('bio')?.length || 0;

  return (
    <div className="space-y-8">
      {/* Personal Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <User size={20} className="mr-2 text-primary-500" />
            Información Personal
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Esta información será visible en tu perfil público según tu configuración de privacidad.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Nombre"
            {...register('firstName')}
            error={errors.firstName?.message}
            icon={<User size={20} className="text-gray-400" />}
            placeholder="Tu nombre"
          />

          <Input
            label="Apellidos"
            {...register('lastName')}
            error={errors.lastName?.message}
            icon={<User size={20} className="text-gray-400" />}
            placeholder="Tus apellidos"
          />

          <Input
            label="Nombre de usuario"
            {...register('username')}
            error={errors.username?.message}
            icon={<User size={20} className="text-gray-400" />}
            placeholder="username_unico"
          />

          <Input
            label="Email"
            type="email"
            {...register('email')}
            error={errors.email?.message}
            icon={<Mail size={20} className="text-gray-400" />}
            placeholder="tu@email.com"
          />

          <Input
            label="Teléfono"
            type="tel"
            {...register('phone')}
            error={errors.phone?.message}
            icon={<Phone size={20} className="text-gray-400" />}
            placeholder="+34 123 456 789"
          />

          <Input
            label="Ubicación"
            {...register('location')}
            error={errors.location?.message}
            icon={<MapPin size={20} className="text-gray-400" />}
            placeholder="Ciudad, País"
          />

          <Input
            label="Sitio web"
            type="url"
            {...register('website')}
            error={errors.website?.message}
            icon={<Globe size={20} className="text-gray-400" />}
            placeholder="https://tu-sitio.com"
          />

          <Input
            label="Fecha de nacimiento"
            type="date"
            {...register('birthDate')}
            error={errors.birthDate?.message}
            icon={<Calendar size={20} className="text-gray-400" />}
          />
        </div>
      </motion.div>

      {/* Biography */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <FileText size={20} className="mr-2 text-primary-500" />
            Biografía
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Cuéntanos sobre ti. Esta información aparecerá en tu perfil público.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Biografía
          </label>
          <textarea
            {...register('bio')}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
            placeholder="Escribe una breve descripción sobre ti, tu experiencia y tus intereses en marketing digital..."
          />
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">
              Máximo 500 caracteres
            </span>
            <span className={`${bioLength > 450 ? 'text-amber-500' : 'text-gray-500 dark:text-gray-400'}`}>
              {bioLength}/500
            </span>
          </div>
          {errors.bio && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.bio.message}</p>
          )}
        </div>
      </motion.div>

      {/* Profile Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 border-primary-200 dark:border-primary-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <CheckCircle size={20} className="mr-2 text-primary-500" />
            Vista Previa del Perfil
          </h3>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start space-x-4">
              <img
                src={user.avatar}
                alt="Avatar"
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
              />
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {watch('firstName') || user.firstName} {watch('lastName') || user.lastName}
                </h4>
                <p className="text-gray-500 dark:text-gray-400">
                  @{watch('username') || user.username}
                </p>
                {(watch('bio') || user.bio) && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 line-clamp-2">
                    {watch('bio') || user.bio}
                  </p>
                )}
                <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                  {(watch('location') || user.location) && (
                    <div className="flex items-center">
                      <MapPin size={14} className="mr-1" />
                      {watch('location') || user.location}
                    </div>
                  )}
                  {(watch('website') || user.website) && (
                    <div className="flex items-center">
                      <Globe size={14} className="mr-1" />
                      <span className="text-primary-600 dark:text-primary-400">Sitio web</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default GeneralProfileForm;
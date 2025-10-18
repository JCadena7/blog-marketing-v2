import React from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Calendar, 
  Globe, 
  Phone, 
  Mail, 
  ExternalLink,
  User,
  Shield,
  Clock,
  Eye,
  Heart,
  MessageCircle,
  FileText,
  Activity,
  BarChart3
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { type UserProfile } from '../../data/mockUserProfiles';
import Card from '../ui/Card';
import RoleBadge from '../admin/RoleBadge';

interface ProfileOverviewProps {
  user: UserProfile;
  isOwnProfile: boolean;
}

const ProfileOverview: React.FC<ProfileOverviewProps> = ({ user, isOwnProfile }) => {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d 'de' MMMM 'de' yyyy", { locale: es });
  };

  const formatBirthDate = (dateString: string) => {
    return format(new Date(dateString), "d 'de' MMMM", { locale: es });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Personal Information */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <User size={20} className="mr-2 text-primary-500" />
            Información Personal
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <InfoField
                icon={User}
                label="Nombre completo"
                value={`${user.firstName} ${user.lastName}`}
              />
              
              <InfoField
                icon={User}
                label="Nombre de usuario"
                value={`@${user.username}`}
              />
              
              {(isOwnProfile || user.preferences.showEmail) && (
                <InfoField
                  icon={Mail}
                  label="Email"
                  value={user.email}
                />
              )}
              
              {user.phone && (
                <InfoField
                  icon={Phone}
                  label="Teléfono"
                  value={user.phone}
                />
              )}
            </div>
            
            <div className="space-y-4">
              {user.location && (
                <InfoField
                  icon={MapPin}
                  label="Ubicación"
                  value={user.location}
                />
              )}
              
              {user.website && (
                <InfoField
                  icon={Globe}
                  label="Sitio web"
                  value={user.website}
                  isLink
                />
              )}
              
              {user.birthDate && isOwnProfile && (
                <InfoField
                  icon={Calendar}
                  label="Fecha de nacimiento"
                  value={formatBirthDate(user.birthDate)}
                />
              )}
              
              <InfoField
                icon={Calendar}
                label="Miembro desde"
                value={formatDate(user.createdAt)}
              />
            </div>
          </div>
        </Card>

        {/* Bio Extended */}
        {user.bio && (
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Biografía
            </h3>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {user.bio}
              </p>
            </div>
          </Card>
        )}

        {/* Recent Activity Preview */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Activity size={20} className="mr-2 text-primary-500" />
            Actividad Reciente
          </h3>
          
          <div className="space-y-3">
            {user.activity.slice(0, 5).map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {activity.description}
                    {activity.target && (
                      <span className="font-medium text-primary-600 dark:text-primary-400">
                        {' '}{activity.target}
                      </span>
                    )}
                  </p>
                  {activity.content && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      "{activity.content}"
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {format(new Date(activity.createdAt), "d MMM 'a las' HH:mm", { locale: es })}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Role & Status */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Shield size={20} className="mr-2 text-primary-500" />
            Estado del Usuario
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Rol:</span>
              <RoleBadge role={user.role as any} />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Estado:</span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                user.status === 'active' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : user.status === 'inactive'
                  ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
              }`}>
                {user.status === 'active' ? 'Activo' : user.status === 'inactive' ? 'Inactivo' : 'Suspendido'}
              </span>
            </div>
            
            {user.isVerified && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Verificado:</span>
                <div className="flex items-center text-blue-600 dark:text-blue-400">
                  <Shield size={16} className="mr-1" />
                  <span className="text-sm font-medium">Verificado</span>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Quick Stats */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <BarChart3 size={20} className="mr-2 text-primary-500" />
            Estadísticas
          </h3>
          
          <div className="space-y-3">
            <StatRow
              icon={FileText}
              label="Posts creados"
              value={user.stats.postsCreated}
              growth={user.stats.postsGrowth}
            />
            <StatRow
              icon={Eye}
              label="Vistas totales"
              value={user.stats.totalViews}
              growth={user.stats.viewsGrowth}
            />
            <StatRow
              icon={Heart}
              label="Likes recibidos"
              value={user.stats.likesReceived}
              growth={user.stats.likesGrowth}
            />
            <StatRow
              icon={MessageCircle}
              label="Comentarios"
              value={user.stats.commentsReceived}
            />
          </div>
        </Card>

        {/* Social Links */}
        {user.preferences.showSocialLinks && user.socialLinks && Object.keys(user.socialLinks).length > 0 && (
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Redes Sociales
            </h3>
            
            <div className="space-y-3">
              {user.socialLinks.twitter && (
                <SocialLink
                  platform="Twitter"
                  username={user.socialLinks.twitter}
                  url={`https://twitter.com/${user.socialLinks.twitter.replace('@', '')}`}
                  color="text-blue-500"
                />
              )}
              {user.socialLinks.linkedin && (
                <SocialLink
                  platform="LinkedIn"
                  username="Perfil profesional"
                  url={user.socialLinks.linkedin}
                  color="text-blue-600"
                />
              )}
              {user.socialLinks.github && (
                <SocialLink
                  platform="GitHub"
                  username={user.socialLinks.github}
                  url={`https://github.com/${user.socialLinks.github}`}
                  color="text-gray-900 dark:text-white"
                />
              )}
              {user.socialLinks.instagram && (
                <SocialLink
                  platform="Instagram"
                  username={user.socialLinks.instagram}
                  url={`https://instagram.com/${user.socialLinks.instagram.replace('@', '')}`}
                  color="text-pink-500"
                />
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

interface InfoFieldProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  isLink?: boolean;
}

const InfoField: React.FC<InfoFieldProps> = ({ icon: Icon, label, value, isLink = false }) => {
  return (
    <div className="flex items-center space-x-3">
      <Icon size={16} className="text-gray-400 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {label}
        </p>
        {isLink ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center"
          >
            {value}
            <ExternalLink size={12} className="ml-1" />
          </a>
        ) : (
          <p className="text-sm text-gray-900 dark:text-white font-medium">
            {value}
          </p>
        )}
      </div>
    </div>
  );
};

interface StatRowProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: number;
  growth?: number;
}

const StatRow: React.FC<StatRowProps> = ({ icon: Icon, label, value, growth }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Icon size={16} className="text-gray-400" />
        <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {value.toLocaleString()}
        </span>
        {growth !== undefined && (
          <span className={`text-xs ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
};

interface SocialLinkProps {
  platform: string;
  username: string;
  url: string;
  color: string;
}

const SocialLink: React.FC<SocialLinkProps> = ({ platform, username, url, color }) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors group"
    >
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">{platform}</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className={`text-sm font-medium ${color}`}>{username}</span>
        <ExternalLink size={12} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
      </div>
    </a>
  );
};

function getActivityIcon(type: string) {
  const iconMap = {
    post_created: <FileText size={16} className="text-blue-500" />,
    post_published: <FileText size={16} className="text-green-500" />,
    comment_added: <MessageCircle size={16} className="text-purple-500" />,
    profile_updated: <User size={16} className="text-orange-500" />,
    follow: <User size={16} className="text-indigo-500" />,
    like_given: <Heart size={16} className="text-red-500" />
  };
  
  return iconMap[type as keyof typeof iconMap] || <Activity size={16} className="text-gray-500" />;
}

export default ProfileOverview;
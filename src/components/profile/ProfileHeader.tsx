import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, MapPin, Calendar, Clock, CreditCard as Edit3, UserPlus, MessageCircle, Eye, Heart, FileText, Users, ExternalLink, Shield, CircleCheck as CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { type UserProfile } from '../../data/mockUserProfiles';
import { usePermissions } from '../../hooks/usePermissions';
import RoleBadge from '../admin/RoleBadge';
import Button from '../ui/Button';
import Card from '../ui/Card';
import AvatarUploadModal from './AvatarUploadModal';
import CoverUploadModal from './CoverUploadModal';

interface ProfileHeaderProps {
  user: UserProfile;
  isOwnProfile: boolean;
  onUpdateUser: (updates: Partial<UserProfile>) => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, isOwnProfile, onUpdateUser }) => {
  const { hasPermission } = usePermissions();
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showCoverModal, setShowCoverModal] = useState(false);

  const formatJoinDate = (dateString: string) => {
    return format(new Date(dateString), "MMMM 'de' yyyy", { locale: es });
  };

  const formatLastSeen = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)}h`;
    return `Hace ${Math.floor(diffInMinutes / 1440)}d`;
  };

  const getOnlineStatusConfig = (status: string) => {
    const configs = {
      online: { color: 'bg-green-500', label: 'En línea' },
      away: { color: 'bg-yellow-500', label: 'Ausente' },
      offline: { color: 'bg-gray-400', label: 'Desconectado' }
    };
    return configs[status as keyof typeof configs] || configs.offline;
  };

  const onlineConfig = getOnlineStatusConfig(user.onlineStatus);

  return (
    <>
      <Card className="overflow-hidden p-0">
        {/* Cover Image */}
        <div className="relative h-48 lg:h-64 bg-gradient-to-br from-primary-500 via-secondary-500 to-purple-600">
          {user.coverImage && (
            <img
              src={user.coverImage}
              alt="Portada del perfil"
              className="w-full h-full object-cover"
            />
          )}
          
          {/* Cover Overlay */}
          <div className="absolute inset-0 bg-black/20 z-0" />
          
          {isOwnProfile && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCoverModal(true)}
              className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-lg hover:bg-black/70 backdrop-blur-sm transition-colors"
              title="Cambiar portada"
            >
              <Camera size={16} />
            </motion.button>
          )}
        </div>

        <div className="px-6 pb-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:space-x-6 -mt-16 lg:-mt-20 relative z-10">
            {/* Avatar */}
            <div className="relative z-10 flex justify-center lg:justify-start">
              <div className="relative">
                <img
                  src={user.avatar}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-24 h-24 lg:w-32 lg:h-32 rounded-full border-4 border-white bg-white object-cover shadow-lg"
                />
                
                {/* Online Status */}
                {user.preferences.showOnlineStatus && (
                  <div className="absolute bottom-2 right-2 lg:bottom-3 lg:right-3">
                    <div 
                      className={`w-4 h-4 lg:w-5 lg:h-5 ${onlineConfig.color} rounded-full border-2 border-white`}
                      title={onlineConfig.label}
                    />
                  </div>
                )}
                
                {isOwnProfile && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowAvatarModal(true)}
                    className="absolute -bottom-2 -right-2 bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 shadow-lg transition-colors"
                    title="Cambiar avatar"
                  >
                    <Camera size={16} />
                  </motion.button>
                )}
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 mt-4 lg:mt-0 lg:pb-2 text-center lg:text-left">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex items-center justify-center lg:justify-start space-x-2">
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                      {user.firstName} {user.lastName}
                    </h1>
                    {user.isVerified && (
                      <CheckCircle size={20} className="text-blue-500" aria-label="Usuario verificado" />
                    )}
                  </div>
                  
                  <p className="text-gray-500 dark:text-gray-400 text-lg">@{user.username}</p>
                  
                  <div className="flex items-center justify-center lg:justify-start space-x-3 mt-2">
                    <RoleBadge role={user.role as any} />
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

                  {user.location && (
                    <div className="flex items-center justify-center lg:justify-start text-gray-500 dark:text-gray-400 mt-2">
                      <MapPin size={16} className="mr-1" />
                      <span className="text-sm">{user.location}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-center space-x-3 mt-4 lg:mt-0">
                  {!isOwnProfile && (
                    <>
                      <Button variant="primary" size="sm">
                        <UserPlus size={16} className="mr-2" />
                        Seguir
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageCircle size={16} className="mr-2" />
                        Mensaje
                      </Button>
                    </>
                  )}
                  
                  {isOwnProfile && (
                    <Button href="/admin/perfil/editar">
                      <Edit3 size={16} className="mr-2" />
                      Editar Perfil
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          {user.bio && (
            <div className="mt-6">
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed text-center lg:text-left">
                {user.bio}
              </p>
            </div>
          )}

          {/* Social Links */}
          {user.preferences.showSocialLinks && user.socialLinks && Object.keys(user.socialLinks).length > 0 && (
            <div className="flex items-center justify-center lg:justify-start space-x-4 mt-4">
              {user.website && (
                <a
                  href={user.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-primary-500 transition-colors"
                  title="Sitio web"
                >
                  <ExternalLink size={20} />
                </a>
              )}
              {user.socialLinks.twitter && (
                <a
                  href={`https://twitter.com/${user.socialLinks.twitter.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-blue-500 transition-colors"
                  title="Twitter"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
              )}
              {user.socialLinks.linkedin && (
                <a
                  href={user.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-blue-600 transition-colors"
                  title="LinkedIn"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              )}
              {user.socialLinks.github && (
                <a
                  href={`https://github.com/${user.socialLinks.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                  title="GitHub"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
              )}
              {user.socialLinks.instagram && (
                <a
                  href={`https://instagram.com/${user.socialLinks.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-pink-500 transition-colors"
                  title="Instagram"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              )}
            </div>
          )}

          {/* Quick Stats */}
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              label="Posts" 
              value={user.stats.postsCreated} 
              icon={FileText}
              trend={user.stats.postsGrowth}
              color="blue"
            />
            <StatCard 
              label="Vistas" 
              value={user.stats.totalViews} 
              icon={Eye}
              trend={user.stats.viewsGrowth}
              color="green"
            />
            <StatCard 
              label="Seguidores" 
              value={user.stats.followers} 
              icon={Users}
              trend={user.stats.followersGrowth}
              color="purple"
            />
            <StatCard 
              label="Likes" 
              value={user.stats.likesReceived} 
              icon={Heart}
              trend={user.stats.likesGrowth}
              color="red"
            />
          </div>

          {/* Join Date & Last Seen */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between text-sm text-gray-500 dark:text-gray-400 space-y-2 lg:space-y-0">
              <div className="flex items-center justify-center lg:justify-start">
                <Calendar size={16} className="mr-1" />
                <span>Se unió en {formatJoinDate(user.createdAt)}</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start">
                <Clock size={16} className="mr-1" />
                <span>Última vez activo {formatLastSeen(user.lastLogin)}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Modals */}
      <AvatarUploadModal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        currentAvatar={user.avatar}
        userId={user.id}
        onUpdate={(newAvatar) => {
          onUpdateUser({ avatar: newAvatar });
          setShowAvatarModal(false);
        }}
      />
      
      <CoverUploadModal
        isOpen={showCoverModal}
        onClose={() => setShowCoverModal(false)}
        currentCover={user.coverImage}
        userId={user.id}
        onUpdate={(newCover) => {
          onUpdateUser({ coverImage: newCover });
          setShowCoverModal(false);
        }}
      />
    </>
  );
};

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  trend?: number;
  color: 'blue' | 'green' | 'purple' | 'red';
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, trend, color }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400',
    purple: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400',
    red: 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400'
  };

  return (
    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg mb-2 ${colorClasses[color]}`}>
        <Icon size={16} />
      </div>
      <div className="text-xl font-bold text-gray-900 dark:text-white">
        {value.toLocaleString()}
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
      {trend !== undefined && (
        <div className={`text-xs mt-1 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
        </div>
      )}
    </div>
  );
};

export default ProfileHeader;


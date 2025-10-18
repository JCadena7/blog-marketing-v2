import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ArrowLeft, Lock } from 'lucide-react';
import { getProfile } from '../../services/profileService';
import { type UserProfile as UserProfileType } from '../../data/mockUserProfiles';
import { usePermissions } from '../../hooks/usePermissions';
import { AuthContext } from '../../contexts/AuthContext';
import ProfileHeader from './ProfileHeader';
import ProfileTabs from './ProfileTabs';
import ProfileOverview from './ProfileOverview';
import ProfilePosts from './ProfilePosts';
import ProfileActivity from './ProfileActivity';
import ProfileStats from './ProfileStats';
import ProfileAdmin from './ProfileAdmin';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface UserProfileProps {
  userId: number;
}

const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  const { user: currentUser } = useContext(AuthContext);
  const { hasPermission, userRole } = usePermissions();
  const [user, setUser] = useState<UserProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    loadUserProfile();
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      const userData = await getProfile(userId);
      setUser(userData);
    } finally {
      setLoading(false);
    }
  };

  const getVisibleSections = () => {
    const baseSections = ['overview', 'posts'];
    
    if (isOwnProfile) {
      return [...baseSections, 'activity', 'stats'];
    }
    
    if (hasPermission('admin_completo')) {
      return [...baseSections, 'activity', 'stats', 'admin'];
    }
    
    if (hasPermission('editar_post_cualquiera')) {
      return [...baseSections, 'stats'];
    }
    
    return baseSections;
  };

  const handleUpdateUser = (updates: Partial<UserProfileType>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="animate-pulse">
          <Card>
            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-t-lg"></div>
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                </div>
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="grid grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto">
        <Card>
          <div className="text-center py-12">
            <User size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Usuario no encontrado
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              El perfil que buscas no existe o no tienes permisos para verlo.
            </p>
            <Button variant="outline" href="/admin/usuarios">
              <ArrowLeft size={16} className="mr-2" />
              Volver a Usuarios
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Check profile visibility permissions
  const canViewProfile = () => {
    if (isOwnProfile) return true;
    if (hasPermission('admin_completo')) return true;
    
    switch (user.preferences.profileVisibility) {
      case 'public':
        return true;
      case 'users':
        return !!currentUser; // Any logged in user
      case 'followers':
        return false; // Would need to check if current user follows this user
      case 'private':
        return false;
      default:
        return false;
    }
  };

  if (!canViewProfile()) {
    return (
      <div className="max-w-6xl mx-auto">
        <Card>
          <div className="text-center py-12">
            <Lock size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Perfil Privado
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Este usuario ha configurado su perfil como privado.
            </p>
            <Button variant="outline" href="/admin/usuarios">
              <ArrowLeft size={16} className="mr-2" />
              Volver a Usuarios
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const availableSections = getVisibleSections();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-6"
    >
      {/* Profile Header */}
      <ProfileHeader 
        user={user} 
        isOwnProfile={isOwnProfile}
        onUpdateUser={handleUpdateUser}
      />
      
      {/* Profile Tabs */}
      <Card className="p-0">
        <ProfileTabs 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          availableSections={availableSections}
        />
        
        {/* Tab Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'overview' && (
                <ProfileOverview user={user} isOwnProfile={isOwnProfile} />
              )}
              {activeTab === 'posts' && (
                <ProfilePosts userId={userId} userRole={userRole} />
              )}
              {activeTab === 'activity' && (
                <ProfileActivity userId={userId} />
              )}
              {activeTab === 'stats' && (
                <ProfileStats userId={userId} />
              )}
              {activeTab === 'admin' && hasPermission('admin_completo') && (
                <ProfileAdmin user={user} onUpdateUser={handleUpdateUser} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  );
};

export default UserProfile;
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, FileText, MessageCircle, User, Heart, UserPlus, ListFilter as Filter, Calendar, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getActivitiesByUser, type UserActivity } from '../../services/userActivitiesService';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface ProfileActivityProps {
  userId: number;
}

const ProfileActivity: React.FC<ProfileActivityProps> = ({ userId }) => {
  console.log('🎯 ProfileActivity montado con userId:', userId);
  
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [allActivities, setAllActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [displayCount, setDisplayCount] = useState(20);

  useEffect(() => {
    console.log('🔄 useEffect disparado - userId:', userId, 'filter:', filter);
    loadActivities(true);
  }, [userId, filter]);

  const loadActivities = async (reset = false) => {
    try {
      setLoading(true);
      console.log(`📊 Cargando actividades del usuario ${userId}...`);
      console.log(`🔍 Filtro actual: ${filter}`);
      
      // Obtener todas las actividades del usuario
      let userActivities = await getActivitiesByUser(userId, 100);
      console.log(`📦 Actividades recibidas del backend:`, userActivities);
      console.log(`📊 Total de actividades: ${userActivities.length}`);
      
      // Filtrar por tipo si es necesario
      if (filter !== 'all') {
        const beforeFilter = userActivities.length;
        userActivities = userActivities.filter(activity => activity.type === filter);
        console.log(`🔍 Filtradas de ${beforeFilter} a ${userActivities.length} (tipo: ${filter})`);
      }
      
      setAllActivities(userActivities);
      
      if (reset) {
        setDisplayCount(20);
        setActivities(userActivities.slice(0, 20));
        console.log(`✅ Mostrando las primeras 20 de ${userActivities.length} actividades`);
      } else {
        setActivities(userActivities.slice(0, displayCount));
        console.log(`✅ Mostrando ${Math.min(displayCount, userActivities.length)} de ${userActivities.length} actividades`);
      }
      
    } catch (error) {
      console.error('❌ Error cargando actividades:', error);
      setActivities([]);
      setAllActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    const newCount = displayCount + 20;
    setDisplayCount(newCount);
    setActivities(allActivities.slice(0, newCount));
  };

  const hasMore = allActivities.length > displayCount;

  const activityTypes = {
    post_created: { icon: FileText, color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/20', label: 'Post creado' },
    post_published: { icon: FileText, color: 'text-green-500 bg-green-100 dark:bg-green-900/20', label: 'Post publicado' },
    comment_added: { icon: MessageCircle, color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/20', label: 'Comentario' },
    profile_updated: { icon: User, color: 'text-orange-500 bg-orange-100 dark:bg-orange-900/20', label: 'Perfil actualizado' },
    follow: { icon: UserPlus, color: 'text-indigo-500 bg-indigo-100 dark:bg-indigo-900/20', label: 'Siguió a alguien' },
    like_given: { icon: Heart, color: 'text-red-500 bg-red-100 dark:bg-red-900/20', label: 'Le gustó' }
  };

  const formatActivityTime = (dateString?: string) => {
    if (!dateString) return 'Fecha desconocida';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Hace unos minutos';
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    if (diffInHours < 168) return `Hace ${Math.floor(diffInHours / 24)}d`;
    
    return format(date, "d MMM", { locale: es });
  };

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Actividad del Usuario
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Historial de acciones y contribuciones
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
          >
            <option value="all">Toda la actividad</option>
            {Object.entries(activityTypes).map(([type, config]) => (
              <option key={type} value={type}>
                {config.label}
              </option>
            ))}
          </select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadActivities(true)}
            loading={loading}
          >
            <RefreshCw size={16} className="mr-1" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Activity Timeline */}
      <Card>
        {loading && activities.length === 0 ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="animate-pulse flex items-start space-x-4 p-4">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-12">
            <Activity size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Sin actividad
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {filter === 'all' 
                ? 'Este usuario aún no ha realizado ninguna actividad.'
                : `No hay actividad del tipo "${activityTypes[filter as keyof typeof activityTypes]?.label}".`
              }
            </p>
          </div>
        ) : (
          <div className="flow-root">
            <ul className="-mb-8">
              <AnimatePresence>
                {activities.map((activity, activityIdx) => {
                  const config = activityTypes[activity.type as keyof typeof activityTypes];
                  const Icon = config?.icon || Activity;
                  const isLast = activityIdx === activities.length - 1;

                  return (
                    <motion.li
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: activityIdx * 0.05 }}
                    >
                      <div className="relative pb-8">
                        {!isLast && (
                          <span
                            className="absolute top-4 left-5 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700"
                            aria-hidden="true"
                          />
                        )}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className={`h-10 w-10 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-gray-800 ${config?.color || 'text-gray-500 bg-gray-100'}`}>
                              <Icon size={16} />
                            </span>
                          </div>
                          <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900 dark:text-white">
                                {activity.description}
                                {activity.target && (
                                  <span className="font-medium text-primary-600 dark:text-primary-400 ml-1">
                                    {activity.target}
                                  </span>
                                )}
                              </p>
                              {activity.content && (
                                <div className="mt-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                  "{activity.content}"
                                </div>
                              )}
                            </div>
                            <div className="whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
                              <time dateTime={activity.createdAt}>
                                {formatActivityTime(activity.createdAt)}
                              </time>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          </div>
        )}

        {/* Load More */}
        {hasMore && activities.length > 0 && (
          <div className="text-center pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={loadMore}
              loading={loading}
            >
              Cargar más actividad
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ProfileActivity;
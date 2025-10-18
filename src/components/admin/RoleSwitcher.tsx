import React, { useContext, useMemo } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { ROLE_PERMISSIONS, type Role, type Permission, PERMISSION_DESCRIPTIONS } from '../../data/rolePermissions';

const ROLES: Role[] = ['creador', 'administrador', 'editor', 'escritor', 'autor', 'comentador'];

const RoleSwitcher: React.FC = () => {
  const { user, setMockUserByRole, loading } = useContext(AuthContext);

  const current = user?.role;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as Role;
    setMockUserByRole(next);
  };

  // Only show in dev
  if (!(import.meta as any).env?.DEV) return null;

  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="role-switcher" className="text-xs text-gray-500 dark:text-gray-400">Rol:</label>
      <select
        id="role-switcher"
        value={current || ''}
        onChange={handleChange}
        disabled={loading}
        className="text-xs px-2 py-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>

      {/* Vista previa de permisos reales (ignora demo_mode) */}
      <PreviewButton role={current} />
    </div>
  );
};

export default RoleSwitcher;

// ===== Helpers y UI de vista previa (auto-contenido) =====

const getRolePermissionsStrict = (role?: Role): Permission[] => {
  if (!role) return [];
  if (role === 'creador') return ['admin_completo'];
  return ROLE_PERMISSIONS[role] ?? [];
};

const MENU_PREVIEW: Array<{ name: string; permissions: Permission[] }> = [
  { name: 'Dashboard', permissions: [] },
  { name: 'Posts', permissions: ['crear_post', 'editar_post_propio', 'editar_post_cualquiera'] },
  { name: 'Categorías', permissions: ['crear_categoria', 'editar_categoria'] },
  { name: 'Comentarios', permissions: ['comentar', 'admin_completo'] },
  { name: 'Gestión Usuarios', permissions: ['admin_completo', 'asignar_roles'] },
  { name: 'Roles y Permisos', permissions: ['admin_completo'] },
  { name: 'Estadísticas', permissions: ['admin_completo', 'editar_post_cualquiera'] },
  { name: 'Configuración', permissions: ['admin_completo'] },
  { name: 'Mi Perfil', permissions: [] },
];

const hasAnyPermissionStrict = (role: Role | undefined, perms: Permission[]): boolean => {
  if (!role) return false;
  const rp = getRolePermissionsStrict(role);
  if (rp.includes('admin_completo') || role === 'creador') return true;
  if (perms.length === 0) return true; // libres
  return perms.some(p => rp.includes(p));
};

const PreviewButton: React.FC<{ role?: Role }> = ({ role }) => {
  const perms = useMemo(() => getRolePermissionsStrict(role), [role]);
  const sections = useMemo(
    () => MENU_PREVIEW.filter(s => hasAnyPermissionStrict(role, s.permissions)).map(s => s.name),
    [role]
  );

  return (
    <div className="relative group">
      <button
        type="button"
        className="text-xs px-2 py-1 rounded-md border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        title="Vista previa de permisos del rol"
      >
        Permisos
      </button>
      <div className="hidden group-hover:block absolute right-0 mt-2 w-72 z-40">
        <div className="p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-1">Permisos del rol (estricto):</p>
          <ul className="max-h-40 overflow-auto list-disc pl-5 space-y-1 mb-2">
            {perms.length === 0 && (
              <li className="text-[11px] text-gray-500 dark:text-gray-400">Sin permisos definidos</li>
            )}
            {perms.includes('admin_completo') ? (
              <li className="text-[11px] text-gray-700 dark:text-gray-300">
                {PERMISSION_DESCRIPTIONS['admin_completo']}
              </li>
            ) : (
              perms.map(p => (
                <li key={p} className="text-[11px] text-gray-700 dark:text-gray-300">{PERMISSION_DESCRIPTIONS[p]}</li>
              ))
            )}
          </ul>

          <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-1">Secciones visibles en el sidebar:</p>
          <div className="flex flex-wrap gap-1">
            {sections.length === 0 && (
              <span className="text-[11px] text-gray-500 dark:text-gray-400">Ninguna</span>
            )}
            {sections.map(s => (
              <span key={s} className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Utilidad para verificar que las variables de entorno se están leyendo correctamente
 */

export function checkEnvVariables() {
  console.group('🔍 Verificación de Variables de Entorno');
  
  console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
  console.log('DEV mode:', import.meta.env.DEV);
  console.log('PROD mode:', import.meta.env.PROD);
  console.log('MODE:', import.meta.env.MODE);
  
  console.groupEnd();
  
  return {
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
    isDev: import.meta.env.DEV,
    isProd: import.meta.env.PROD,
    mode: import.meta.env.MODE
  };
}

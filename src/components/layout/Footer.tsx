import React from 'react';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import Button from '../ui/Button';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Inicio', href: '/' },
    { name: 'Blog', href: '/blog' },
    { name: 'Herramientas', href: '/herramientas' },
    { name: 'Servicios', href: '/servicios' },
  ];

  const services = [
    { name: 'SEO', href: '/servicios/seo' },
    { name: 'SEM', href: '/servicios/sem' },
    { name: 'Social Media', href: '/servicios/social-media' },
    { name: 'Content Marketing', href: '/servicios/content-marketing' },
  ];

  const resources = [
    { name: 'Calculadora ROI', href: '/herramientas/calculadora-roi' },
    { name: 'Generador Meta Tags', href: '/herramientas/meta-tags' },
    { name: 'Analizador Keywords', href: '/herramientas/keywords' },
    { name: 'Dashboard Analytics', href: '/dashboard' },
  ];

  const socialLinks = [
    { name: 'Facebook', href: '#', icon: Facebook },
    { name: 'Twitter', href: '#', icon: Twitter },
    { name: 'Instagram', href: '#', icon: Instagram },
    { name: 'LinkedIn', href: '#', icon: Linkedin },
  ];

  return (
    <footer className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">

          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="font-display font-bold text-xl">Marketing Pro</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              Expertos en marketing digital que ayudamos a empresas a crecer en el mundo online 
              con estrategias probadas y herramientas avanzadas.
            </p>

            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-3">
                <Mail size={18} className="text-primary-400" />
                <span className="text-gray-700 dark:text-gray-300">contacto@marketingpro.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone size={18} className="text-primary-400" />
                <span className="text-gray-700 dark:text-gray-300">+34 123 456 789</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin size={18} className="text-primary-400" />
                <span className="text-gray-700 dark:text-gray-300">Madrid, España</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-white rounded-lg flex items-center justify-center hover:bg-primary-500 hover:text-white transition-colors duration-200"
                  aria-label={social.name}
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>

          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>

          </div>

          {/* Services */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Servicios</h3>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service.name}>
                  <a
                    href={service.href}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                  >
                    {service.name}
                  </a>
                </li>
              ))}
            </ul>

          </div>

          {/* Resources */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Herramientas</h3>
            <ul className="space-y-3">
              {resources.map((resource) => (
                <li key={resource.name}>
                  <a
                    href={resource.href}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                  >
                    {resource.name}
                  </a>
                </li>
              ))}
            </ul>

          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="max-w-md mx-auto text-center lg:max-w-none lg:text-left lg:flex lg:items-center lg:justify-between">
            <div className="lg:max-w-md">
              <h3 className="font-display font-semibold text-xl mb-2">
                Mantente al día con Marketing Pro
              </h3>
              <p className="text-gray-400 mb-4">
                Recibe las últimas tendencias, tips y herramientas de marketing digital.
              </p>
            </div>
            
            <div className="lg:ml-8 lg:flex-shrink-0">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Tu email aquí..."
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 min-w-0 sm:min-w-[250px]"
                />
                <Button>
                  Suscribirse
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-gray-600 dark:text-gray-400">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p>&copy; {currentYear} Marketing Pro. Todos los derechos reservados.</p>
            <div className="flex space-x-6">
              <a href="/privacidad" className="hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
                Privacidad
              </a>
              <a href="/terminos" className="hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
                Términos
              </a>
              <a href="/cookies" className="hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
                Cookies
              </a>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
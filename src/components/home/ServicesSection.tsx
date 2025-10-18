import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { 
  Search, 
  Target, 
  Share2, 
  PenTool, 
  Mail, 
  BarChart3,
  ArrowRight,
  CheckCircle 
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

const ServicesSection: React.FC = () => {
  const services = [
    {
      icon: Search,
      title: 'SEO Avanzado',
      description: 'Optimización para motores de búsqueda que mejora tu posicionamiento orgánico y aumenta el tráfico web de calidad.',
      features: ['Auditoría SEO completa', 'Optimización on-page', 'Link building estratégico', 'Monitoreo de rankings'],
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Target,
      title: 'SEM & PPC',
      description: 'Campañas de publicidad pagada optimizadas para maximizar tu ROI en Google Ads, Facebook Ads y más.',
      features: ['Google Ads', 'Facebook & Instagram Ads', 'Remarketing', 'Optimización continua'],
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Share2,
      title: 'Social Media',
      description: 'Estrategias de redes sociales que construyen comunidades engaged y generan conversiones reales.',
      features: ['Gestión de perfiles', 'Creación de contenido', 'Community management', 'Influencer marketing'],
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: PenTool,
      title: 'Content Marketing',
      description: 'Contenido de valor que atrae, educa y convierte a tu audiencia en clientes fieles de tu marca.',
      features: ['Estrategia de contenidos', 'Blog profesional', 'Video marketing', 'Storytelling'],
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: Mail,
      title: 'Email Marketing',
      description: 'Campañas de email personalizadas que nutren leads y mantienen a tus clientes comprometidos.',
      features: ['Automatización', 'Segmentación avanzada', 'A/B testing', 'Diseño responsive'],
      color: 'from-teal-500 to-blue-500',
    },
    {
      icon: BarChart3,
      title: 'Analytics & Data',
      description: 'Análisis profundo de datos para tomar decisiones informadas y optimizar tu estrategia digital.',
      features: ['Google Analytics 4', 'Dashboards personalizados', 'Reportes automatizados', 'Insights accionables'],
      color: 'from-indigo-500 to-purple-500',
    },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 bg-primary-100 dark:bg-primary-900 rounded-full text-primary-700 dark:text-primary-300 text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-primary-500 rounded-full mr-2"></span>
            Nuestros Servicios
          </div>
          
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Soluciones Completas de
            <span className="block text-primary-500">Marketing Digital</span>
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Ofrecemos un ecosistema completo de servicios de marketing digital diseñados 
            para hacer crecer tu negocio online de manera sostenible y efectiva.
          </p>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
        >
          {services.map((service, index) => (
            <motion.div key={service.title} variants={itemVariants}>
              <Card className="h-full group cursor-pointer">
                <div className="relative">
                  {/* Icon */}
                  <div className="relative mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}>
                      <service.icon size={32} className="text-white" />
                    </div>
                    <div className={`absolute inset-0 bg-gradient-to-br ${service.color} rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300`}></div>
                  </div>

                  {/* Content */}
                  <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-primary-500 transition-colors duration-300">
                    {service.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Features List */}
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <CheckCircle size={16} className="text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className="flex items-center text-primary-500 font-medium group-hover:text-primary-600 transition-colors duration-300">
                    <span>Conoce más</span>
                    <ArrowRight size={16} className="ml-2 transform group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-8 lg:p-12 text-white">
            <h3 className="font-display text-2xl lg:text-3xl font-bold mb-4">
              ¿Listo para hacer crecer tu negocio?
            </h3>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Contáctanos hoy y descubre cómo nuestras estrategias de marketing digital 
              pueden transformar tu presencia online y generar resultados reales.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="secondary" size="lg">
                Consulta Gratuita
              </Button>
              <Button variant="outlineWhite" size="lg">
                Ver Casos de Éxito
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;
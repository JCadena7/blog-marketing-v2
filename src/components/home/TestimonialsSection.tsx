import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const TestimonialsSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: 'Carlos Rodríguez',
      position: 'CEO',
      company: 'TechStartup',
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 5,
      content: 'Marketing Pro transformó completamente nuestra presencia digital. En solo 6 meses aumentamos nuestro tráfico orgánico en un 300% y las conversiones se dispararon. Su equipo es excepcional.',
      results: { metric: 'Tráfico orgánico', value: '+300%' }
    },
    {
      id: 2,
      name: 'Ana García',
      position: 'Directora de Marketing',
      company: 'EcommerceStore',
      image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 5,
      content: 'La estrategia de SEM que desarrollaron para nosotros ha sido increíble. Nuestro ROI mejoró un 250% y las ventas online se triplicaron. Realmente entienden el negocio digital.',
      results: { metric: 'ROI', value: '+250%' }
    },
    {
      id: 3,
      name: 'Miguel Torres',
      position: 'Fundador',
      company: 'LocalBusiness',
      image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 5,
      content: 'Su enfoque en SEO local nos ayudó a dominar nuestra área geográfica. Ahora aparecemos en los primeros resultados para todas nuestras palabras clave principales. Excelente trabajo.',
      results: { metric: 'Visibilidad local', value: '+400%' }
    },
    {
      id: 4,
      name: 'Laura Fernández',
      position: 'CMO',
      company: 'HealthCorp',
      image: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 5,
      content: 'El dashboard de analytics que nos proporcionaron es increíble. Ahora podemos tomar decisiones basadas en datos reales y hemos optimizado todos nuestros canales digitales.',
      results: { metric: 'Conversiones', value: '+180%' }
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-800">
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
            Testimonios
          </div>
          
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Lo que dicen nuestros
            <span className="block text-primary-500">Clientes</span>
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            La satisfacción de nuestros clientes es nuestra mejor carta de presentación. 
            Descubre cómo hemos ayudado a empresas como la tuya a alcanzar sus objetivos.
          </p>
        </motion.div>

        {/* Testimonials Carousel */}
        <div className="relative">
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 lg:p-12 border border-gray-100 dark:border-gray-700"
              >
                <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
                  {/* Avatar and Info */}
                  <div className="flex-shrink-0 text-center lg:text-left">
                    <div className="relative mb-4">
                      <img
                        src={testimonials[currentIndex].image}
                        alt={testimonials[currentIndex].name}
                        className="w-24 h-24 rounded-full object-cover mx-auto lg:mx-0"
                      />
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                        <Quote size={16} className="text-white" />
                      </div>
                    </div>
                    
                    <h4 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-1">
                      {testimonials[currentIndex].name}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 mb-1">
                      {testimonials[currentIndex].position}
                    </p>
                    <p className="text-primary-500 font-medium mb-4">
                      {testimonials[currentIndex].company}
                    </p>
                    
                    {/* Rating */}
                    <div className="flex justify-center lg:justify-start mb-4">
                      {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                        <Star key={i} size={20} className="text-yellow-400 fill-current" />
                      ))}
                    </div>

                    {/* Result Badge */}
                    <div className="inline-block bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium">
                      {testimonials[currentIndex].results.metric}: {testimonials[currentIndex].results.value}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <blockquote className="text-lg lg:text-xl text-gray-700 dark:text-gray-300 leading-relaxed italic">
                      "{testimonials[currentIndex].content}"
                    </blockquote>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8">
              <button
                onClick={prevTestimonial}
                className="w-12 h-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center hover:bg-primary-50 dark:hover:bg-primary-900 hover:border-primary-200 dark:hover:border-primary-700 transition-colors duration-200"
              >
                <ChevronLeft size={20} className="text-gray-600 dark:text-gray-400" />
              </button>

              {/* Dots Indicator */}
              <div className="flex space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                      index === currentIndex 
                        ? 'bg-primary-500' 
                        : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={nextTestimonial}
                className="w-12 h-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center hover:bg-primary-50 dark:hover:bg-primary-900 hover:border-primary-200 dark:hover:border-primary-700 transition-colors duration-200"
              >
                <ChevronRight size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { value: '98%', label: 'Satisfacción del cliente' },
            { value: '250%', label: 'ROI promedio' },
            { value: '24/7', label: 'Soporte disponible' },
            { value: '50+', label: 'Proyectos exitosos' },
          ].map((stat, index) => (
            <div key={stat.label} className="text-center">
              <div className="font-display text-3xl font-bold text-primary-500 mb-2">
                {stat.value}
              </div>
              <div className="text-gray-600 dark:text-gray-300 text-sm">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
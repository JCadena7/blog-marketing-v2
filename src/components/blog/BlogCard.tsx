import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, ArrowRight, Tag } from 'lucide-react';
import MdxPreview from '../editor/mdx/MdxPreview';
import Card from '../ui/Card';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  publishedAt: string;
  readTime: number;
  author: {
    name: string;
    avatar: string;
  };
  category: {
    name: string;
    color: string;
  };
  image: string;
  tags: string[];
}

interface BlogCardProps {
  post: BlogPost;
  featured?: boolean;
}

const BlogCard: React.FC<BlogCardProps> = ({ post, featured = false }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={featured ? 'lg:col-span-2 lg:row-span-2' : ''}
    >
      <Card className="h-full overflow-hidden p-0 group cursor-pointer">
        <div className="relative">
          <div className="relative overflow-hidden">
            <img
              src={post.image}
              alt={post.title}
              className={`w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                featured ? 'h-64 lg:h-80' : 'h-48'
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Category Badge */}
            <div className="absolute top-4 left-4">
              <span 
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: post.category.color }}
              >
                {post.category.name}
              </span>
            </div>

            {/* Featured Badge */}
            {featured && (
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary-500 text-white">
                  Destacado
                </span>
              </div>
            )}
          </div>

          <div className={`p-6 ${featured ? 'lg:p-8' : ''}`}>
            {/* Meta Info */}
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
              <div className="flex items-center">
                <Calendar size={16} className="mr-1" />
                {formatDate(post.publishedAt)}
              </div>
              <div className="flex items-center">
                <Clock size={16} className="mr-1" />
                {post.readTime} min lectura
              </div>
              <div className="flex items-center">
                <User size={16} className="mr-1" />
                {post.author.name}
              </div>
            </div>

            {/* Title */}
            <h3 className={`font-display font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary-500 transition-colors duration-300 line-clamp-2 ${
              featured ? 'text-2xl lg:text-3xl' : 'text-xl'
            }`}>
              {post.title}
            </h3>

            {/* Excerpt */}
            <div className={`text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 ${
              featured ? 'text-lg leading-relaxed' : ''
            }`}>
              <MdxPreview content={post.excerpt} />
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.slice(0, featured ? 4 : 3).map((tag, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  <Tag size={12} className="mr-1" />
                  {tag}
                </span>
              ))}
            </div>

            {/* Author & CTA */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-8 h-8 rounded-full object-cover mr-2"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {post.author.name}
                </span>
              </div>
              
              <div className="flex items-center text-primary-500 font-medium group-hover:text-primary-600 transition-colors duration-300">
                <span className="text-sm">Leer más</span>
                <ArrowRight size={16} className="ml-1 transform group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default BlogCard;
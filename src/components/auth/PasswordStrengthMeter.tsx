import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CircleCheck as CheckCircle, X } from 'lucide-react';

interface PasswordStrengthMeterProps {
  password: string;
  showRequirements?: boolean;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const requirements: PasswordRequirement[] = [
  { label: 'Al menos 8 caracteres', test: (p) => p.length >= 8 },
  { label: 'Una letra minúscula', test: (p) => /[a-z]/.test(p) },
  { label: 'Una letra mayúscula', test: (p) => /[A-Z]/.test(p) },
  { label: 'Un número', test: (p) => /\d/.test(p) },
  { label: 'Un carácter especial', test: (p) => /[@$!%*?&]/.test(p) }
];

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ 
  password, 
  showRequirements = true 
}) => {
  const getStrength = () => {
    if (!password) return { score: 0, label: '', color: '' };
    
    const passedRequirements = requirements.filter(req => req.test(password)).length;
    
    if (passedRequirements <= 1) {
      return { score: 1, label: 'Muy débil', color: 'bg-red-500' };
    } else if (passedRequirements === 2) {
      return { score: 2, label: 'Débil', color: 'bg-red-400' };
    } else if (passedRequirements === 3) {
      return { score: 3, label: 'Regular', color: 'bg-yellow-500' };
    } else if (passedRequirements === 4) {
      return { score: 4, label: 'Buena', color: 'bg-green-400' };
    } else {
      return { score: 5, label: 'Muy fuerte', color: 'bg-green-500' };
    }
  };

  const strength = getStrength();
  const progressPercentage = (strength.score / 5) * 100;

  if (!password) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="space-y-3"
    >
      {/* Strength bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Fortaleza de la contraseña
          </span>
          <span className={`text-sm font-medium ${
            strength.score >= 4 ? 'text-green-600' : 
            strength.score >= 3 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {strength.label}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${strength.color}`}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Requirements checklist */}
      {showRequirements && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            {requirements.map((requirement, index) => {
              const isPassed = requirement.test(password);
              
              return (
                <motion.div
                  key={requirement.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center space-x-2 text-sm transition-colors duration-200 ${
                    isPassed ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  <motion.div
                    animate={{ scale: isPassed ? 1.1 : 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  >
                    {isPassed ? (
                      <CheckCircle size={16} className="text-green-500" />
                    ) : (
                      <X size={16} className="text-gray-400" />
                    )}
                  </motion.div>
                  <span>{requirement.label}</span>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );
};

export default PasswordStrengthMeter;
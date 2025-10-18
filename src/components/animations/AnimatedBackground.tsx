import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

const AnimatedBackground: React.FC = () => {
  const backgroundRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!backgroundRef.current || !particlesRef.current) return;

    // Animated gradient background
    const tl = gsap.timeline({ repeat: -1, yoyo: true });
    
    tl.to(backgroundRef.current, {
      backgroundPosition: '100% 100%',
      duration: 20,
      ease: 'sine.inOut'
    });

    // Floating particles animation
    const particles = particlesRef.current.children;
    
    Array.from(particles).forEach((particle, index) => {
      gsap.set(particle, {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        scale: Math.random() * 0.5 + 0.5,
        opacity: Math.random() * 0.3 + 0.1
      });

      gsap.to(particle, {
        y: '-=100',
        x: `+=${Math.random() * 200 - 100}`,
        duration: Math.random() * 10 + 10,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: index * 0.5
      });
    });

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Animated gradient background */}
      <div
        ref={backgroundRef}
        className="absolute inset-0 bg-gradient-to-br from-primary-400 via-secondary-500 to-purple-600 opacity-90"
        style={{
          backgroundSize: '400% 400%',
          backgroundPosition: '0% 0%'
        }}
      />
      
      {/* Overlay pattern */}
      <div className="absolute inset-0 bg-black/10" />
      
      {/* Floating particles */}
      <div ref={particlesRef} className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full blur-sm"
          />
        ))}
      </div>
      
      {/* Geometric shapes */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-white/5 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-48 h-48 bg-white/5 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white/5 rounded-full blur-xl animate-pulse" style={{ animationDelay: '4s' }} />
    </div>
  );
};

export default AnimatedBackground;
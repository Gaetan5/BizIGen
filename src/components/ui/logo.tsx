'use client';

import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showSlogan?: boolean;
  animated?: boolean;
  className?: string;
  variant?: 'full' | 'icon' | 'minimal';
}

const sizes = {
  sm: { icon: 32, text: 'text-lg', slogan: 'text-[8px]' },
  md: { icon: 40, text: 'text-xl', slogan: 'text-[10px]' },
  lg: { icon: 48, text: 'text-2xl', slogan: 'text-xs' },
  xl: { icon: 64, text: 'text-3xl', slogan: 'text-sm' },
};

export function BizGenLogo({
  size = 'md',
  showText = true,
  showSlogan = false,
  animated = true,
  className,
  variant = 'full',
}: LogoProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [pulseNodes, setPulseNodes] = useState<number[]>([]);

  // Circuit nodes that pulse
  useEffect(() => {
    if (!animated) return;
    
    const interval = setInterval(() => {
      const randomNode = Math.floor(Math.random() * 8);
      setPulseNodes(prev => [...prev.slice(-3), randomNode]);
    }, 800);

    return () => clearInterval(interval);
  }, [animated]);

  const { icon: iconSize, text: textSize, slogan: sloganSize } = sizes[size];

  // Circuit node positions on the Africa map
  const circuitNodes = [
    { x: 35, y: 25, delay: 0 }, // North West
    { x: 55, y: 20, delay: 0.1 }, // North East
    { x: 45, y: 40, delay: 0.2 }, // Center
    { x: 30, y: 50, delay: 0.3 }, // West
    { x: 60, y: 55, delay: 0.4 }, // East
    { x: 40, y: 70, delay: 0.5 }, // South West
    { x: 55, y: 75, delay: 0.6 }, // South
    { x: 50, y: 45, delay: 0.7 }, // Center-right
  ];

  return (
    <motion.div
      className={cn('flex items-center gap-3', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Logo Icon */}
      <motion.div
        className="relative"
        style={{ width: iconSize, height: iconSize }}
        whileHover={animated ? { scale: 1.1 } : undefined}
        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
      >
        {/* Glow Effect */}
        <motion.div
          className="absolute inset-0 rounded-xl blur-lg"
          style={{
            background: 'linear-gradient(135deg, hsl(25, 90%, 50%) 0%, hsl(40, 85%, 55%) 100%)',
          }}
          animate={animated ? {
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.1, 1],
          } : undefined}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Main Icon Container */}
        <motion.div
          className="relative w-full h-full rounded-xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, hsl(25, 90%, 50%) 0%, hsl(40, 85%, 55%) 100%)',
            boxShadow: `0 4px 20px -4px hsl(25, 90%, 40%)`,
          }}
          animate={animated && isHovered ? {
            boxShadow: [
              `0 4px 20px -4px hsl(25, 90%, 40%)`,
              `0 8px 30px -4px hsl(40, 85%, 50%)`,
              `0 4px 20px -4px hsl(25, 90%, 40%)`,
            ],
          } : undefined}
          transition={{ duration: 1, repeat: Infinity }}
        >
          {/* Africa Map SVG */}
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full"
            style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }}
          >
            {/* Background gradient */}
            <defs>
              <linearGradient id="africaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(25, 90%, 50%)" />
                <stop offset="100%" stopColor="hsl(40, 85%, 55%)" />
              </linearGradient>
              <linearGradient id="circuitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(0,0,0,0.4)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.2)" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Simplified Africa Map Shape */}
            <motion.path
              d="M50 5 
                 C60 8, 70 12, 75 20
                 L78 35 C80 45, 78 55, 75 65
                 C72 75, 65 85, 55 92
                 C50 95, 45 95, 40 92
                 C30 85, 25 75, 22 65
                 C20 55, 18 45, 20 35
                 L22 20 C25 12, 35 8, 50 5Z"
              fill="rgba(0,0,0,0.2)"
              animate={animated ? {
                fill: ['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.15)'],
              } : undefined}
              transition={{ duration: 3, repeat: Infinity }}
            />

            {/* Circuit Lines */}
            <motion.g
              stroke="rgba(0,0,0,0.3)"
              strokeWidth="0.8"
              fill="none"
              animate={animated ? { opacity: [0.5, 0.8, 0.5] } : undefined}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {/* Horizontal lines */}
              <line x1="30" y1="30" x2="70" y2="30" strokeDasharray="3 2" />
              <line x1="25" y1="50" x2="75" y2="50" strokeDasharray="4 2" />
              <line x1="30" y1="70" x2="70" y2="70" strokeDasharray="3 2" />
              {/* Vertical lines */}
              <line x1="40" y1="15" x2="40" y2="85" strokeDasharray="3 2" />
              <line x1="60" y1="15" x2="60" y2="85" strokeDasharray="3 2" />
              {/* Diagonal lines */}
              <line x1="30" y1="25" x2="70" y2="65" strokeDasharray="2 3" />
            </motion.g>

            {/* Circuit Nodes */}
            {circuitNodes.map((node, index) => (
              <motion.circle
                key={index}
                cx={node.x}
                cy={node.y}
                r={pulseNodes.includes(index) ? 3 : 2}
                fill="rgba(255,255,255,0.9)"
                filter="url(#glow)"
                animate={animated && pulseNodes.includes(index) ? {
                  r: [2, 3.5, 2],
                  opacity: [0.7, 1, 0.7],
                } : { r: 2, opacity: 0.7 }}
                transition={{ duration: 0.5 }}
              />
            ))}

            {/* Hexagon pattern (like honeycomb/tech cells) */}
            <motion.g
              fill="none"
              stroke="rgba(0,0,0,0.25)"
              strokeWidth="0.5"
              animate={animated ? { opacity: [0.3, 0.6, 0.3] } : undefined}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              <polygon points="35,40 40,37 45,40 45,46 40,49 35,46" />
              <polygon points="55,55 60,52 65,55 65,61 60,64 55,61" />
              <polygon points="40,65 45,62 50,65 50,71 45,74 40,71" />
            </motion.g>

            {/* Center architectural/building icon */}
            <motion.g
              transform="translate(42, 42)"
              fill="white"
              animate={animated && isHovered ? { scale: [1, 1.1, 1] } : { scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Building shape */}
              <rect x="4" y="8" width="8" height="8" rx="1" fill="white" opacity="0.9" />
              <rect x="5" y="4" width="6" height="4" rx="1" fill="white" opacity="0.8" />
              <rect x="7" y="0" width="2" height="4" fill="white" opacity="0.7" />
              {/* Windows */}
              <rect x="6" y="10" width="1.5" height="1.5" fill="hsl(25, 90%, 50%)" opacity="0.8" />
              <rect x="8.5" y="10" width="1.5" height="1.5" fill="hsl(25, 90%, 50%)" opacity="0.8" />
              <rect x="6" y="13" width="1.5" height="1.5" fill="hsl(25, 90%, 50%)" opacity="0.8" />
              <rect x="8.5" y="13" width="1.5" height="1.5" fill="hsl(25, 90%, 50%)" opacity="0.8" />
            </motion.g>

            {/* Animated pulse ring */}
            {animated && isHovered && (
              <motion.circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="1"
                initial={{ r: 30, opacity: 0.8 }}
                animate={{ r: 48, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </svg>

          {/* Sparkle effect on hover */}
          {animated && isHovered && (
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full"
                  style={{
                    top: `${20 + Math.random() * 60}%`,
                    left: `${20 + Math.random() * 60}%`,
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                />
              ))}
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Text */}
      {showText && (
        <div className="flex flex-col">
          <motion.span
            className={cn('font-bold tracking-tight', textSize)}
            style={{
              backgroundImage: 'linear-gradient(135deg, hsl(25, 90%, 45%) 0%, hsl(40, 85%, 50%) 50%, hsl(25, 90%, 45%) 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundSize: '200% 200%',
            } as React.CSSProperties}
            animate={animated ? {
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            } : undefined}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          >
            BizGen AI
          </motion.span>
          
          {showSlogan && (
            <motion.span
              className={cn('text-muted-foreground font-medium tracking-wider uppercase', sloganSize)}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Pour Entrepreneurs Africains
            </motion.span>
          )}
        </div>
      )}
    </motion.div>
  );
}

// Hero Logo - Larger version for hero sections
export function HeroLogo({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn('relative', className)}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      {/* Large animated background glow */}
      <motion.div
        className="absolute inset-0 blur-3xl"
        style={{
          background: 'radial-gradient(circle, hsl(25, 90%, 50% / 0.3) 0%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      
      <BizGenLogo size="xl" showText showSlogan animated />
    </motion.div>
  );
}

// Minimal logo for headers/sidebars
export function MiniLogo({ className }: { className?: string }) {
  return (
    <BizGenLogo size="sm" showText={!className?.includes('icon-only')} animated className={className} />
  );
}

export default BizGenLogo;

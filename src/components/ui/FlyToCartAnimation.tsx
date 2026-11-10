import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface TrajectoryPoint {
  x: number;
  y: number;
}

interface Particle {
  id: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  midX: number;
  midY: number;
  image?: string;
  samples: TrajectoryPoint[];
}

interface Shockwave {
  id: string;
  x: number;
  y: number;
}

export function FlyToCartAnimation() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [shockwaves, setShockwaves] = useState<Shockwave[]>([]);

  useEffect(() => {
    const handleCartAdd = (e: Event) => {
      const customEvent = e as CustomEvent<{ x?: number; y?: number; image?: string }>;
      
      // Calculate start coordinates from click or fallback to center
      const startX = customEvent.detail?.x ?? window.innerWidth / 2;
      const startY = customEvent.detail?.y ?? window.innerHeight / 2;

      // Locate navbar cart bag icon coordinates
      let targetX = window.innerWidth - 45;
      let targetY = 38;
      const cartBtn = document.getElementById('navbar-cart-button');
      if (cartBtn) {
        const rect = cartBtn.getBoundingClientRect();
        targetX = rect.left + rect.width / 2;
        targetY = rect.top + rect.height / 2;
      }

      // Calculate graceful upward curved trajectory (apex bowed upward towards top)
      const dx = targetX - startX;
      const dy = targetY - startY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Graceful high arching Bezier control point
      const archHeight = Math.max(90, Math.min(270, dist * 0.32));
      const midY = Math.max(18, Math.min(startY, targetY) - archHeight);
      const midX = (startX + targetX) / 2 + (startX < targetX ? 20 : -20);

      // Generate 9 keyframe samples along the quadratic Bezier curve
      const tSamples = [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1];
      const samples: TrajectoryPoint[] = tSamples.map(t => {
        const oneMinusT = 1 - t;
        return {
          x: oneMinusT * oneMinusT * startX + 2 * oneMinusT * t * midX + t * t * targetX,
          y: oneMinusT * oneMinusT * startY + 2 * oneMinusT * t * midY + t * t * targetY,
        };
      });

      const particleId = Math.random().toString(36).substring(2, 9);
      const newParticle: Particle = {
        id: particleId,
        startX,
        startY,
        targetX,
        targetY,
        midX,
        midY,
        image: customEvent.detail?.image,
        samples,
      };

      setParticles(prev => [...prev, newParticle]);

      // Exactly when particle arrives at cart bag (~700ms):
      const popTimer = setTimeout(() => {
        const originX = targetX / window.innerWidth;
        const originY = targetY / window.innerHeight;

        // 1. Confetti sparkle burst right at the cart position
        try {
          confetti({
            particleCount: 48,
            angle: 90,
            spread: 75,
            origin: { x: originX, y: originY },
            colors: [
              '#d92672', // Magenta Glow
              '#a31d58', // Rich Velvet Magenta
              '#f43f5e', // Rose Coral
              '#ff70a6', // Neon Pink
              '#fbbf24', // Luxury Gold
              '#10b981', // Bottle Green
              '#ffffff', // Diamond White
            ],
            shapes: ['star', 'circle'],
            scalar: 0.9,
            startVelocity: 24,
            gravity: 0.78,
            ticks: 120,
            zIndex: 100000,
          });

          // Secondary mini sparkle burst for sparkling shimmer
          setTimeout(() => {
            confetti({
              particleCount: 26,
              spread: 60,
              origin: { x: originX, y: originY },
              colors: ['#ff70a6', '#ffd166', '#ffffff', '#d92672'],
              shapes: ['star'],
              scalar: 0.75,
              startVelocity: 16,
              gravity: 0.7,
              ticks: 100,
              zIndex: 100000,
            });
          }, 80);
        } catch (err) {
          console.error('Confetti trigger error:', err);
        }

        // 2. Dispatch custom cart-icon-pop event to trigger cart button bounce & glow
        window.dispatchEvent(new CustomEvent('cart-icon-pop', {
          detail: { x: targetX, y: targetY }
        }));

        // 3. Shockwave ring visual at cart position
        const shockwaveId = Math.random().toString(36).substring(2, 9);
        setShockwaves(prev => [...prev, { id: shockwaveId, x: targetX, y: targetY }]);
        setTimeout(() => {
          setShockwaves(prev => prev.filter(s => s.id !== shockwaveId));
        }, 600);

      }, 700);

      // Clean up particle after animation finishes
      const removeTimer = setTimeout(() => {
        setParticles(prev => prev.filter(p => p.id !== particleId));
      }, 900);

      return () => {
        clearTimeout(popTimer);
        clearTimeout(removeTimer);
      };
    };

    window.addEventListener('cart-item-added', handleCartAdd);
    return () => window.removeEventListener('cart-item-added', handleCartAdd);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden">
      {/* SVG Shining Magenta Trajectory Line */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          {particles.map(p => (
            <React.Fragment key={`defs-${p.id}`}>
              {/* Glowing Magenta Gradient */}
              <linearGradient
                id={`magenta-grad-${p.id}`}
                x1={p.startX}
                y1={p.startY}
                x2={p.targetX}
                y2={p.targetY}
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#ec4899" stopOpacity="0.8" />
                <stop offset="35%" stopColor="#d92672" stopOpacity="1" />
                <stop offset="70%" stopColor="#a31d58" stopOpacity="1" />
                <stop offset="100%" stopColor="#ff70a6" stopOpacity="0.9" />
              </linearGradient>

              {/* Magenta Specular Glow Filter */}
              <filter id={`magenta-glow-${p.id}`} x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="5" result="blur1" />
                <feGaussianBlur stdDeviation="10" result="blur2" />
                <feMerge>
                  <feMergeNode in="blur2" />
                  <feMergeNode in="blur1" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </React.Fragment>
          ))}
        </defs>

        {particles.map(p => {
          const pathD = `M ${p.startX} ${p.startY} Q ${p.midX} ${p.midY} ${p.targetX} ${p.targetY}`;
          return (
            <g key={`beam-${p.id}`}>
              {/* Outer Ambient Glowing Aura */}
              <motion.path
                d={pathD}
                fill="none"
                stroke="#d92672"
                strokeWidth="14"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0.4 }}
                animate={{ pathLength: [0, 1, 1], opacity: [0.4, 0.65, 0] }}
                transition={{ duration: 0.78, ease: "easeOut" }}
                style={{ filter: "blur(6px)" }}
              />

              {/* Core Vibrant Magenta Neon Beam */}
              <motion.path
                d={pathD}
                fill="none"
                stroke={`url(#magenta-grad-${p.id})`}
                strokeWidth="4.5"
                strokeLinecap="round"
                filter={`url(#magenta-glow-${p.id})`}
                initial={{ pathLength: 0, opacity: 1 }}
                animate={{ pathLength: [0, 1, 1], opacity: [1, 1, 0] }}
                transition={{ duration: 0.78, ease: "easeOut" }}
              />

              {/* Specular White Shine Beam sweeping along the curve */}
              <motion.path
                d={pathD}
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="45 180"
                initial={{ strokeDashoffset: 200, opacity: 0 }}
                animate={{ strokeDashoffset: [-80, -650], opacity: [0, 1, 1, 0] }}
                transition={{ duration: 0.75, ease: "easeInOut" }}
              />

              {/* Stardust Sparkle Beads along the curved line */}
              {[0.2, 0.45, 0.7, 0.9].map((tVal, sIdx) => {
                const sampleIndex = Math.min(p.samples.length - 1, Math.round(tVal * (p.samples.length - 1)));
                const pt = p.samples[sampleIndex];
                if (!pt) return null;
                return (
                  <motion.circle
                    key={`spark-${p.id}-${sIdx}`}
                    cx={pt.x}
                    cy={pt.y}
                    r={3.5}
                    fill="#ffffff"
                    stroke="#ff70a6"
                    strokeWidth={1.5}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 1.8, 0], opacity: [0, 1, 0] }}
                    transition={{ delay: 0.12 + sIdx * 0.12, duration: 0.35 }}
                  />
                );
              })}
            </g>
          );
        })}
      </svg>

      {/* Flying Glossy Magenta Orb */}
      <AnimatePresence>
        {particles.map(p => {
          const xKeys = p.samples.map(s => s.x - 26);
          const yKeys = p.samples.map(s => s.y - 26);

          return (
            <motion.div
              key={`orb-${p.id}`}
              initial={{
                x: p.startX - 26,
                y: p.startY - 26,
                scale: 0.85,
                opacity: 1,
                rotate: 0,
              }}
              animate={{
                x: xKeys,
                y: yKeys,
                scale: [0.85, 1.3, 1.2, 0.8, 0.35, 0.05],
                opacity: [1, 1, 1, 1, 0.9, 0],
                rotate: [0, 90, 180, 270, 360],
              }}
              transition={{
                duration: 0.72,
                ease: "easeInOut",
              }}
              className="absolute top-0 left-0 w-[52px] h-[52px] rounded-full z-50 pointer-events-none flex items-center justify-center"
              style={{
                boxShadow: "0 0 24px rgba(217, 38, 114, 0.9), 0 0 45px rgba(163, 29, 88, 0.6), inset 0 0 12px rgba(255, 255, 255, 0.7)",
              }}
            >
              {/* Glossy magenta aura ring container */}
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#a31d58] via-[#d92672] to-[#ff70a6] p-[2.5px] shadow-2xl">
                <div className="w-full h-full rounded-full bg-white dark:bg-neutral-900 overflow-hidden relative flex items-center justify-center">
                  {p.image ? (
                    <img src={p.image} alt="Cart product" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#d92672] to-[#a31d58] flex items-center justify-center text-white font-black text-xs">
                      +1
                    </div>
                  )}
                  {/* Glossy specular highlight reflection */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-white/80 pointer-events-none rounded-full" />
                </div>
              </div>

              {/* Floating sparkling star badge */}
              <motion.div
                animate={{ rotate: 360, scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 0.6 }}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#fbbf24] text-[#12261b] flex items-center justify-center text-[10px] shadow-md border border-white font-bold"
              >
                ✨
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Cart Target Shockwave Rings */}
      <AnimatePresence>
        {shockwaves.map(s => (
          <motion.div
            key={`shockwave-${s.id}`}
            initial={{
              x: s.x - 24,
              y: s.y - 24,
              scale: 0.3,
              opacity: 1,
            }}
            animate={{
              scale: [0.3, 2.2, 2.8],
              opacity: [1, 0.7, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.55,
              ease: "easeOut",
            }}
            className="absolute top-0 left-0 w-12 h-12 rounded-full border-2 border-[#d92672] ring-4 ring-[#ff70a6]/50 bg-[#d92672]/20 pointer-events-none shadow-[0_0_24px_#d92672]"
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

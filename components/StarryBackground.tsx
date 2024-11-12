'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

function generateStars(count: number, size: number) {
  return Array.from({ length: count }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size,
    duration: 50 + Math.random() * 100,
  }));
}

export function StarryBackground() {
  const [stars, setStars] = useState<{
    small: Array<any>;
    medium: Array<any>;
    large: Array<any>;
  } | null>(null);

  useEffect(() => {
    // Generate stars only on the client side
    setStars({
      small: generateStars(700, 1),
      medium: generateStars(200, 2),
      large: generateStars(100, 3),
    });
  }, []);

  if (!stars) {
    return (
      <div className="absolute inset-0 bg-gradient-to-b from-[#1B2735] to-[#090A0F]" />
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#1B2735] to-[#090A0F]">
        {Object.entries(stars).map(([key, starArray]) => (
          <div key={key} className="absolute inset-0">
            {starArray.map((star, index) => (
              <motion.div
                key={index}
                className="absolute rounded-full bg-white"
                style={{
                  left: `${star.x}%`,
                  top: `${star.y}%`,
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                }}
                animate={{
                  y: [0, -2000],
                }}
                transition={{
                  duration: star.duration,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
} 
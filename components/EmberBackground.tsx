"use client";

import { useEffect, useRef } from 'react';

export function EmberBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateCanvasSize();

    const emberSettings = {
      maxSize: 4,
      minSize: 1,
      maxSpeed: 7,
      minSpeed: 0.5,
      color: 'rgba(255, 69, 0, 0.7)' as const,
    };

    class Ember {
      x!: number;
      y!: number;
      size!: number;
      speed!: number;
      opacity!: number;
      fadeRate!: number;
      color!: string;

      constructor() {
        this.reset();
      }

      reset() {
        if (!canvas) return;
        
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + Math.random() * 100;
        this.size = emberSettings.minSize + Math.random() * (emberSettings.maxSize - emberSettings.minSize);
        this.speed = emberSettings.minSpeed + Math.random() * (emberSettings.maxSpeed - emberSettings.minSpeed);
        this.opacity = 1;
        this.fadeRate = Math.random() * 0.02 + 0.005;
        this.color = emberSettings.color;
      }

      update() {
        this.y -= this.speed;
        this.opacity -= this.fadeRate;
        if (this.opacity <= 0) {
          this.reset();
        }
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color.replace('0.7', this.opacity.toFixed(2));
        ctx.fill();
      }
    }

    const embers: Ember[] = Array.from({ length: 200 }, () => new Ember());

    window.addEventListener('resize', updateCanvasSize);

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      embers.forEach(ember => {
        ember.update();
        ember.draw();
      });

      requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
      style={{ backgroundColor: '#111' }}
    />
  );
} 
"use client";

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface AnimatedGradientTextProps {
  text: string;
  className?: string;
}

export function AnimatedGradientText({ text, className = "" }: AnimatedGradientTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const mainText = containerRef.current.querySelector(".main-text");
    const layers = {
      topText1: containerRef.current.querySelector(".top-1"),
      topText2: containerRef.current.querySelector(".top-2"),
      topText3: containerRef.current.querySelector(".top-3"),
      bottomText1: containerRef.current.querySelector(".bottom-1"),
      bottomText2: containerRef.current.querySelector(".bottom-2"),
      bottomText3: containerRef.current.querySelector(".bottom-3"),
    };

    const animations = [
      gsap.to(mainText, {duration: 1, scale: 1, repeat: -1, yoyo: true, ease: "power1.inOut", repeatDelay: 1}),
      gsap.to(layers.topText1, { duration: 2, opacity: 0.3, y: -20, repeat: -1, yoyo: true, repeatDelay: 0 }),
      gsap.to(layers.topText2, { duration: 2, opacity: 0.2, y: -40, repeat: -1, yoyo: true, repeatDelay: 0 }),
      gsap.to(layers.topText3, { duration: 2, opacity: 0.1, y: -60, repeat: -1, yoyo: true, repeatDelay: 0 }),
      gsap.to(layers.bottomText1, { duration: 2, opacity: 0.3, y: 20, repeat: -1, yoyo: true, repeatDelay: 0 }),
      gsap.to(layers.bottomText2, { duration: 2, opacity: 0.2, y: 40, repeat: -1, yoyo: true, repeatDelay: 0 }),
      gsap.to(layers.bottomText3, { duration: 2, opacity: 0.1, y: 60, repeat: -1, yoyo: true, repeatDelay: 0 }),
    ];

    return () => {
      animations.forEach(animation => animation.kill());
    };
  }, []);

  return (
    <div ref={containerRef} className={`gradient-text text-2xl md:text-4xl lg:text-5xl xl:text-6xl ${className}`}>
      <span className="main-text font-bold">{text}</span>
      <span className="top-1">{text}</span>
      <span className="top-2">{text}</span>
      <span className="top-3">{text}</span>
      <span className="bottom-1">{text}</span>
      <span className="bottom-2">{text}</span>
      <span className="bottom-3">{text}</span>
    </div>
  );
} 
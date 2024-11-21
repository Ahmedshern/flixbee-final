"use client";

import styles from './NeonText.module.css';

interface NeonTextProps {
  text: string;
  className?: string;
}

export function NeonText({ text, className }: NeonTextProps) {
  return (
    <div className={`${styles.neonContainer} ${className || ''}`}>
      {text.split('').map((char, index) => (
        <span
          key={index}
          className={`${styles.letter} ${index === 1 ? styles.flicker : ''}`}
        >
          {char}
        </span>
      ))}
    </div>
  );
} 
"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, LayoutDashboard } from "lucide-react";

interface AnimatedMobileNavProps {
  user?: any;
  handleSignOut?: () => void;
}

export function AnimatedMobileNav({ user, handleSignOut }: AnimatedMobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    document.body.style.overflow = isOpen ? 'auto' : 'hidden';
  };

  const handleNavigation = (href: string) => {
    setIsOpen(false);
    document.body.style.overflow = 'auto';
    router.push(href);
  };

  const handleSignOutClick = () => {
    if (handleSignOut) {
      handleSignOut();
      setIsOpen(false);
      document.body.style.overflow = 'auto';
    }
  };

  return (
    <>
      <button
        onClick={toggleMenu}
        className={cn(
          "fixed top-4 right-4 md:hidden hamburger hamburger-cancel z-[100] w-6 h-6",
          isOpen && "active"
        )}
        aria-label="Toggle menu"
      >
        <span className="icon" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="fixed inset-0 min-h-[100dvh] w-full z-[90] bg-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Background Layers */}
            {['top', 'mid', 'bot'].map((layer, index) => (
              <motion.div
                key={layer}
                className="absolute inset-0 w-[150vw] h-[150vh] -left-[25vw] -top-[25vh] bg-white/95 dark:bg-gray-900/95"
                initial={{ height: "0%", top: "50%" }}
                animate={{ height: "150%", top: `${-20 + (index * 50)}%` }}
                exit={{ height: "0%", top: "50%" }}
                transition={{
                  duration: 0.7,
                  ease: [0.22, 1, 0.36, 1],
                  delay: index * 0.1
                }}
                style={{
                  transform: "rotate(37deg)",
                  transformOrigin: "center",
                  marginTop: "64px",
                }}
              />
            ))}

            {/* Navigation Links */}
            <motion.div
              className="fixed inset-0 flex items-center justify-center z-[95] min-h-[100dvh] mt-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.3 }}
            >
              <ul className="flex flex-col items-center justify-center space-y-8">
                {user && (
                  <motion.li
                    className="text-2xl font-medium text-black dark:text-white cursor-pointer"
                    whileHover={{ scale: 1.1 }}
                    onClick={() => handleNavigation('/dashboard')}
                  >
                    <span className="flex items-center gap-2">
                      <LayoutDashboard className="h-6 w-6" />
                      Dashboard
                    </span>
                  </motion.li>
                )}

                <motion.li
                  className="text-2xl font-medium text-black dark:text-white cursor-pointer"
                  whileHover={{ scale: 1.1 }}
                  onClick={() => handleNavigation('/pricing')}
                >
                  Pricing
                </motion.li>
                
                <motion.li
                  className="text-2xl font-medium text-black dark:text-white cursor-pointer"
                  whileHover={{ scale: 1.1 }}
                  onClick={() => handleNavigation('/faq')}
                >
                  FAQ
                </motion.li>

                {user ? (
                  <motion.li
                    className="text-2xl font-medium text-black dark:text-white cursor-pointer"
                    whileHover={{ scale: 1.1 }}
                    onClick={handleSignOutClick}
                  >
                    <span className="flex items-center gap-2">
                      <LogOut className="h-6 w-6" />
                      Sign out
                    </span>
                  </motion.li>
                ) : (
                  <>
                    <motion.li
                      className="text-2xl font-medium text-black dark:text-white cursor-pointer"
                      whileHover={{ scale: 1.1 }}
                      onClick={() => handleNavigation('/login')}
                    >
                      Login
                    </motion.li>
                    
                    <motion.li
                      className="text-2xl font-medium"
                      whileHover={{ scale: 1.1 }}
                    >
                      <button
                        onClick={() => handleNavigation('/register')}
                        className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md"
                      >
                        Get Started
                      </button>
                    </motion.li>
                  </>
                )}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
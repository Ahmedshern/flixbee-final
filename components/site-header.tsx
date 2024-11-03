"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuthContext } from "@/components/auth-provider";
import { Film, Menu } from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedEntrance } from "@/components/ui/animated-entrance";

const MainNav = () => {
  const pathname = usePathname();
  
  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link href="/pricing" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Pricing
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

const MobileNav = () => {
  const { user } = useAuthContext();
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <div className="flex flex-col space-y-4 mt-4">
          <Link href="/pricing" className="text-lg font-medium">
            Pricing
          </Link>
          {user ? (
            <Link href="/dashboard" className="text-lg font-medium">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-lg font-medium">
                Login
              </Link>
              <Link href="/register" className="text-lg font-medium">
                Get Started
              </Link>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export function SiteHeader() {
  const { user } = useAuthContext();

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container flex h-16 items-center">
        <MobileNav />
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Link href="/" className="flex items-center space-x-2 ml-4 md:ml-0">
            <Film className="h-6 w-6 text-yellow-500" />
            <span className="font-bold text-xl">BuzzPlay</span>
          </Link>
        </motion.div>
        <div className="mx-6">
          <MainNav />
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <ThemeToggle />
          <AnimatedEntrance className="hidden md:flex items-center space-x-4">
            {user ? (
              <Button asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-primary">
                  Login
                </Link>
                <Button asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
              </>
            )}
          </AnimatedEntrance>
        </div>
      </div>
    </motion.header>
  );
}
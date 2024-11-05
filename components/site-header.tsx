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
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuthContext } from "@/components/auth-provider";
import { Film, Menu, CreditCard, LayoutDashboard, LogIn, UserPlus } from "lucide-react";
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
  const [open, setOpen] = React.useState(false);
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="left" 
        className="w-[80vw] sm:w-[300px] p-0"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation Menu</SheetTitle>
          <SheetDescription>
            Access site navigation and user options
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col h-full">
          <div className="p-4 sm:p-6 flex justify-center border-b">
            <Link 
              href="/" 
              className="flex items-center gap-2"
              onClick={() => setOpen(false)}
            >
              <Film className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />
              <span className="font-bold text-xl sm:text-2xl">BuzzPlay</span>
            </Link>
          </div>

          <nav className="flex-1 overflow-y-auto p-3 sm:p-4" aria-label="Main navigation">
            <div className="space-y-1 sm:space-y-2">
              <Link 
                href="/pricing" 
                className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors"
                onClick={() => setOpen(false)}
              >
                <CreditCard className="h-4 w-4" />
                <span>Pricing</span>
              </Link>

              {user ? (
                <Link 
                  href="/dashboard" 
                  className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors"
                  onClick={() => setOpen(false)}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Login</span>
                  </Link>
                  <Link 
                    href="/register" 
                    className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Get Started</span>
                  </Link>
                </>
              )}
            </div>
          </nav>

          <div className="p-3 sm:p-4 border-t">
            <p className="text-xs text-center text-muted-foreground">
              © {new Date().getFullYear()} BuzzPlay. All rights reserved.
            </p>
          </div>
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
            <img src="/images/logo.png" alt="Logo" className="h-10 w-10" />
            <span className="font-normal text-4xl" style={{ fontFamily: 'SequelSansBlack' }}>
              <span style={{ fontFamily: 'SequelSansBlack' }} className="text-white tracking-wider">Buzz</span>
              <span style={{ fontFamily: 'SequelSansBlack' }} className="text-cyan tracking-wider">Play</span>
            </span>
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
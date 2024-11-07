"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
import { Film, Menu, CreditCard, LayoutDashboard, LogIn, UserPlus, LogOut, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedEntrance } from "@/components/ui/animated-entrance";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Image from "next/image";

const MainNav = () => {
  const pathname = usePathname();
  
  return (
    <NavigationMenu className="hidden md:flex ml-auto mr-4">
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
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/");
      setOpen(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  
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
              <Image
                src="/images/logo.svg" 
                alt="BuzzPlay Logo"
                width={32}
                height={32}
                priority
              />
              <span 
                className="font-bold text-2xl" 
                style={{ fontFamily: 'SequelSansBlack' }}
              >
                <span className="text-black dark:text-white">Buzz</span>
                <span className="text-cyan">Play</span>
              </span>
            </Link>
          </div>

          <nav className="flex-1 overflow-y-auto p-3 sm:p-4" aria-label="Main navigation">
            <div className="space-y-1 sm:space-y-2">
            <Link 
                    href="/register" 
                    className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Get Started</span>
                  </Link>
              

              {user ? (
                <>
                  <Link 
                    href="/dashboard" 
                    className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign out</span>
                  </button>
                </>
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
                href="/pricing" 
                className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors"
                onClick={() => setOpen(false)}
              >
                <CreditCard className="h-4 w-4" />
                <span>Pricing</span>
              </Link>

              <Link 
                href="/faq" 
                className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors"
                onClick={() => setOpen(false)}
              >
                <HelpCircle className="h-4 w-4" />
                <span>FAQ</span>
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
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

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
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3 ml-2 md:ml-0">
            <img 
              src="./images/logo.svg" 
              alt="BuzzPlay Logo" 
              className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16" 
            />
            <span 
              className="font-bold text-2xl sm:text-3xl md:text-5xl" 
              style={{ fontFamily: 'SequelSansBlack' }}
            >
              <span className="text-black dark:text-white">Buzz</span>
              <span className="text-cyan">Play</span>
            </span>
          </Link>
        </motion.div>
        
        <div className="flex items-center ml-auto">
          <AnimatedEntrance className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Button asChild className="bg-cyan hover:bg-cyan/70">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <Link href="/faq" className="text-sm font-medium text-muted-foreground hover:text-cyan">
                  FAQ
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-sm font-medium text-muted-foreground hover:text-cyan flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-cyan">
                  Pricing
                </Link>
                <Link href="/faq" className="text-sm font-medium text-muted-foreground hover:text-cyan">
                  FAQ
                </Link>
                <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-cyan">
                  Login
                </Link>
                <Button asChild>
                  <Link href="/register" className="bg-cyan hover:bg-cyan/70">Get Started</Link>
                </Button>
              </>
            )}
          </AnimatedEntrance>
        </div>
      </div>
    </motion.header>
  );
}
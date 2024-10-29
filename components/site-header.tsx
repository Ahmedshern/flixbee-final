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
import { useAuthContext } from "@/components/auth-provider";
import { Film } from "lucide-react";

const MainNav = () => {
  const pathname = usePathname();
  
  return (
    <NavigationMenu>
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

export function SiteHeader() {
  const pathname = usePathname();
  const { user } = useAuthContext();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="flex items-center space-x-2">
          <Film className="h-6 w-6 text-yellow-500" />
          <span className="font-bold text-xl">BeeFlix</span>
        </Link>
        <div className="mx-6">
          <MainNav />
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <ThemeToggle />
          {user ? (
            <Button asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Link
                href="/login"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === "/login"
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                Login
              </Link>
              <Button asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
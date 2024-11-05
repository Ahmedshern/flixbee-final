import { Facebook, Instagram, Twitter } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t py-4 md:py-0">
      <div className="container flex flex-col items-center gap-3 md:h-16 md:flex-row md:justify-between">
        <div className="flex items-center gap-4">
          <Link href="https://twitter.com/BuzzPlayMV" target="_blank" rel="noopener noreferrer">
            <Twitter className="h-6 w-6 hover:text-primary" />
          </Link>
          <Link href="https://facebook.com/BuzzPlayMV" target="_blank" rel="noopener noreferrer">
            <Facebook className="h-6 w-6 hover:text-primary" />
          </Link>
          <Link href="https://instagram.com/BuzzPlayMV" target="_blank" rel="noopener noreferrer">
            <Instagram className="h-6 w-6 hover:text-primary" />
          </Link>
        </div>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} BuzzPlay. All rights reserved.
        </p>
      </div>
    </footer>
  );
} 
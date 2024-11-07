import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInstagram, faTiktok, faTelegram} from '@fortawesome/free-brands-svg-icons'
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t py-4 md:py-0">
      <div className="container flex flex-col items-center gap-3 md:h-16 md:flex-row md:justify-between">
        <div className="flex items-center gap-4">
          <Link href="https://t.me/BuzzPlayMV" target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faTelegram} className="h-6 w-6 hover:text-primary transition-colors" />  
          </Link>
          <Link href="https://tiktok.com/@BuzzPlayMV" target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faTiktok} className="h-6 w-6 hover:text-primary transition-colors" />
          </Link>
          <Link href="https://instagram.com/BuzzPlayMV" target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faInstagram} className="h-6 w-6 hover:text-primary transition-colors" />
          </Link>
        </div>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} BuzzPlay. All rights reserved.
        </p>
      </div>
    </footer>
  );
} 
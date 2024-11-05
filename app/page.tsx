"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Film, Tv2, MessageCircle } from "lucide-react";
import Link from "next/link";
import { AnimatedEntrance } from "@/components/ui/animated-entrance";

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";

function useMovieBackgrounds() {
  const [currentBackground, setCurrentBackground] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchMoviePosters = async () => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/now_playing?api_key=${TMDB_API_KEY}&language=en-US&page=1`
      );
      const data = await response.json();
      const movies = data.results.filter((movie: any) => movie.backdrop_path);
      const randomMovie = movies[Math.floor(Math.random() * movies.length)];
      return `${TMDB_IMAGE_BASE_URL}${randomMovie.backdrop_path}`;
    } catch (error) {
      console.error("Error fetching movie posters:", error);
      return null;
    }
  };

  useEffect(() => {
    const updateBackground = async () => {
      const newBackground = await fetchMoviePosters();
      if (newBackground) {
        setCurrentBackground(newBackground);
        setIsLoading(false);
      }
    };

    updateBackground();
    const interval = setInterval(updateBackground, 10000);
    return () => clearInterval(interval);
  }, []);

  return { currentBackground, isLoading };
}

export default function Home() {
  const { currentBackground, isLoading } = useMovieBackgrounds();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "BuzzPlayy",
    "url": "https://BuzzPlay.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://BuzzPlay.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "sameAs": [
      "https://twitter.com/BuzzPlay",
      "https://facebook.com/BuzzPlay",
      "https://instagram.com/BuzzPlay"
    ]
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] w-full">
      <section className="space-y-6 pb-0 pt-6 md:pb-0 md:pt-10 lg:py-32 relative overflow-hidden min-h-[80vh] lg:min-h-[90vh] flex items-center w-full">
        <AnimatePresence mode="wait">
          {!isLoading && (
            <motion.div
              key={currentBackground}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.15 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${currentBackground})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundColor: 'black',
              }}
            />
          )}
        </AnimatePresence>
        
        <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center relative">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-bold text-3xl sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Your Entertainment,{" "}
            <span className="text-yellow-500 relative">
              Unleashed
              <motion.div
                className="absolute bottom-0 left-0 h-1 bg-yellow-500"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.5, duration: 0.8 }}
              />
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8"
          >
            Stream unlimited movies, TV shows, and more. Start watching today with BuzzPlay.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 sm:space-x-4"
          >
            <Button 
              asChild 
              size="lg" 
              className="hover:scale-105 transition-transform w-full sm:w-auto"
            >
              <Link href="/register">Get Started</Link>
            </Button>
            
            <Button 
              asChild 
              size="lg" 
              variant="outline" 
              className="hover:scale-105 transition-transform w-full sm:w-auto"
            >
              <Link href="/pricing">View Plans</Link>
            </Button>
            
            <Button 
              asChild 
              size="lg" 
              variant="outline" 
              className="hover:scale-105 transition-transform w-full sm:w-auto"
            >
              <Link 
                href="https://t.me/buzzplaymv" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Contact Us
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
      
      <AnimatedEntrance delay={0.6}>
        <section className="w-full py-0 md:py-0 lg:py-0 relative">
          <div 
            className="absolute inset-0" 
            style={{
              backgroundImage: `
                linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.8)),
                radial-gradient(circle at top left, rgba(59, 130, 246, 0.4), transparent 50%),
                radial-gradient(circle at bottom right, rgba(234, 179, 8, 0.4), transparent 50%),
                radial-gradient(circle at center, rgba(147, 51, 234, 0.3), transparent 70%)
              `,
              backgroundSize: 'cover',
              backgroundColor: 'transparent',
              opacity: '1',
              mixBlendMode: 'normal',
            }}
          />
          
          <div className="container mx-auto grid justify-center gap-6 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3 relative z-10 pt-12 pb-24">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Card className="h-full bg-white/5 backdrop-blur-md border-white/10 hover:border-yellow-500/50 transition-all shadow-xl">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <Play className="h-12 w-12 mb-4 text-yellow-500" />
                  <h3 className="font-semibold text-lg text-yellow-50">Instant Streaming</h3>
                  <p className="text-sm text-zinc-300 text-center">
                    Watch instantly on any device
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Card className="h-full bg-white/5 backdrop-blur-md border-white/10 hover:border-yellow-500/50 transition-all shadow-xl">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <Film className="h-12 w-12 mb-4 text-yellow-500" />
                  <h3 className="font-semibold text-lg text-yellow-50">Latest Movies</h3>
                  <p className="text-sm text-zinc-300 text-center">
                    New releases every week
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Card className="h-full bg-white/5 backdrop-blur-md border-white/10 hover:border-yellow-500/50 transition-all shadow-xl">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <Tv2 className="h-12 w-12 mb-4 text-yellow-500" />
                  <h3 className="font-semibold text-lg text-yellow-50">TV Shows</h3>
                  <p className="text-sm text-zinc-300 text-center">
                    Binge-worthy series
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      </AnimatedEntrance>
    </div>
  );
}
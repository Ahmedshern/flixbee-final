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

  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section - Full Viewport Height */}
      <div className="relative flex flex-1 flex-col items-center justify-center text-center px-4 min-h-screen">
        {/* Movie Background */}
        <AnimatePresence mode="wait">
          {!isLoading && (
            <motion.div
              key={currentBackground}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
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

        {/* Glassmorphism Container */}
        <div className="relative max-w-4xl mx-auto p-8 rounded-xl backdrop-blur-md bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 shadow-xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
            <span className="text-black dark:text-white">Your Entertainment,</span>
            <br />
            <span className="text-emerald-500 underline decoration-emerald-500/50">Unleashed</span>
          </h1>
          
          <p className="mt-6 text-lg text-white">
            Stream unlimited movies, TV shows, and more. Start watching today
            with BuzzPlay.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="bg-emerald-500 hover:bg-emerald-600">
              <Link href="/register">Get Started</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/pricing">View Plans</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 py-24" 
           style={{ 
             backgroundImage: 'url(/images/features-bg.png)',
             backgroundSize: 'cover',
             backgroundPosition: 'center',
             backgroundRepeat: 'no-repeat',
             opacity: 0.9
           }}>
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Instant Streaming */}
            <div className="group relative overflow-hidden rounded-xl backdrop-blur-md bg-black/30 border border-white/10 p-8 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:bg-white/10">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <Play className="w-12 h-12 mb-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold mb-2 text-white">Instant Streaming</h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                  Watch instantly on any device
                </p>
              </div>
            </div>

            {/* Latest Movies */}
            <div className="group relative overflow-hidden rounded-xl backdrop-blur-md bg-black/30 border border-white/10 p-8 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:bg-white/10">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <Film className="w-12 h-12 mb-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold mb-2 text-white">Latest Movies</h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                  New releases every week
                </p>
              </div>
            </div>

            {/* TV Shows */}
            <div className="group relative overflow-hidden rounded-xl backdrop-blur-md bg-black/30 border border-white/10 p-8 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:bg-white/10">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <Tv2 className="w-12 h-12 mb-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold mb-2 text-white">TV Shows</h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                  Binge-worthy series
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
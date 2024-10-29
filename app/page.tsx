import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Film, Tv2, Award } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
        <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
          <h1 className="font-bold text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
            Your Entertainment,{" "}
            <span className="text-yellow-500">Unleashed</span>
          </h1>
          <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            Stream unlimited movies, TV shows, and more. Start watching today with BeeFlix.
          </p>
          <div className="space-x-4">
            <Button asChild size="lg">
              <Link href="/register">Get Started</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/pricing">View Plans</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container space-y-6 py-8 md:py-12 lg:py-24">
        <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-4">
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <Play className="h-12 w-12 mb-4 text-yellow-500" />
              <h3 className="font-semibold">Instant Streaming</h3>
              <p className="text-sm text-muted-foreground text-center">
                Watch instantly on any device
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <Film className="h-12 w-12 mb-4 text-yellow-500" />
              <h3 className="font-semibold">Latest Movies</h3>
              <p className="text-sm text-muted-foreground text-center">
                New releases every week
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <Tv2 className="h-12 w-12 mb-4 text-yellow-500" />
              <h3 className="font-semibold">TV Shows</h3>
              <p className="text-sm text-muted-foreground text-center">
                Binge-worthy series
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <Award className="h-12 w-12 mb-4 text-yellow-500" />
              <h3 className="font-semibold">Premium Quality</h3>
              <p className="text-sm text-muted-foreground text-center">
                4K HDR streaming
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
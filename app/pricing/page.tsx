"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useAuthContext } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import { AnimatedEntrance } from "@/components/ui/animated-entrance";
import { motion } from "framer-motion";
import { plans } from "@/lib/config/plans";

export default function PricingPage() {
  const { user } = useAuthContext();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selectedDurations, setSelectedDurations] = useState({
    Mobile: 1,
    Basic: 1,
    Standard: 1,
    Premium: 1,
  });

  useEffect(() => {
    setMounted(true);
    setSelectedDurations({
      Mobile: 1,
      Basic: 1,
      Standard: 1,
      Premium: 1,
    });
  }, []);

  if (!mounted) {
    return (
      <div className="relative min-h-screen">
        {/* Modern gradient background */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]" />
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]" />
          <div className="absolute right-[-20%] top-[-10%] -z-10 h-[580px] w-[580px] rounded-full bg-primary/30 opacity-20 blur-[100px]" />
          <div className="absolute bottom-[-10%] left-[-20%] -z-10 h-[580px] w-[580px] rounded-full bg-primary/30 opacity-20 blur-[100px]" />
        </div>

        <div className="container relative py-8 px-4 md:py-16 md:px-8">
          <div className="text-center mb-8 md:mb-16">
            <div className="h-12 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg mx-auto mb-4 animate-pulse" />
            <div className="h-6 w-96 bg-gray-200 dark:bg-gray-800 rounded-lg mx-auto animate-pulse" />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8 max-w-7xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[600px] bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const handleSubscribe = (planName: string) => {
    if (!user) {
      router.push("/register");
      return;
    }
    const duration = selectedDurations[planName as keyof typeof selectedDurations];
    router.push(`/checkout?plan=${planName.toLowerCase()}&duration=${duration}`);
  };

  const handleDurationChange = (planName: string, duration: number) => {
    setSelectedDurations((prev) => ({ ...prev, [planName]: duration }));
  };

  return (
    <div className="relative min-h-screen">
      {/* Modern gradient background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]" />
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]" />
        <div className="absolute right-[-20%] top-[-10%] -z-10 h-[580px] w-[580px] rounded-full bg-primary/30 opacity-20 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-20%] -z-10 h-[580px] w-[580px] rounded-full bg-primary/30 opacity-20 blur-[100px]" />
      </div>

      {/* Content */}
      <div className="container relative py-8 px-4 md:py-16 md:px-8">
        <AnimatedEntrance>
          <div className="text-center mb-8 md:mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 font-display text-gray-900 dark:text-white">Choose Your Plan</h1>
            <p className="text-gray-700 dark:text-gray-300 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
              Select the perfect plan for your entertainment needs. All plans include access to our streaming platform and can be cancelled anytime.
            </p>
          </div>
        </AnimatedEntrance>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => {
            const duration = selectedDurations[plan.name as keyof typeof selectedDurations] || 1;
            const monthlyPrice = duration === 1 ? plan.price : plan.specialOffers[duration as keyof typeof plan.specialOffers];
            const totalPrice = monthlyPrice * duration;

            return (
              <AnimatedEntrance key={plan.name} delay={index * 0.2}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className="h-full"
                >
                  <Card className={`flex flex-col h-full border-2 min-h-[600px]  bg-background/60 ${
                    plan.name === "Basic" 
                      ? "border-primary shadow-lg relative bg-muted/50" 
                      : "hover:border-primary"
                    } transition-all`}>
                    {plan.name === "Basic" && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                          Most Popular
                        </span>
                      </div>
                    )}
                    <CardHeader className="text-center pt-8 flex-none">
                      <CardTitle className="text-2xl md:text-3xl mb-2 font-semibold text-gray-900 dark:text-white">
                        {plan.name}
                        {plan.mobileOnly && (
                          <span className="block text-sm font-normal text-muted-foreground mt-1">
                            Mobile & Tablet Only
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription className="text-base mb-4 text-gray-700 dark:text-gray-300">
                        {plan.description}
                      </CardDescription>
                      <div className="mb-4">
                        <div className="flex items-baseline justify-center">
                          <span className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">MVR {totalPrice}</span>
                        </div>
                        <div className="mt-2 flex justify-center space-x-2">
                          {[1, 3, 6].map((option) => (
                            <button
                              key={option}
                              onClick={() => handleDurationChange(plan.name, option)}
                              className={`px-3 py-1 rounded transition-colors ${
                                duration === option 
                                  ? "bg-green-500 text-white"
                                  : "bg-gray-300 text-gray-900 dark:bg-gray-700 dark:text-white hover:bg-gray-400 dark:hover:bg-gray-600"
                              }`}
                            >
                              {option} Month{option > 1 ? "s" : ""}
                            </button>
                          ))}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <ul className="space-y-4 text-sm md:text-base text-gray-700 dark:text-gray-300">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start">
                            <Check className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter className="pt-4 pb-8 flex-none">
                      <Button 
                        className="w-full h-12 text-base"
                        onClick={() => handleSubscribe(plan.name)}
                        variant={plan.name === "Basic" ? "default" : "outline"}
                        size="lg"
                      >
                        {user ? "Subscribe Now" : "Get Started"}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              </AnimatedEntrance>
            );
          })}
        </div>
      </div>
    </div>
  );
}
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useAuthContext } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import { AnimatedEntrance } from "@/components/ui/animated-entrance";
import { motion } from "framer-motion";
import { Metadata } from 'next';

const plans = [
  {
    name: "Basic",
    price: "154",
    description: "1 Month Package",
    features: [
      "Full content library access",
      "HD streaming quality",
      "Watch on 2 devices",
      "Priority support",
      "Offline downloads",
      "No ads",
      "1 month access",
    ],
  },
  {
    name: "Premium",
    price: "449",
    description: "3 Months Package",
    features: [
      "Full content library access",
      "HD streaming quality",
      "Watch on 2 devices",
      "Priority support",
      "Offline downloads",
      "No ads",
      "3 months access",
    ],
  },
  {
    name: "Family",
    price: "799",
    description: "6 Months Package",
    features: [
      "Full content library access",
      "HD streaming quality",
      "Watch on 2 devices",
      "Priority support",
      "Offline downloads",
      "No ads",
      "6 months access",
    ],
  },
];

export default function PricingPage() {
  const { user } = useAuthContext();
  const router = useRouter();

  const handleSubscribe = (planName: string) => {
    if (!user) {
      router.push("/register");
      return;
    }
    router.push(`/checkout?plan=${planName.toLowerCase()}`);
  };

  return (
    <div className="container py-8 px-4 md:py-16 md:px-8">
      <AnimatedEntrance>
        <div className="text-center mb-8 md:mb-16">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
            Select the perfect plan for your entertainment needs. All plans include access to our streaming platform and can be cancelled anytime.
          </p>
        </div>
      </AnimatedEntrance>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8 max-w-7xl mx-auto">
        {plans.map((plan, index) => (
          <AnimatedEntrance key={plan.name} delay={index * 0.2}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="h-full"
            >
              <Card className={`flex flex-col h-full border-2 min-h-[600px] ${
                plan.name === "Premium" 
                  ? "border-primary shadow-lg relative bg-muted/50" 
                  : "hover:border-primary"
                } transition-all`}>
                {plan.name === "Premium" && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader className="text-center pt-8 flex-none">
                  <CardTitle className="text-2xl md:text-3xl mb-2">{plan.name}</CardTitle>
                  <CardDescription className="text-base mb-4">{plan.description}</CardDescription>
                  <div className="mb-4">
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl md:text-5xl font-bold">MVR {plan.price}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-4 text-sm md:text-base">
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
                    variant={plan.name === "Premium" ? "default" : "outline"}
                    size="lg"
                  >
                    {user ? "Subscribe Now" : "Get Started"}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </AnimatedEntrance>
        ))}
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: 'Pricing Plans | BeeFlix',
  description: 'Choose from our flexible streaming plans. Start watching unlimited movies and TV shows with BeeFlix today.',
  openGraph: {
    title: 'BeeFlix Streaming Plans',
    description: 'Choose from our flexible streaming plans. Start watching unlimited movies and TV shows with BeeFlix today.',
  }
};
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useAuthContext } from "@/components/auth-provider";
import { useRouter } from "next/navigation";

const plans = [
  {
    name: "Basic",
    price: "15.99",
    description: "Perfect for casual viewers",
    features: [
      "Access to basic content library",
      "720p streaming quality",
      "Watch on 1 device",
      "Basic support",
    ],
  },
  {
    name: "Premium",
    price: "29.99",
    description: "Our most popular plan",
    features: [
      "Full content library access",
      "4K + HDR streaming quality",
      "Watch on up to 4 devices",
      "Priority support",
      "Offline downloads",
      "No ads",
    ],
  },
  {
    name: "Family",
    price: "49.99",
    description: "Best for families",
    features: [
      "Everything in Premium",
      "Watch on up to 6 devices",
      "Create up to 6 profiles",
      "Parental controls",
      "24/7 Premium support",
      "Family sharing features",
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
    <div className="container py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Select the perfect plan for your entertainment needs. All plans include access to our streaming platform and can be cancelled anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card key={plan.name} className="flex flex-col">
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="mb-6">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <Check className="h-4 w-4 text-primary mr-2" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => handleSubscribe(plan.name)}
                variant={plan.name === "Premium" ? "default" : "outline"}
              >
                {user ? "Subscribe Now" : "Get Started"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is BuzzPlay?",
    answer: "BuzzPlay is a streaming service that offers a wide variety of movies, TV shows, anime, documentaries, and more. With BuzzPlay, you'll have endless entertainment options right at your fingertips."
  },
  {
    question: "How much does BuzzPlay cost?",
    answer: "Enjoy BuzzPlay on your smartphone, tablet, smart TV, laptop, or streaming device for one affordable monthly fee. Plans range from MVR 149 to MVR 219, with no additional charges or contracts—pay only for the plan that fits your needs."
  },
  {
    question: "Can I set my subscription to auto-renew?",
    answer: "Currently, we don't offer an auto-renew feature. However, you can choose from flexible subscription plans, including 1-month, 3-month, or 6-month commitments, to suit your preference."
  },
  {
    question: "How do I cancel my subscription?",
    answer: "BuzzPlay is commitment-free. There are no contracts, and you can cancel anytime without fees."
  },
  {
    question: "What can I watch on BuzzPlay?",
    answer: "BuzzPlay offers an extensive library of content, including feature films, documentaries, TV shows, anime, and much more. Watch as much as you want, whenever you want."
  },
  {
    question: "Is BuzzPlay suitable for kids?",
    answer: "Yes, BuzzPlay includes family-friendly and kid-focused content. We're constantly expanding our library with titles that are appropriate for younger audiences, so there's something for everyone to enjoy."
  },
  {
    question: "What internet speed do I need for BuzzPlay?",
    answer: "To ensure a smooth streaming experience, we recommend a sustained download speed of at least 5 Mbps. You can adjust your bitrate settings within the app to help save on data usage when necessary. Our video quality automatically adjusts based on your internet speed and device, delivering the best possible stream for your connection."
  },
  {
    question: "Can I watch on multiple devices?",
    answer: "Yes! BuzzPlay offers flexible plans that allow you to stream on multiple devices simultaneously. Choose the plan that fits your household and enjoy watching on any combination of devices."
  },
  {
    question: "How can I reach customer support?",
    answer: "If you have any special requests, content recommendations, or need assistance, our support team is here to help. Contact us directly through our social media channels or Telegram for quick responses."
  }
];

export default function FAQPage() {
  return (
    <div className="container max-w-4xl py-8 px-4 md:py-12">
      <Card className="backdrop-blur-sm bg-black/40 border-zinc-800">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Frequently Asked Questions</CardTitle>
          <CardDescription>
            Find answers to common questions about BuzzPlay
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
} 
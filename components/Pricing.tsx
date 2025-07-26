"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Sparkles } from "lucide-react";

const plans = [
  {
    name: "Growing Together",
    price: "$49",
    description: "Perfect for small teams ready to grow",
    features: [
      "Up to 25 employees",
      "Core HRMS features",
      "Basic AI insights",
      "Payroll processing",
      "Email support",
    ],
    cta: "Start Free Trial",
    variant: "outline" as const,
  },
  {
    name: "Thriving Teams",
    price: "$149",
    description: "For teams serious about culture",
    features: [
      "Up to 100 employees",
      "Everything in Growing",
      "Advanced AI predictions",
      "Quarterly check-ins",
      "Priority support",
      "Custom integrations",
    ],
    cta: "Start Free Trial",
    variant: "warm" as const,
    popular: true,
  },
  {
    name: "Enterprise Heart",
    price: "Custom",
    description: "For organizations that lead with care",
    features: [
      "Unlimited employees",
      "Everything in Thriving",
      "Custom AI models",
      "Dedicated success manager",
      "SLA guarantee",
      "White-label options",
    ],
    cta: "Contact Us",
    variant: "outline" as const,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-6">
            Pricing that <span className="gradient-text">grows with you</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            No hidden fees. No per-user charges. Just simple, transparent pricing.
            Start with a 30-day free trial - no credit card required.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card 
              key={plan.name}
              className={cn(
                "card-hover relative animate-fade-in",
                plan.popular && "border-primary shadow-warm-lg"
              )}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Most Popular
                  </div>
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.price !== "Custom" && <span className="text-muted-foreground">/month</span>}
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter>
                <Button 
                  variant={plan.variant} 
                  size="lg" 
                  className="w-full"
                >
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">
            All plans include:
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              SSL encryption
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              Daily backups
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              99.9% uptime
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              GDPR compliant
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
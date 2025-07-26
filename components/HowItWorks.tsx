"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const steps = [
  {
    number: "1",
    title: "Quick & Warm Onboarding",
    description: "Import your team data or start fresh. Our AI guides you through setup in 30 minutes.",
    emoji: "🎯",
  },
  {
    number: "2",
    title: "Connect Your Payroll",
    description: "Seamlessly integrate with Paychex, Gusto, or use our built-in payroll processing.",
    emoji: "🔗",
  },
  {
    number: "3",
    title: "Watch the Magic Happen",
    description: "AI analyzes patterns, predicts trends, and suggests improvements automatically.",
    emoji: "✨",
  },
  {
    number: "4",
    title: "Grow Together",
    description: "Your team thrives with continuous support, insights, and celebration of achievements.",
    emoji: "🌱",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary rounded-full px-4 py-2 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Setup in 30 minutes</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-6">
            Getting started is <span className="gradient-text">surprisingly simple</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            No complicated implementations. No lengthy training. Just instant value for your team.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {steps.map((step, index) => (
            <div 
              key={step.number}
              className="relative animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Connection line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-primary/30 to-transparent -z-10" />
              )}
              
              <div className="text-center">
                <div className="w-16 h-16 bg-warmth-gradient rounded-full flex items-center justify-center mx-auto mb-4 shadow-warm-md">
                  <span className="text-3xl">{step.emoji}</span>
                </div>
                <h3 className="font-semibold font-display text-lg mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Interactive Demo */}
        <div className="bg-gradient-to-br from-warmth-50 via-sage-50 to-trust-50 rounded-3xl p-8 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold font-display mb-4">
                See it in action
              </h3>
              <p className="text-muted-foreground mb-6">
                Watch how Sarah from TechStartup Inc. transformed her HR processes 
                and saved 10 hours per week while making her team happier.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-1">📊</span>
                  <div>
                    <p className="font-medium">Before Scientia</p>
                    <p className="text-sm text-muted-foreground">
                      15 hours/week on admin, stressed team, missed deadlines
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-1">🎉</span>
                  <div>
                    <p className="font-medium">After Scientia</p>
                    <p className="text-sm text-muted-foreground">
                      5 hours/week on strategic work, happy team, proactive planning
                    </p>
                  </div>
                </div>
              </div>
              <Button variant="warm" size="lg" className="mt-8 group">
                Watch Sarah's Story
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
            
            <div className="bg-white/70 backdrop-blur rounded-2xl p-8 shadow-warm-lg">
              <div className="aspect-video bg-gradient-to-br from-warmth-100 to-trust-100 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-warm-md">
                    <span className="text-4xl">▶️</span>
                  </div>
                  <p className="text-sm text-muted-foreground">2-minute demo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
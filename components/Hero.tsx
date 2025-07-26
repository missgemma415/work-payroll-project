"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      </div>
      
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          {/* Trust badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 text-sm font-medium mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            <span>Trusted by 500+ growing teams</span>
          </div>
          
          {/* Main headline */}
          <h1 className="text-4xl md:text-6xl font-bold font-display mb-6 animate-fade-in animation-delay-100">
            HR Software That 
            <span className="block mt-2 gradient-text">Actually Cares</span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8 animate-fade-in animation-delay-200">
            Build a workplace where everyone thrives. The only HRMS that combines 
            powerful features with genuine warmth and AI-powered insights.
          </p>
          
          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in animation-delay-300">
            <Button size="lg" variant="warm" className="group">
              Start Your Free 30-Day Trial
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="outline">
              Watch 2-Minute Demo
            </Button>
          </div>
          
          {/* Social proof */}
          <div className="mt-12 flex flex-col items-center animate-fade-in animation-delay-400">
            <div className="flex -space-x-2 mb-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-warmth-200 to-warmth-300 border-2 border-white flex items-center justify-center"
                >
                  <span className="text-xs">😊</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              Loved by HR teams everywhere
            </p>
          </div>
        </div>
        
        {/* Hero image placeholder */}
        <div className="mt-16 relative">
          <div className="bg-gradient-to-br from-warmth-100 via-sage-100 to-trust-100 rounded-3xl p-8 shadow-warm-lg">
            <div className="aspect-video bg-white/50 backdrop-blur rounded-2xl flex items-center justify-center">
              <div className="text-center">
                <div className="mb-4">
                  <span className="text-6xl">🏡</span>
                </div>
                <p className="text-xl font-display font-semibold text-muted-foreground">
                  Where work feels like home
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
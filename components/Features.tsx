"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Heart, 
  TrendingUp, 
  Users, 
  Calendar, 
  BarChart3, 
  Sparkles,
  Shield,
  Zap
} from "lucide-react";

const features = [
  {
    title: "Team Wellness Hub",
    description: "Track mood, celebrate wins, and support your team's wellbeing",
    icon: Heart,
    color: "text-red-500",
    bgColor: "bg-red-50",
  },
  {
    title: "Growth Conversations",
    description: "Replace cold reviews with warm, continuous feedback",
    icon: TrendingUp,
    color: "text-green-500",
    bgColor: "bg-green-50",
  },
  {
    title: "Smart Scheduling",
    description: "AI-powered workforce planning that respects work-life balance",
    icon: Calendar,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
  },
  {
    title: "Payroll That Predicts",
    description: "Process today, forecast tomorrow with 95% accuracy",
    icon: BarChart3,
    color: "text-purple-500",
    bgColor: "bg-purple-50",
  },
  {
    title: "Culture Insights",
    description: "Understand your team's happiness and engagement in real-time",
    icon: Users,
    color: "text-orange-500",
    bgColor: "bg-orange-50",
  },
  {
    title: "AI Companions",
    description: "6 friendly AI helpers that make HR tasks feel effortless",
    icon: Sparkles,
    color: "text-pink-500",
    bgColor: "bg-pink-50",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-6">
            Everything you need to <span className="gradient-text">nurture your team</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Powerful features wrapped in warmth. Because great teams deserve great tools.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={feature.title} 
              className="card-hover border-2 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader>
                <div className={`w-12 h-12 ${feature.bgColor} rounded-2xl flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Trust badges */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-trust-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-trust-500" />
            </div>
            <h3 className="font-semibold mb-2">Bank-Level Security</h3>
            <p className="text-sm text-muted-foreground">
              Your data is encrypted and protected 24/7
            </p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mb-4">
              <Zap className="w-8 h-8 text-sage-500" />
            </div>
            <h3 className="font-semibold mb-2">Lightning Fast</h3>
            <p className="text-sm text-muted-foreground">
              Process payroll in 5 minutes, not hours
            </p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-community-100 rounded-full flex items-center justify-center mb-4">
              <Heart className="w-8 h-8 text-community-500" />
            </div>
            <h3 className="font-semibold mb-2">Human Support</h3>
            <p className="text-sm text-muted-foreground">
              Real people who care, available when you need them
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "HR Director",
    company: "TechFlow Inc.",
    image: "👩‍💼",
    content: "Finally, HR software that gets us. Our team engagement scores went up 40% in just 3 months. The quarterly check-ins feel like conversations, not interrogations.",
    rating: 5,
  },
  {
    name: "Marcus Rodriguez",
    role: "CEO",
    company: "GrowthLabs",
    image: "👨‍💻",
    content: "The AI predictions saved us $200K by preventing turnover. We can actually see problems before they happen. It's like having a crystal ball for our team.",
    rating: 5,
  },
  {
    name: "Emily Watson",
    role: "People Operations",
    company: "Wellness Co.",
    image: "👩‍🦰",
    content: "Switching from Gusto was scary, but Scientia made it seamless. Better features, warmer experience, and our employees actually enjoy using it!",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-6">
            Stories of <span className="gradient-text">transformation</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Real teams, real results, real happiness. Here's what happens when HR feels human again.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={testimonial.name}
              className="card-hover animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-warmth-gradient rounded-full flex items-center justify-center text-2xl shadow-warm-sm">
                    {testimonial.image}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{testimonial.name}</h3>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                  </div>
                </div>
                <div className="flex gap-1 mt-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground italic">"{testimonial.content}"</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Trust indicators */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground mb-8">Trusted by forward-thinking companies</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {["TechFlow", "GrowthLabs", "Wellness Co", "Innovate", "FutureWork"].map((company) => (
              <div key={company} className="text-xl font-display font-semibold text-muted-foreground">
                {company}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import Pricing from "@/components/Pricing";
import CTA from "@/components/CTA";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-warmth-gradient">
      <Navigation />
      
      <main className="overflow-hidden">
        {/* Hero Section */}
        <Hero />
        
        {/* Problem Statement */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-bold font-display mb-6">
                Traditional HR feels <span className="gradient-text">cold and disconnected</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Your team deserves better than spreadsheets and forms. 
                Let's bring humanity back to Human Resources.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="card-hover">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl">😔</span>
                  </div>
                  <CardTitle>The Old Way</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Annual reviews that feel like judgments. 
                    Cold metrics that miss the human story.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="card-hover">
                <CardHeader>
                  <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl">🤝</span>
                  </div>
                  <CardTitle>Our Approach</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Continuous conversations that nurture growth. 
                    Insights that celebrate your team's potential.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="card-hover">
                <CardHeader>
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl">🌱</span>
                  </div>
                  <CardTitle>The Result</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Teams that thrive. People who feel valued. 
                    A workplace that feels like home.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        {/* Features */}
        <Features />
        
        {/* How It Works */}
        <HowItWorks />
        
        {/* Pricing */}
        <Pricing />
        
        {/* Final CTA */}
        <CTA />
      </main>
      
      <Footer />
    </div>
  );
}
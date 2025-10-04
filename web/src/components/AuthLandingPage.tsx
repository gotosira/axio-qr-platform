"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { toast } from "sonner";
import Link from "next/link";
import { 
  QrCode, 
  Zap, 
  BarChart3, 
  Palette, 
  Users, 
  Shield,
  ArrowRight,
  Sparkles,
  CheckCircle
} from "lucide-react";

export default function AuthLandingPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Handle sign up
        const response = await fetch("/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          toast.success("Account created successfully! Please sign in.");
          setIsSignUp(false);
          setFormData({ email: formData.email, password: "", name: "" });
        } else {
          const error = await response.json();
          toast.error(error.error || "Failed to create account");
        }
      } else {
        // Handle sign in
        const result = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.error) {
          toast.error("Invalid email or password");
        } else {
          toast.success("Signed in successfully!");
          window.location.href = "/";
        }
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: QrCode,
      title: "Custom QR Codes",
      description: "Create beautiful QR codes with custom colors, logos, and styles"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Track scans, locations, devices, and user engagement in real-time"
    },
    {
      icon: Palette,
      title: "Brand Customization",
      description: "Add your logo, colors, and branding to match your business identity"
    },
    {
      icon: Users,
      title: "Lead Generation",
      description: "Capture leads with custom forms and grow your customer base"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Generate and download QR codes instantly with our optimized platform"
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with 99.9% uptime guarantee"
    }
  ];

  const benefits = [
    "Unlimited QR code generation",
    "Advanced analytics dashboard",
    "Custom branding options",
    "Lead capture forms",
    "Bulk operations",
    "Priority support"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Column - Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
                <Sparkles size={16} />
                Professional QR Code Platform
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Create{" "}
                <span className="text-primary">Beautiful</span>{" "}
                QR Codes for Your Business
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl lg:max-w-none">
                Generate custom QR codes with advanced analytics, lead capture, and branding options. 
                Perfect for marketing campaigns, events, and business growth.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <div className="flex items-center gap-3">
                  <CheckCircle size={20} className="text-success" />
                  <span className="text-sm">Free forever plan</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle size={20} className="text-success" />
                  <span className="text-sm">No credit card required</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle size={20} className="text-success" />
                  <span className="text-sm">Setup in 30 seconds</span>
                </div>
              </div>

              {/* Benefits List */}
              <div className="hidden lg:block">
                <h3 className="font-semibold mb-4">What you get:</h3>
                <div className="grid sm:grid-cols-2 gap-2">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle size={16} className="text-success flex-shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Auth Form */}
            <div className="flex justify-center lg:justify-end">
              <Card className="w-full max-w-md border-2 shadow-xl">
                <CardHeader className="space-y-1 pb-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold">
                      {isSignUp ? "Create Account" : "Sign In"}
                    </h2>
                    <p className="text-muted-foreground mt-2">
                      {isSignUp 
                        ? "Start creating amazing QR codes today"
                        : "Welcome back! Sign in to your account"
                      }
                    </p>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {isSignUp && (
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-2">
                          Full Name
                        </label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="Enter your full name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required={isSignUp}
                          className="h-11"
                        />
                      </div>
                    )}
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2">
                        Email Address
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="h-11"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium mb-2">
                        Password
                      </label>
                      <Input
                        id="password"
                        type="password"
                        placeholder={isSignUp ? "Create a password" : "Enter your password"}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        className="h-11"
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full h-11 text-base font-medium"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          {isSignUp ? "Creating Account..." : "Signing In..."}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {isSignUp ? "Create Account" : "Sign In"}
                          <ArrowRight size={16} />
                        </div>
                      )}
                    </Button>
                  </form>
                  
                  <div className="mt-6 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(!isSignUp);
                        setFormData({ email: "", password: "", name: "" });
                      }}
                      className="text-sm text-primary hover:underline"
                    >
                      {isSignUp 
                        ? "Already have an account? Sign in" 
                        : "Don't have an account? Sign up"
                      }
                    </button>
                  </div>
                  
                  {!isSignUp && (
                    <div className="mt-4 text-center">
                      <Link href="/auth/signup" className="text-sm text-muted-foreground hover:text-foreground">
                        Forgot your password?
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to help you create, track, and optimize your QR code campaigns
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon size={24} className="text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Business?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of businesses already using AXIO QR to drive engagement and growth
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="px-8 h-12">
                Start Free Today
              </Button>
              <span className="text-sm text-muted-foreground">
                No credit card • No setup fees • Cancel anytime
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
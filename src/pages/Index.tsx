import { ArrowRight, CheckCircle, FileText, BarChart3, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const Index = () => {
  const features = [
    {
      icon: FileText,
      title: "Smart RFQ Management",
      description: "Streamline your request-for-quote process with automated workflows and intelligent routing."
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Track performance metrics, bottlenecks, and conversion rates with comprehensive dashboards."
    },
    {
      icon: Users,
      title: "Team Collaboration", 
      description: "Enable seamless collaboration between engineering, procurement, and production teams."
    },
    {
      icon: CheckCircle,
      title: "Quality Assurance",
      description: "Built-in review processes ensure every quote meets your quality standards before delivery."
    },
    {
      icon: Zap,
      title: "Automated Workflows",
      description: "Reduce processing time with intelligent automation and approval chains."
    },
    {
      icon: BarChart3,
      title: "Performance Insights",
      description: "Gain actionable insights with detailed reporting and trend analysis."
    }
  ];

  const benefits = [
    "Reduce RFQ processing time from 14 to 7 days",
    "Increase quote accuracy by 50%",
    "Improve supplier response rate to 90%",
    "Boost win rate from 35% to 50%",
    "Ensure 100% document traceability",
    "30% faster quote turnaround time"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-blue-50/30">
      {/* Navigation Header */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">A</span>
              </div>
              <span className="text-xl font-bold text-foreground">Apillis</span>
              <Badge variant="secondary" className="ml-2">Manufacturing RFQ</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/dashboard">
                <Button variant="outline">Login</Button>
              </Link>
              <Link to="/dashboard">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Transform Your
              <span className="text-primary block">Manufacturing RFQ Process</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Streamline your Request for Quote workflow with intelligent automation, 
              real-time collaboration, and data-driven insights. Reduce processing time 
              and increase win rates with Apillis.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/dashboard">
                <Button size="lg" className="gradient-primary text-lg px-8 py-6">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/rfq/new">
                <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                  View Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Complete RFQ Management Solution
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to streamline your manufacturing quote process, 
              from intake to delivery.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="card-elevated hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Proven Results for Manufacturing Excellence
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Join leading manufacturers who have transformed their RFQ process 
                with measurable improvements in efficiency and profitability.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:pl-8">
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="text-xl">Ready to Get Started?</CardTitle>
                  <CardDescription>
                    Experience the power of streamlined RFQ management
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">50%</div>
                      <div className="text-sm text-muted-foreground">Faster Processing</div>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">90%</div>
                      <div className="text-sm text-muted-foreground">Response Rate</div>
                    </div>
                  </div>
                  <Link to="/dashboard" className="block">
                    <Button className="w-full" size="lg">
                      Start Your Free Trial
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">A</span>
              </div>
              <span className="font-semibold text-foreground">Apillis Manufacturing RFQ</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2025 Apillis. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
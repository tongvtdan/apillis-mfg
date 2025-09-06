import { ArrowRight, CheckCircle, FileText, BarChart3, Users, Zap, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user } = useAuth();
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
    <div className="min-h-screen bg-theme-background">
      {/* Navigation Header */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
                <span className="text-primary-foreground font-bold text-sm">A</span>
              </div>
              <span className="text-xl font-bold text-foreground">Apillis</span>
              <Badge variant="secondary" className="ml-2">Manufacturing Portal</Badge>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <Link to="/dashboard">
                  <Button size="lg" className="gradient-primary text-lg px-8 py-6 text-primary-foreground">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/rfq/submit">
                    <Button size="lg" className="gradient-primary text-lg px-8 py-6 text-primary-foreground">
                      Submit RFQ
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button variant="outline">
                      <LogIn className="mr-2 h-4 w-4" />
                      Login
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-gradient-to-br from-theme-background via-theme-muted to-theme-background/80">
        <div className="max-w-7xl mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Transform Your
              <span className="text-primary block">Manufacturing Operations</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Comprehensive manufacturing portal with RFQ management, workflow automation,
              real-time collaboration, and data-driven insights. Streamline your entire
              manufacturing process with Apillis.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <>
                  <Link to="/dashboard">
                    <Button size="lg" className="gradient-primary text-lg px-8 py-6 text-primary-foreground">
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/rfq/new">
                    <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                      Create New RFQ
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/rfq/submit">
                    <Button size="lg" className="gradient-primary text-lg px-8 py-6 text-primary-foreground">
                      Submit RFQ Request
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                      Sign In
                      <LogIn className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* RFQ CTA Section */}
      {!user && (
        <section className="px-4 py-16 sm:px-6 lg:px-8 bg-primary/5 border-y border-primary/20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Need a Manufacturing Quote?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Submit your requirements through our streamlined RFQ portal and get a competitive quote
              within 24 hours. No account required to get started.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">Submit Requirements</h3>
                <p className="text-sm text-muted-foreground">Upload specs, drawings, and project details</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">Expert Review</h3>
                <p className="text-sm text-muted-foreground">Our team analyzes feasibility and requirements</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">Receive Quote</h3>
                <p className="text-sm text-muted-foreground">Get detailed pricing and delivery timeline</p>
              </div>
            </div>

            <Link to="/rfq/submit">
              <Button size="lg" className="gradient-primary text-lg px-8 py-6 text-primary-foreground">
                Submit Your RFQ Request
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>

            <p className="text-sm text-muted-foreground mt-4">
              Free submission • 24-hour response • No obligation
            </p>
          </div>
        </section>
      )}

      {/* Features Grid */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Complete Manufacturing Operations Platform
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage your manufacturing operations, from RFQ management
              to production workflows and team collaboration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="card-elevated hover:shadow-lg transition-all duration-300 bg-card text-card-foreground border border-border">
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
                Join leading manufacturers who have transformed their operations
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
              <Card className="card-elevated bg-theme-card text-theme-card-foreground border border-base-300 shadow-md">
                <CardHeader>
                  <CardTitle className="text-xl">Ready to Get Started?</CardTitle>
                  <CardDescription>
                    Experience the power of our comprehensive manufacturing platform
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
                  <Link to={user ? "/dashboard" : "/auth"} className="block">
                    <Button size="lg" className="gradient-primary text-lg px-8 py-6 text-primary-foreground w-full">
                      {user ? "Go to Dashboard" : "Start Your Free Trial"}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-base-300 bg-theme-muted/30">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 rounded bg-primary flex items-center justify-center shadow-sm">
                <span className="text-primary-foreground font-bold text-xs">A</span>
              </div>
              <span className="font-semibold text-foreground">Apillis Manufacturing Portal</span>
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
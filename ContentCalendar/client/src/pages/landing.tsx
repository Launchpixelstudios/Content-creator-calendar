import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Sparkles, Download, Users, Shield } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">Content Planner</span>
          </div>
          <Button asChild data-testid="login-button">
            <a href="/api/login">Log In</a>
          </Button>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-foreground mb-6" data-testid="hero-title">
            Plan Your Content Like a Pro
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto" data-testid="hero-description">
            Streamline your content creation with our powerful calendar-based planner. 
            Perfect for solopreneurs and content creators who want to stay organized and consistent.
          </p>
          <Button size="lg" asChild className="text-lg px-8 py-3" data-testid="get-started-button">
            <a href="/api/login">Get Started Free</a>
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="text-center" data-testid="feature-calendar">
            <CardHeader>
              <Calendar className="w-12 h-12 text-primary mx-auto mb-4" />
              <CardTitle>Visual Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                See all your content at a glance with our intuitive calendar interface. 
                Plan weeks and months ahead with ease.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center" data-testid="feature-templates">
            <CardHeader>
              <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
              <CardTitle>Content Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Jump-start your content creation with pre-built templates designed 
                specifically for solopreneurs and marketers.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center" data-testid="feature-reminders">
            <CardHeader>
              <Clock className="w-12 h-12 text-primary mx-auto mb-4" />
              <CardTitle>Smart Reminders</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Never miss a deadline again. Get email reminders for upcoming 
                content so you can stay on top of your publishing schedule.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center" data-testid="feature-export">
            <CardHeader>
              <Download className="w-12 h-12 text-primary mx-auto mb-4" />
              <CardTitle>Export Options</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Export your content calendar as CSV or PDF to share with clients 
                or integrate with other tools in your workflow.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center" data-testid="feature-multi-platform">
            <CardHeader>
              <Users className="w-12 h-12 text-primary mx-auto mb-4" />
              <CardTitle>Multi-Platform</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Organize content for social media, email campaigns, and blog posts 
                all in one centralized location.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center" data-testid="feature-secure">
            <CardHeader>
              <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
              <CardTitle>Secure & Private</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Your content ideas are safe with us. Secure authentication and 
                encrypted data storage keep your plans private.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8" data-testid="pricing-title">Simple Pricing</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="relative" data-testid="free-plan">
              <CardHeader>
                <CardTitle className="text-2xl">Free</CardTitle>
                <div className="text-3xl font-bold">$0<span className="text-lg font-normal">/month</span></div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>✓ Basic calendar planning</p>
                <p>✓ Content scheduling</p>
                <p>✓ Basic templates</p>
                <p>✓ Export to CSV</p>
                <Button variant="outline" className="w-full mt-6" asChild data-testid="free-signup">
                  <a href="/api/login">Start Free</a>
                </Button>
              </CardContent>
            </Card>

            <Card className="relative border-primary" data-testid="premium-plan">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                  Popular
                </span>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">Premium</CardTitle>
                <div className="text-3xl font-bold">$9.99<span className="text-lg font-normal">/month</span></div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>✓ Everything in Free</p>
                <p>✓ Premium templates</p>
                <p>✓ Email reminders</p>
                <p>✓ PDF export</p>
                <p>✓ Priority support</p>
                <Button className="w-full mt-6" asChild data-testid="premium-signup">
                  <a href="/api/login">Start Premium</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4" data-testid="cta-title">
            Ready to Transform Your Content Strategy?
          </h2>
          <p className="text-lg text-muted-foreground mb-8" data-testid="cta-description">
            Join thousands of content creators who use our planner to stay organized and grow their audience.
          </p>
          <Button size="lg" asChild className="text-lg px-8 py-3" data-testid="final-cta">
            <a href="/api/login">Get Started Now</a>
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 Content Planner. Built for creators, by creators.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
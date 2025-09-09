import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import PayPalButton from "@/components/PayPalButton";
import { Check, Sparkles, Crown } from "lucide-react";

export default function Subscription() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPayPal, setShowPayPal] = useState(false);

  const activateSubscriptionMutation = useMutation({
    mutationFn: async (paypalOrderId: string) => {
      const response = await apiRequest("POST", "/api/subscription/activate", { paypalOrderId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Success!",
        description: "Your premium subscription has been activated!",
      });
      setShowPayPal(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to activate subscription. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Login Required</CardTitle>
            <CardDescription>Please log in to manage your subscription</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" data-testid="login-button">
              <a href="/api/login">Log In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isActive = user?.subscriptionStatus === 'active';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-semibold text-foreground" data-testid="page-title">
              Subscription Management
            </h1>
            <Button variant="outline" asChild data-testid="back-to-planner">
              <a href="/">Back to Planner</a>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Status */}
        <Card className="mb-8" data-testid="current-status">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                {isActive ? (
                  <>
                    <Crown className="w-5 h-5 mr-2 text-yellow-500" />
                    Premium Member
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2 text-blue-500" />
                    Free Plan
                  </>
                )}
              </CardTitle>
              <Badge variant={isActive ? "default" : "secondary"} data-testid="status-badge">
                {isActive ? "Active" : "Free"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {isActive 
                ? "You have access to all premium features including advanced templates, email reminders, and priority support."
                : "You're currently on the free plan. Upgrade to premium to unlock advanced features."
              }
            </p>
          </CardContent>
        </Card>

        {/* Subscription Plans */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <Card className={`relative ${!isActive ? 'border-primary' : ''}`} data-testid="free-plan">
            <CardHeader>
              <CardTitle className="text-xl">Free Plan</CardTitle>
              <div className="text-2xl font-bold">$0<span className="text-lg font-normal">/month</span></div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  <span>Basic calendar planning</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  <span>Content scheduling</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  <span>Basic templates</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  <span>CSV export</span>
                </div>
              </div>
              {!isActive && (
                <Badge variant="outline" className="mt-4">Current Plan</Badge>
              )}
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className={`relative ${isActive ? 'border-primary bg-primary/5' : ''}`} data-testid="premium-plan">
            {!isActive && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-3 py-1">
                  Recommended
                </Badge>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                Premium Plan
                {isActive && <Crown className="w-5 h-5 ml-2 text-yellow-500" />}
              </CardTitle>
              <div className="text-2xl font-bold">$9.99<span className="text-lg font-normal">/month</span></div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  <span>Everything in Free</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  <span className="font-medium">Premium templates</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  <span className="font-medium">Email reminders</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  <span className="font-medium">PDF export</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  <span className="font-medium">Priority support</span>
                </div>
              </div>

              {isActive ? (
                <Badge variant="default" className="mt-4">Current Plan</Badge>
              ) : (
                <div className="mt-6">
                  {!showPayPal ? (
                    <Button 
                      className="w-full" 
                      onClick={() => setShowPayPal(true)}
                      data-testid="upgrade-button"
                    >
                      Upgrade to Premium
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground text-center">
                        Complete your payment with PayPal:
                      </p>
                      <div className="flex justify-center">
                        <PayPalButton 
                          amount="9.99" 
                          currency="USD" 
                          intent="CAPTURE" 
                        />
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShowPayPal(false)}
                        className="w-full"
                        data-testid="cancel-payment"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Feature Comparison */}
        <Card className="mt-8" data-testid="feature-comparison">
          <CardHeader>
            <CardTitle>Feature Comparison</CardTitle>
            <CardDescription>See what's included in each plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Feature</th>
                    <th className="text-center py-2">Free</th>
                    <th className="text-center py-2">Premium</th>
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  <tr className="border-b">
                    <td className="py-2">Calendar Planning</td>
                    <td className="text-center py-2"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                    <td className="text-center py-2"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Basic Templates (3)</td>
                    <td className="text-center py-2"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                    <td className="text-center py-2"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Premium Templates (10+)</td>
                    <td className="text-center py-2">-</td>
                    <td className="text-center py-2"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Email Reminders</td>
                    <td className="text-center py-2">-</td>
                    <td className="text-center py-2"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">CSV Export</td>
                    <td className="text-center py-2"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                    <td className="text-center py-2"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="py-2">PDF Export</td>
                    <td className="text-center py-2">-</td>
                    <td className="text-center py-2"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Zap } from "lucide-react";
import { Link } from "@/i18n/routing";
import { getSession } from "@/lib/auth-session";

export default async function PricingPage() {
  const session = await getSession();

  const isAuthenticated = !!session?.user;

  return (
    <div className="flex flex-col min-h-screen py-20 px-4 max-w-6xl mx-auto">
      <div className="text-center space-y-4 mb-16">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight">Simple, Transparent Pricing</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Choose the plan that fits your needs. Upgrade anytime as your audience grows.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full">
        {/* Free Plan */}
        <Card className="flex flex-col relative overflow-hidden">
          <CardHeader>
            <CardTitle className="text-2xl">Free Tier</CardTitle>
            <CardDescription>Perfect for testing the waters</CardDescription>
            <div className="mt-4 flex items-baseline text-5xl font-black">
              $0<span className="text-xl text-muted-foreground ml-2 font-normal">/mo</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            <ul className="space-y-3">
              {[
                "Create up to 3 quizzes",
                "Create up to 3 polls",
                "Basic analytics",
                "Standard support"
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Link href={isAuthenticated ? "/dashboard/billing" : "/sign-up"} className="w-full">
              <Button variant="outline" className="w-full h-12 text-lg">
                {isAuthenticated ? "Current Plan" : "Get Started for Free"}
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Pro Plan */}
        <Card className="flex flex-col relative overflow-hidden border-primary shadow-2xl shadow-primary/20">
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-primary to-blue-500"></div>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  Pro Tier
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    Popular
                  </span>
                </CardTitle>
                <CardDescription>For creators and educators</CardDescription>
              </div>
              <Zap className="w-8 h-8 text-primary fill-primary/20" />
            </div>
            <div className="mt-4 flex items-baseline text-5xl font-black">
              $9.99<span className="text-xl text-muted-foreground ml-2 font-normal">/mo</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            <ul className="space-y-3">
              {[
                "Unlimited Quizzes & Polls",
                "Unlimited AI Quiz Generation",
                "Advanced Analytics & Export",
                "Custom Branding",
                "Priority Support"
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span className="font-medium">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Link href={isAuthenticated ? "/dashboard/billing" : "/sign-up"} className="w-full">
              <Button className="w-full h-12 text-lg">
                {isAuthenticated ? "Upgrade Now" : "Start Pro Trial"}
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

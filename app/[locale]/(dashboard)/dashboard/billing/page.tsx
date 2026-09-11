import { getSession } from "@/lib/auth-session";
import { redirect } from "@/i18n/routing";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  CreditCard,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { PolarActions } from "./components/polar-actions";
import { getPublicAppSettings } from "@/features/admin/server/settings";
import { getTranslations, getLocale } from "next-intl/server";
import { isPolarConfigured } from "@/lib/polar-config";
import {
  getPolarSettings,
  syncCheckoutWithRetry,
} from "@/lib/polar-service";
import { db } from "@/lib/db/drizzle";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

interface BillingPageProps {
  searchParams: Promise<{ checkout_id?: string }>;
}

export default async function BillingPage({ searchParams }: BillingPageProps) {
  const t = await getTranslations("Billing");
  const session = await getSession();

  const locale = await getLocale();

  if (!session?.user) {
    return redirect({ href: "/sign-in", locale });
  }

  const checkoutId = (await searchParams).checkout_id;
  const parsedCheckoutId = z.string().uuid().safeParse(checkoutId);
  if (parsedCheckoutId.success) {
    try {
      await syncCheckoutWithRetry(parsedCheckoutId.data, session.user.id);
    } catch {
      // The webhook remains the source of truth if checkout synchronization is delayed.
    }
  }

  const [[billingUser], settings, polarSettings] = await Promise.all([
    db
      .select()
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1),
    getPublicAppSettings(),
    getPolarSettings(),
  ]);
  const account = billingUser ?? session.user;
  const { plan, currentPeriodEnd } = account;
  const isPro = plan === "pro";
  const isCanceling = account.subscriptionStatus === "canceling";
  const polarAvailable = isPolarConfigured && Boolean(polarSettings.productId);

  const formattedDate = currentPeriodEnd
    ? new Date(currentPeriodEnd).toLocaleDateString()
    : null;

  const featureList = settings.subscription_features
    ? settings.subscription_features.split("\n").filter(Boolean)
    : [
        "Unlimited Quizzes & Polls",
        "Unlimited AI Generation",
        "Advanced Analytics",
        "Custom Branding",
        "Priority Support",
      ];

  const displayPrice = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: settings.subscription_currency,
  }).format(Number(settings.subscription_price_amount));
  const displayInterval =
    settings.subscription_interval === "year" ? t("perYear") : t("perMonth");

  return (
    <div className="flex flex-1 flex-col space-y-6 max-w-7xl mx-auto w-full p-4 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("title")}</h2>
          <p className="text-muted-foreground mt-1 text-sm">{t("desc")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Current Plan Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">{t("currentPlan")}</CardTitle>
              <CardDescription>
                {t("currentPlanDesc")}{" "}
                <strong className="text-foreground capitalize">{plan}</strong>{" "}
                {t("plan")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isPro ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-primary/10 text-primary rounded-lg font-medium">
                    <ShieldCheck className="w-5 h-5" />
                    {isCanceling ? t("cancelScheduled") : t("activePro")}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    {formattedDate && (
                      <div className="p-4 rounded-lg border bg-muted/30">
                        <p className="text-sm text-muted-foreground mb-1">
                          {isCanceling ? t("accessUntil") : t("nextBilling")}
                        </p>
                        <p className="font-semibold">{formattedDate}</p>
                      </div>
                    )}
                    {account.polarSubscriptionId && (
                      <div className="p-4 rounded-lg border bg-muted/30">
                        <p className="text-sm text-muted-foreground mb-1">
                          {t("paymentMethod")}
                        </p>
                        <p className="font-semibold capitalize flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-muted-foreground" />
                          Polar
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-muted-foreground">{t("upgradeToPro")}</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="bg-muted/30 pt-6">
              {isPro ? (
                polarAvailable && account.polarSubscriptionId ? (
                  <PolarActions
                    mode={isCanceling ? "reactivate" : "cancel"}
                    label={
                      isCanceling ? t("reactivate") : t("cancelSubscription")
                    }
                    locale={locale}
                    confirmation={
                      isCanceling
                        ? undefined
                        : {
                            title: t("cancelDialogTitle"),
                            description: t("cancelConfirmation"),
                            confirmLabel: t("cancelDialogConfirm"),
                            cancelLabel: t("cancelDialogDismiss"),
                            pendingLabel: t("canceling"),
                            successMessage: t("cancelSuccess"),
                          }
                    }
                  />
                ) : null
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  {!polarAvailable ? (
                    <Button
                      disabled
                      className="w-full h-11.25 gap-2 bg-muted text-muted-foreground opacity-100"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {t("suspendedText")}
                    </Button>
                  ) : (
                    <PolarActions
                      mode="checkout"
                      label={t("upgradePolar")}
                      locale={locale}
                    />
                  )}
                </div>
              )}
            </CardFooter>
          </Card>
        </div>

        {/* Feature comparison / Upsell sidebar */}
        <div className="space-y-6">
          <Card className="shadow-sm bg-muted/10">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex justify-between items-center">
                <span>{t("proFeatures")}</span>
                <span className="text-2xl font-bold text-primary">
                  {displayPrice}
                  <span className="text-sm font-normal text-muted-foreground">
                    {displayInterval}
                  </span>
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {featureList.map((feature: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

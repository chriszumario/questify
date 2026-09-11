"use client";

import { useState } from "react";
import { CreditCard, RotateCcw, XCircle } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  createPolarCheckout,
  setPolarSubscriptionCancellation,
} from "@/features/billing/server/billing-actions";

interface CancellationConfirmation {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  pendingLabel: string;
  successMessage: string;
}

interface PolarActionsProps {
  mode: "checkout" | "cancel" | "reactivate";
  label: string;
  locale: string;
  confirmation?: CancellationConfirmation;
}

export function PolarActions({
  mode,
  label,
  locale,
  confirmation,
}: PolarActionsProps) {
  const [isPending, setIsPending] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  const runAction = async () => {
    setIsPending(true);

    try {
      if (mode === "checkout") {
        const result = await createPolarCheckout(locale);
        window.location.assign(result.url);
        return;
      }

      await setPolarSubscriptionCancellation(mode === "cancel");
      if (mode === "cancel" && confirmation) {
        setIsConfirmationOpen(false);
        toast.success(confirmation.successMessage);
      }
      setIsPending(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Polar is currently unavailable.",
      );
      setIsPending(false);
    }
  };

  const Icon =
    mode === "checkout" ? CreditCard : mode === "cancel" ? XCircle : RotateCcw;

  const actionButton = (
    <Button
      type="button"
      variant={mode === "checkout" ? "default" : "outline"}
      className="h-11.25 w-full sm:w-auto"
      onClick={mode === "cancel" ? undefined : runAction}
      disabled={isPending}
    >
      {isPending ? (
        <Spinner data-icon="inline-start" />
      ) : (
        <Icon data-icon="inline-start" aria-hidden="true" />
      )}
      {label}
    </Button>
  );

  if (mode !== "cancel" || !confirmation) return actionButton;

  return (
    <AlertDialog
      open={isConfirmationOpen}
      onOpenChange={(open) => {
        if (!isPending) setIsConfirmationOpen(open);
      }}
    >
      <AlertDialogTrigger render={actionButton} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{confirmation.title}</AlertDialogTitle>
          <AlertDialogDescription>
            {confirmation.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            {confirmation.cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={(event) => {
              event.preventDefault();
              void runAction();
            }}
          >
            {isPending && <Spinner data-icon="inline-start" />}
            {isPending ? confirmation.pendingLabel : confirmation.confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

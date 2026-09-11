"use client"

import * as React from "react";
import type { QuizSummary } from "@/features/quizzes/types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Play, Edit2, Trash2, Clock, Globe, Lock, BarChart2, Link as LinkIcon, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "@/i18n/routing";
import { useTransition } from "react";
import { deleteQuiz } from "@/features/quizzes/server/actions";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { useLocale, useTranslations } from "next-intl";

// Fix: prefer-module-scope-static-value — static gradient data, move outside component
const gradients = [
  "from-pink-500 to-rose-500",
  "from-purple-500 to-indigo-500",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
];

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

export function QuizCard({ quiz }: { quiz: QuizSummary }) {
  const t = useTranslations('Quizzes.card');
  const locale = useLocale();
  const router = useRouter();
  const [isCopied, setIsCopied] = React.useState(false);
  const [isPending, startTransition] = useTransition();
  const [showDeleteAlert, setShowDeleteAlert] = React.useState(false);

  const charCodeSum = React.useMemo(
    () => quiz.id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0),
    [quiz.id]
  );
  const baseGradient = gradients[charCodeSum % gradients.length];
  const bgGradient = quiz.isPublished ? baseGradient : "from-zinc-400 to-zinc-600 dark:from-zinc-700 dark:to-zinc-900 opacity-80 mix-blend-luminosity";

  const publicQuizPath = `/${locale}/q/${quiz.id}`;

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    const url = new URL(publicQuizPath, window.location.origin).toString();
    await navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deleteQuiz(quiz.id);
    });
  };

  return (
    <>
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent className="border-border/40 bg-background/95 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteConfirmDesc', { title: quiz.title })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }} 
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? t('deleting') : t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="group overflow-hidden flex flex-col h-full hover:shadow-lg transition-all duration-300 border-border/40 hover:border-primary/20 bg-card relative">
        {/* Cover Area */}
        <div className={`h-32 w-full bg-gradient-to-br ${bgGradient} relative p-4 flex flex-col justify-between`}>
          <div className="flex justify-between items-start">
            <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-none shadow-none backdrop-blur-md">
              {quiz.isPublished ? (
                <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {t('published')}</span>
              ) : (
                <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> {t('draft')}</span>
              )}
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger render={
                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-black/10 hover:bg-black/20 text-white border-none">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              } />
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => router.push(`/dashboard/quizzes/${quiz.id}/edit`)} className="cursor-pointer">
                  <Edit2 className="mr-2 h-4 w-4" /> {t('edit')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.open(publicQuizPath, '_blank')} className="cursor-pointer">
                  <Play className="mr-2 h-4 w-4" /> {t('preview')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/dashboard/quizzes/${quiz.id}/results`)} className="cursor-pointer">
                  <BarChart2 className="mr-2 h-4 w-4" /> {t('results')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowDeleteAlert(true)} disabled={isPending} className="text-destructive focus:bg-destructive/10 cursor-pointer">
                  <Trash2 className="mr-2 h-4 w-4" /> {t('delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Content Area */}
        <CardHeader className="p-5 pb-2">
        <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
          {quiz.title}
        </h3>
      </CardHeader>
      
      <CardContent className="p-5 pt-0 flex-1">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {quiz.description || t('noDescription')}
        </p>
      </CardContent>

      {/* Footer Area */}
        <CardFooter className="p-5 pt-4 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground bg-muted/10">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5" title="Time Limit">
              <Clock className="w-3.5 h-3.5" />
              {quiz.timeLimit ? formatDuration(quiz.timeLimit) : t('noLimit')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>
              {new Date(quiz.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleCopyLink}
              className="h-6 w-6 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
              title="Copy Link"
            >
              {isCopied ? <Check className="h-3.5 w-3.5" /> : <LinkIcon className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </>
  );
}

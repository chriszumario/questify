"use client"

import * as React from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckSquare, BarChart2, MoreVertical, Edit2, Trash2, Link as LinkIcon, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "@/i18n/routing";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { deletePoll } from "@/features/polls/server/actions"
import { useTransition } from "react"

interface PollCardProps {
  id: string
  question: string
  isPublished: boolean
  createdAt: Date
  votesCount: number
}

import { useTranslations } from "next-intl"

function getGradientFromId(id: string) {
  const colors = [
    "from-rose-400 to-red-500",
    "from-blue-400 to-indigo-500",
    "from-emerald-400 to-teal-500",
    "from-amber-400 to-orange-500",
    "from-purple-400 to-fuchsia-500",
    "from-cyan-400 to-blue-500",
  ]
  const charCodeSum = id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return colors[charCodeSum % colors.length]
}

export function PollCard({
  id,
  question,
  isPublished,
  createdAt,
  votesCount,
}: PollCardProps) {
  const t = useTranslations('Polls.card')
  const gradient = isPublished ? getGradientFromId(id) : "from-zinc-400 to-zinc-600 dark:from-zinc-700 dark:to-zinc-900 opacity-80 mix-blend-luminosity"
  const [isCopied, setIsCopied] = React.useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault()
    const url = `${window.location.origin}/p/${id}`
    navigator.clipboard.writeText(url)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleDelete = () => {
    if (confirm(t('deleteConfirm'))) {
      startTransition(async () => {
        await deletePoll(id)
      })
    }
  }

  return (
    <Card className="group flex flex-col overflow-hidden bg-card/40 backdrop-blur-xl border-white/10 dark:border-white/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 relative">
      <div className={`h-24 w-full bg-gradient-to-br ${gradient} p-4 relative`}>
        <div className="absolute top-4 right-4 flex gap-2 items-center">
          <Badge variant="secondary" className="bg-background/80 backdrop-blur-md text-foreground shadow-sm">
            {isPublished ? t('published') : t('draft')}
          </Badge>
          
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-background/50 backdrop-blur-md text-foreground hover:bg-background/80">
                <MoreVertical className="h-4 w-4" />
              </Button>
            } />
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => router.push(`/dashboard/polls/${id}/edit`)} className="cursor-pointer">
                <Edit2 className="mr-2 h-4 w-4" /> {t('edit')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/dashboard/polls/${id}/results`)} className="cursor-pointer">
                <BarChart2 className="mr-2 h-4 w-4" /> {t('results')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} disabled={isPending} className="text-destructive focus:text-destructive cursor-pointer">
                <Trash2 className="mr-2 h-4 w-4" /> {t('delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="absolute bottom-4 left-4 p-2 bg-background/20 backdrop-blur-md rounded-xl">
           <CheckSquare className="h-6 w-6 text-white" />
        </div>
      </div>
      
      <CardHeader className="pb-2 flex-1">
        <h3 className="font-bold text-lg leading-tight line-clamp-2">{question}</h3>
      </CardHeader>
      
      <CardContent className="pb-4">
        <div className="flex items-center text-sm text-muted-foreground gap-4">
          <div className="flex items-center gap-1.5">
            <BarChart2 className="h-4 w-4" />
            <span>{t('votes', { count: votesCount })}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 flex justify-between items-center border-t border-border/40 bg-muted/20 px-6 py-4">
        <div className="flex items-center text-xs text-muted-foreground gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          <span>{createdAt.toLocaleDateString()}</span>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleCopyLink}
          className="h-8 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
        >
          {isCopied ? <Check className="mr-2 h-3.5 w-3.5" /> : <LinkIcon className="mr-2 h-3.5 w-3.5" />}
          {isCopied ? t('copied') : t('copyLink')}
        </Button>
      </CardFooter>
    </Card>
  )
}

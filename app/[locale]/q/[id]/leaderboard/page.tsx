import { getPublicQuizLeaderboard } from "@/features/quizzes/server/queries"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, Medal, Award, User as UserIcon, Sparkles } from "lucide-react"
import { Link } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import { getTranslations } from "next-intl/server"

export default async function LeaderboardPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const [{ id }, t] = await Promise.all([params, getTranslations("Leaderboard")])
  const leaderboard = await getPublicQuizLeaderboard(id)

  if (!leaderboard) {
    notFound()
  }
  const { quiz, attempts } = leaderboard

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 mix-blend-multiply opacity-70"></div>
      <div className="absolute bottom-0 right-1/4 w-[30rem] h-[30rem] bg-emerald-500/10 rounded-full blur-3xl -z-10 mix-blend-multiply opacity-70"></div>
      
      <header className="h-16 border-b border-border/10 flex items-center px-6 backdrop-blur-md absolute top-0 w-full z-10">
        <Link href={`/q/${id}`} className="font-black text-xl tracking-tighter flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="flex aspect-square size-6 shrink-0 items-center justify-center rounded bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="size-3.5 shrink-0" />
          </div>
          Questify
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center pt-24 pb-12 px-4 relative z-0">
        <div className="text-center mb-10 animate-in slide-in-from-top-8 duration-500">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 border border-primary/20">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-2">{t("title")}</h1>
          <p className="text-muted-foreground text-lg">{t("subtitle", { title: quiz.title })}</p>
        </div>

        <Card className="w-full max-w-2xl border-border/40 bg-card/40 backdrop-blur-xl shadow-2xl animate-in zoom-in-95 duration-700">
          <CardHeader className="border-b border-border/20 bg-muted/10 pb-4">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" /> {t("ranking")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {attempts.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                {t("empty")}
              </div>
            ) : (
              <div className="divide-y divide-border/20">
                {attempts.map((attempt, index) => {
                  const isTop3 = index < 3
                  const displayName = attempt.user ? attempt.user.name : (attempt.guestName || t("anonymous"))
                  
                  return (
                    <div 
                      key={attempt.id} 
                      className={`flex items-center justify-between p-4 transition-colors hover:bg-muted/30 ${
                        index === 0 ? "bg-primary/5" : ""
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 font-black text-lg">
                          {index === 0 ? <Medal className="w-6 h-6 text-yellow-500" /> : 
                           index === 1 ? <Medal className="w-6 h-6 text-slate-400" /> :
                           index === 2 ? <Medal className="w-6 h-6 text-amber-600" /> : 
                           <span className="text-muted-foreground">{index + 1}</span>}
                        </div>
                        <Avatar className={`h-10 w-10 border ${isTop3 ? 'border-primary/50' : 'border-border/50'}`}>
                          <AvatarImage src={attempt.user?.image || ""} alt={displayName} />
                          <AvatarFallback className={isTop3 ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}>
                            {displayName.charAt(0) || <UserIcon className="w-4 h-4" />}
                          </AvatarFallback>
                        </Avatar>
                        <span className={`font-semibold ${isTop3 ? "text-foreground" : "text-foreground/80"}`}>
                          {displayName}
                        </span>
                      </div>
                      <div className="font-black text-2xl text-primary font-mono tracking-tighter">
                        {attempt.score}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 animate-in fade-in duration-1000 delay-300">
          <Link href={`/q/${id}`}>
            <Button variant="outline" className="rounded-full px-8 shadow-sm">
              {t("playAgain")}
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}

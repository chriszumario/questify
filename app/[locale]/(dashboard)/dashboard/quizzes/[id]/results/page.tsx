import { getQuizResults } from "@/features/quizzes/server/queries";
import { requireUser } from "@/lib/auth-session";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ArrowLeft, Award, Clock } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function QuizResultsPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const user = await requireUser();

  const quiz = await getQuizResults(id, user.id);

  if (!quiz) {
    notFound();
  }

  const completions = quiz.userQuizzes || [];
  const totalPlays = completions.length;
  const averageScore = totalPlays > 0 
    ? Math.round(completions.reduce((acc, curr) => acc + (curr.score || 0), 0) / totalPlays) 
    : 0;

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto py-8 px-4 space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/quizzes">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quiz Analytics</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Performance metrics for: <span className="font-semibold text-foreground">{quiz.title}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
        <Card className="bg-card/40 backdrop-blur-xl border-white/10 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Total Plays
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-2xl">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div className="text-4xl font-black">{totalPlays}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-xl border-white/10 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-2xl">
                <Award className="h-6 w-6 text-emerald-500" />
              </div>
              <div className="text-4xl font-black">{averageScore} <span className="text-base text-muted-foreground font-normal">pts</span></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-xl border-white/10 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mt-2">
              <div className={`h-3 w-3 rounded-full ${quiz.isPublished ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-amber-500'}`}></div>
              <span className="font-semibold">{quiz.isPublished ? 'Published & Active' : 'Draft Mode'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Recent Submissions</h3>
        
        {completions.length === 0 ? (
          <div className="text-center py-12 border border-dashed rounded-3xl bg-card/10 backdrop-blur-sm">
            <Clock className="h-10 w-10 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground font-medium">No one has completed this quiz yet.</p>
          </div>
        ) : (
          <div className="bg-card/40 backdrop-blur-xl border border-white/10 shadow-lg rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/20 border-b border-border/40">
                  <tr>
                    <th className="px-6 py-4 font-medium">Player</th>
                    <th className="px-6 py-4 font-medium">Score</th>
                    <th className="px-6 py-4 font-medium">Completed At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {completions.map((completion) => (
                    <tr key={completion.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4 font-medium">
                        {completion.user?.name || "Anonymous Player"}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="font-bold border-primary/20 text-primary bg-primary/5">
                          {completion.score || 0} pts
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {completion.completedAt ? new Date(completion.completedAt).toLocaleString() : "Unknown"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

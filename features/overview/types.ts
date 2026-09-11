export interface CreatorMetrics {
  quizzes: number
  polls: number
  players: number
  averageScore: number
  totalAnswers: number
  totalCorrect: number
}

export interface CreatorChartPoint {
  date: string
  attempts: number
}

export interface CreatorActivityItem {
  id: string
  quizId: string
  guestName: string | null
  completedAt: Date | null
  startedAt: Date
  score: number | null
  quizTitle: string
  userName: string | null
  userImage: string | null
}

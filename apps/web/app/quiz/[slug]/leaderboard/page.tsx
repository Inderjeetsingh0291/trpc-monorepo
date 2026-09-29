import { QuizLeaderboardPageClient } from "./_components/quiz-leaderboard-page-client"

export default async function QuizLeaderboardPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  return <QuizLeaderboardPageClient formId={slug} />
}

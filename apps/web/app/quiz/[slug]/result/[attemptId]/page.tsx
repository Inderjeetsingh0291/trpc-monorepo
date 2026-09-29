import { QuizResultClient } from "./_components/quiz-result-client"

export default async function QuizResultPage({
  params,
}: {
  params: Promise<{ slug: string; attemptId: string }>
}) {
  const { slug, attemptId } = await params

  return <QuizResultClient formId={slug} attemptId={attemptId} />
}

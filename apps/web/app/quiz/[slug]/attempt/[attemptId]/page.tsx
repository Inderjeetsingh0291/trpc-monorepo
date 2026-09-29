import { QuizAttemptClient } from "./_components/quiz-attempt-client"

export default async function QuizAttemptPage({
  params,
}: {
  params: Promise<{ slug: string; attemptId: string }>
}) {
  const { slug, attemptId } = await params

  return <QuizAttemptClient formId={slug} attemptId={attemptId} />
}

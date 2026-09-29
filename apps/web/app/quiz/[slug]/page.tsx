import { QuizLandingClient } from "./_components/quiz-landing-client"

export default async function QuizLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  return <QuizLandingClient formId={slug} />
}

import { QuizAnalyticsClient } from "./_components/quiz-analytics-client"

export default async function QuizAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-6 px-4 lg:px-8 max-w-6xl mx-auto">
      <QuizAnalyticsClient formId={id} />
    </div>
  )
}

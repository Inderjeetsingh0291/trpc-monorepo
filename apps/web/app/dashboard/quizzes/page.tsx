import { QuizzesClient } from "./_components/quizzes-client"

export const metadata = {
  title: "My Quizzes | Form Craft",
  description: "Manage your interactive quizzes, question banks, and leaderboards.",
}

export default function QuizzesPage() {
  return (
    <div className="flex flex-col gap-6 py-4 md:py-6 px-4 lg:px-8 max-w-6xl">
      <QuizzesClient />
    </div>
  )
}

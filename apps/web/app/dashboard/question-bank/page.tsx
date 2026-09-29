import { QuestionBankClient } from "./_components/question-bank-client"

export default function QuestionBankPage() {
  return (
    <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-6 px-4 lg:px-8 max-w-6xl mx-auto">
      <QuestionBankClient />
    </div>
  )
}

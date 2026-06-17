import { QuizGame } from "@/components/quiz/QuizGame"
import { EscolaSubNav } from "@/components/escola/EscolaSubNav"

export default function EscolaQuizPage() {
  return (
    <div>
      <EscolaSubNav />
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Quiz</h1>
        <p className="text-slate-400">
          Teste seus conhecimentos de harmonia, acordes e cadências do samba e pagode.
        </p>
      </div>
      <QuizGame />
    </div>
  )
}

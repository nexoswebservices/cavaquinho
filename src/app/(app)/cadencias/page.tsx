import { TreinoCadencias } from "@/components/cadencias/TreinoCadencias"

export default function CadenciasPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Treino de Cadências</h1>
        <p className="text-slate-400">
          Escolha uma tonalidade e uma progressão para praticar os encadeamentos mais usados no samba e pagode.
        </p>
      </div>
      <TreinoCadencias />
    </div>
  )
}

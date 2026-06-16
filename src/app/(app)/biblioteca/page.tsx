import { CampoHarmonico } from "@/components/biblioteca/CampoHarmonico"

export default function BibliotecaPage() {
  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Biblioteca</h1>
        <p className="text-slate-400">Referência rápida de teoria musical para cavaquinho.</p>
      </div>

      {/* Campo Harmônico */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-1">Campo Harmônico</h2>
        <p className="text-slate-400 text-sm mb-5">
          Selecione a tonalidade para ver os 7 acordes diatônicos e suas funções.
        </p>
        <CampoHarmonico />
      </section>

      {/* Progressões Comuns */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-1">Progressões Comuns do Samba e Pagode</h2>
        <p className="text-slate-400 text-sm mb-5">
          Sequências que aparecem com frequência no repertório. Os graus são relativos à tonalidade da música.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PROGRESSOES.map((p) => (
            <div key={p.nome} className="bg-[#120d24] border border-white/5 rounded-2xl p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-white font-semibold text-sm">{p.nome}</h3>
                <span className="text-xs bg-violet-600/20 text-violet-300 border border-violet-500/20 px-2 py-0.5 rounded-full flex-shrink-0">
                  {p.tipo}
                </span>
              </div>
              <p className="text-violet-300 font-mono text-sm font-bold mb-2">{p.graus}</p>
              {p.exemplo && (
                <p className="text-slate-500 font-mono text-xs">{p.exemplo}</p>
              )}
              {p.descricao && (
                <p className="text-slate-500 text-xs mt-1">{p.descricao}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Intervalos */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-1">Intervalos e Graus</h2>
        <p className="text-slate-400 text-sm mb-5">
          Distâncias entre notas e suas funções no campo harmônico maior.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm bg-[#120d24] border border-white/5 rounded-2xl overflow-hidden">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-4 py-3 text-left text-xs text-slate-500 font-medium">Grau</th>
                <th className="px-4 py-3 text-left text-xs text-slate-500 font-medium">Nome</th>
                <th className="px-4 py-3 text-left text-xs text-slate-500 font-medium">Função</th>
                <th className="px-4 py-3 text-left text-xs text-slate-500 font-medium">Em C maior</th>
              </tr>
            </thead>
            <tbody>
              {GRAUS.map((g) => (
                <tr key={g.grau} className="border-b border-white/5 last:border-0">
                  <td className="px-4 py-2.5 font-mono text-violet-300 font-bold">{g.grau}</td>
                  <td className="px-4 py-2.5 text-white">{g.nome}</td>
                  <td className="px-4 py-2.5 text-slate-400 text-xs">{g.funcao}</td>
                  <td className="px-4 py-2.5 font-mono text-slate-300 text-xs">{g.exemplo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

const PROGRESSOES = [
  {
    nome: "I – IV – V – I",
    tipo: "Básica",
    graus: "I – IV – V7 – I",
    exemplo: "Em C: C – F – G7 – C",
    descricao: "A progressão mais usada na música popular.",
  },
  {
    nome: "ii – V – I",
    tipo: "Jazz/Samba",
    graus: "ii – V7 – I",
    exemplo: "Em C: Dm – G7 – C",
    descricao: "Base do samba e jazz. Gera tensão e resolução perfeita.",
  },
  {
    nome: "I – vi – IV – V",
    tipo: "Clássica",
    graus: "I – vi – IV – V",
    exemplo: "Em C: C – Am – F – G",
    descricao: "Usada em inúmeros clássicos do pagode.",
  },
  {
    nome: "I – V – vi – IV",
    tipo: "Pop/Pagode",
    graus: "I – V – vi – IV",
    exemplo: "Em C: C – G – Am – F",
    descricao: "Variação da anterior, muito usada no pagode moderno.",
  },
  {
    nome: "i – VII – VI – V",
    tipo: "Menor",
    graus: "i – VII – VI – V7",
    exemplo: "Em Am: Am – G – F – E7",
    descricao: "Cadência andaluza, frequente no samba mais dramático.",
  },
  {
    nome: "I – bVII – IV – I",
    tipo: "Modal",
    graus: "I – bVII – IV – I",
    exemplo: "Em C: C – Bb – F – C",
    descricao: "Empréstimo modal, muito usado em samba-rock.",
  },
  {
    nome: "Ciclo de Quintas",
    tipo: "Avançada",
    graus: "I – IV – viiº – iii – vi – ii – V – I",
    exemplo: "Em C: C – F – Bm7(5-) – Em – Am – Dm – G7 – C",
    descricao: "Sequência que percorre todas as quintas do campo harmônico.",
  },
  {
    nome: "I – I7 – IV – IVm",
    tipo: "Blues/Samba",
    graus: "I – I7 – IV – IVm – I",
    exemplo: "Em C: C – C7 – F – Fm – C",
    descricao: "Tônica dominante seguida de movimento IV – IVm muito usado no pagode.",
  },
]

const GRAUS = [
  { grau: "I", nome: "Tônica", funcao: "Repouso, chegada, home base", exemplo: "C" },
  { grau: "ii", nome: "Supertônica", funcao: "Pré-dominante, leva ao V", exemplo: "Dm" },
  { grau: "iii", nome: "Mediante", funcao: "Substituto da tônica", exemplo: "Em" },
  { grau: "IV", nome: "Subdominante", funcao: "Afastamento da tônica", exemplo: "F" },
  { grau: "V7", nome: "Dominante", funcao: "Máxima tensão, resolve no I", exemplo: "G7" },
  { grau: "vi", nome: "Superdominante", funcao: "Tônica relativa, substituto do I", exemplo: "Am" },
  { grau: "viiº", nome: "Sensível", funcao: "Tensão extrema, raramente usado sozinho", exemplo: "Bm7(5-)" },
]

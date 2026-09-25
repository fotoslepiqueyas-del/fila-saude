import { useState, useEffect } from "react"

type Screen = "home" | "triage"
type StatusLevel = "normal" | "attention" | "full"

interface Hospital {
  id: number
  name: string
  type: string
  distance: string
  status: StatusLevel
  waitMin: number
  address: string
}

const statusConfig = {
  normal: {
    label: "Fluxo Normal",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    border: "border-emerald-200",
  },
  attention: {
    label: "Atenção",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
    border: "border-amber-200",
  },
  full: {
    label: "Lotado",
    bg: "bg-rose-50",
    text: "text-rose-700",
    dot: "bg-rose-500",
    border: "border-rose-200",
  },
}

function parseBackendStatus(statusStr: string): StatusLevel {
  if (!statusStr) return "normal"
  if (statusStr.includes("Vermelho")) return "full"
  if (statusStr.includes("Amarelo")) return "attention"
  return "normal"
}

interface TriageStep {
  id: number
  question: string
  hint: string
}

const triageSteps: TriageStep[] = [
  {
    id: 1,
    question: "Você está sentindo dor no peito ou dificuldade para respirar?",
    hint: "Pressão, aperto ou falta de ar súbita",
  },
  {
    id: 2,
    question: "Seus sintomas começaram há menos de 24 horas?",
    hint: "Ou pioraram rapidamente",
  },
  {
    id: 3,
    question: "Você tem febre acima de 38,5 °C?",
    hint: "Aferida com termômetro",
  },
  {
    id: 4,
    question: "Você tem alguma condição crônica de saúde?",
    hint: "Diabetes, hipertensão, cardiopatia, etc.",
  },
]

type Recommendation = "ubs_urgent" | "ubs"

function getRecommendation(answers: ("yes" | "no")[]): Recommendation {
  const urgentFlags = [answers[0] === "yes", answers[2] === "yes"]
  return urgentFlags.some(Boolean) ? "ubs_urgent" : "ubs"
}

// Ícones SVG limpos com tamanhos fixos rigorosos para evitar distorções
function IconMapPin({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function IconSearch({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}

function IconNavigation({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 11 22 2 13 21 11 13 3 11" />
    </svg>
  )
}

function IconClock({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function IconChevronRight({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

function IconActivity({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  )
}

function IconCheck({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function IconAlertTriangle({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

function IconHospital({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 6v4" />
      <path d="M14 14h-4" />
      <path d="M14 18h-4" />
      <path d="M14 8h-4" />
      <path d="M18 12h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h2" />
      <path d="M18 22V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v18" />
    </svg>
  )
}

function MapPlaceholder() {
  return (
    <div className="relative w-full h-full bg-slate-100 overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]"></div>
      <div className="z-10 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-sm text-xs font-semibold text-slate-600 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
        Carapicuíba - SP (Tempo Real)
      </div>
    </div>
  )
}

function HomeScreen({ onTriageOpen }: { onTriageOpen: () => void }) {
  const [search, setSearch] = useState("")
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    fetch("https://app-saude2-1.onrender.com/hospitais")
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao carregar dados")
        return res.json()
      })
      .then((data) => {
        const formatted = data.map((item: any) => ({
          id: item.id,
          name: item.nome,
          type: "Pronto Atendimento / UBS",
          distance: "1.2 km",
          status: parseBackendStatus(item.status),
          waitMin: item.tempo_espera,
          address: "Carapicuíba - SP",
        }))
        setHospitals(formatted)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Erro:", err)
        setErrorMsg("Servidor a iniciar no Render...")
        setLoading(false)
      })
  }, [])

  const filtered = hospitals.filter(
    (h) =>
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.type.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-blue-600 px-5 pt-5 pb-4 text-white shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-blue-200 text-[11px] font-bold tracking-wider uppercase">
              Localização atual
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <IconMapPin className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-bold">
                Carapicuíba, São Paulo
              </span>
            </div>
          </div>
          <button
            onClick={onTriageOpen}
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 transition-all rounded-xl px-3.5 py-2 shadow-sm"
          >
            <IconActivity className="w-4 h-4 text-white" />
            <span className="text-white text-xs font-bold">Triagem</span>
          </button>
        </div>

        <div className="relative mt-2">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <IconSearch className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar unidade de saúde..."
            className="w-full bg-white rounded-2xl pl-10 pr-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none shadow-sm font-medium"
          />
        </div>
      </div>

      {/* Mapa */}
      <div className="h-36 relative flex-shrink-0 border-b border-slate-200">
        <MapPlaceholder />
      </div>

      {/* Lista Header */}
      <div className="flex items-center justify-between px-5 pt-3 pb-2">
        <p className="text-slate-800 text-xs font-bold uppercase tracking-wider">
          {loading ? "A sincronizar dados..." : `${filtered.length} unidades disponíveis`}
        </p>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="text-slate-500 text-[11px] font-semibold">Render Online</span>
        </div>
      </div>

      {errorMsg && (
        <div className="mx-4 mb-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 text-center font-medium">
          {errorMsg}
        </div>
      )}

      {/* Lista de Hospitais */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
        {filtered.map((h) => {
          const s = statusConfig[h.status]
          const isSelected = selectedId === h.id
          return (
            <div
              key={h.id}
              onClick={() => setSelectedId(isSelected ? null : h.id)}
              className={`bg-white rounded-2xl p-4 shadow-sm border transition-all cursor-pointer ${
                isSelected ? "border-blue-500 ring-2 ring-blue-500/20" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <IconHospital className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-slate-900 text-sm font-bold leading-tight truncate">
                        {h.name}
                      </h4>
                      <p className="text-slate-500 text-xs mt-0.5">{h.type}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${s.bg} ${s.text} ${s.border}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}></span>
                      {s.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mt-3 pt-2.5 border-t border-slate-100 text-xs font-semibold text-slate-600">
                    <span className="flex items-center gap-1">
                      <IconMapPin className="w-3.5 h-3.5 text-slate-400" />
                      {h.distance}
                    </span>
                    <span className="flex items-center gap-1">
                      <IconClock className="w-3.5 h-3.5 text-slate-400" />
                      ~{h.waitMin} min espera
                    </span>
                  </div>

                  {isSelected && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <p className="text-slate-400 text-xs mb-2">{h.address}</p>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(h.name + " Carapicuiba")}`, '_blank')
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                      >
                        <IconNavigation className="w-4 h-4" />
                        Ver Rota no GPS
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function TriageScreen({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<("yes" | "no")[]>([])

  const handleAnswer = (value: "yes" | "no") => {
    const newAnswers = [...answers, value]
    setAnswers(newAnswers)
    setStep(step + 1)
  }

  const restart = () => {
    setStep(0)
    setAnswers([])
  }

  const questionStep = step >= 1 && step <= triageSteps.length
  const isDone = step > triageSteps.length
  const recommendation = isDone ? getRecommendation(answers) : null
  const currentQuestion = questionStep ? triageSteps[step - 1] : null

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-blue-600 px-5 pt-5 pb-5 text-white shadow-md">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 transition-all flex items-center justify-center"
          >
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div>
            <h3 className="text-white text-base font-bold leading-tight">Triagem Rápida</h3>
            <p className="text-blue-200 text-xs">Orientação médica segura</p>
          </div>
        </div>

        {!isDone && (
          <div className="space-y-1.5 mt-4">
            <div className="flex justify-between text-blue-100 text-xs font-medium">
              <span>{step === 0 ? "Início" : `Pergunta ${step} de ${triageSteps.length}`}</span>
              <span>{Math.round((step / triageSteps.length) * 100)}%</span>
            </div>
            <div className="h-1.5 bg-blue-900/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-300"
                style={{ width: `${(step / triageSteps.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        {step === 0 && (
          <div className="flex flex-col h-full justify-between">
            <div className="space-y-5 text-center pt-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center shadow-sm">
                <IconActivity className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-slate-900 text-lg font-bold">Como você está se sentindo?</h2>
                <p className="text-slate-500 text-xs mt-1.5 leading-relaxed max-w-xs mx-auto">
                  Responda a perguntas rápidas para receber orientações adequadas para o seu atendimento em Carapicuíba.
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-left flex gap-3">
                <IconAlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 leading-relaxed">
                  Sintomas críticos indicam encaminhamento direto para unidades de pronto atendimento.
                </p>
              </div>
            </div>

            <button
              onClick={() => setStep(1)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-3.5 text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 mt-6"
            >
              Iniciar Triagem
              <IconChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {questionStep && currentQuestion && (
          <div className="flex flex-col h-full justify-between">
            <div className="space-y-6 pt-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Questão {step}</span>
                <h3 className="text-slate-900 text-base font-bold mt-1.5 leading-snug">
                  {currentQuestion.question}
                </h3>
                {currentQuestion.hint && (
                  <p className="text-slate-400 text-xs mt-2">{currentQuestion.hint}</p>
                )}
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleAnswer("yes")}
                  className="w-full bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-all rounded-2xl py-4 px-5 flex items-center justify-between group shadow-sm"
                >
                  <span className="text-slate-800 text-sm font-bold">Sim</span>
                  <div className="w-6 h-6 rounded-full border-2 border-slate-300 group-hover:border-blue-600 group-hover:bg-blue-600 text-white transition-all flex items-center justify-center">
                    <IconCheck className="w-3 h-3 text-transparent group-hover:text-white" />
                  </div>
                </button>
                <button
                  onClick={() => handleAnswer("no")}
                  className="w-full bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-all rounded-2xl py-4 px-5 flex items-center justify-between group shadow-sm"
                >
                  <span className="text-slate-800 text-sm font-bold">Não</span>
                  <div className="w-6 h-6 rounded-full border-2 border-slate-300 group-hover:border-blue-600 group-hover:bg-blue-600 text-white transition-all flex items-center justify-center">
                    <IconCheck className="w-3 h-3 text-transparent group-hover:text-white" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {isDone && recommendation && (
          <div className="flex flex-col h-full justify-between text-center pt-2">
            <div className="space-y-4">
              {recommendation === "ubs_urgent" ? (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center shadow-sm">
                    <IconAlertTriangle className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase">Urgência Moderada</span>
                    <h2 className="text-slate-900 text-lg font-bold mt-2">Procure um Pronto Atendimento</h2>
                    <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                      Com base nas suas respostas, é recomendado procurar a unidade de saúde mais próxima imediatamente.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center shadow-sm">
                    <IconHospital className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase">Atendimento de Rotina</span>
                    <h2 className="text-slate-900 text-lg font-bold mt-2">Busque a UBS mais próxima</h2>
                    <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                      Não foram detetados sinais graves. Dirija-se à Unidade Básica de Saúde para atendimento seguro.
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="space-y-3 mt-6">
              <button
                onClick={onBack}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-3.5 text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2"
              >
                <IconMapPin className="w-4 h-4" />
                Ver Unidades no Mapa
              </button>
              <button onClick={restart} className="text-slate-400 text-xs font-semibold hover:underline">
                Refazer triagem
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function BottomNav({ active, onChange }: { active: Screen; onChange: (s: Screen) => void }) {
  return (
    <div className="flex-shrink-0 bg-white border-t border-slate-200 px-4 py-2 flex justify-around">
      <button
        onClick={() => onChange("home")}
        className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all ${
          active === "home" ? "text-blue-600 font-bold" : "text-slate-400 font-medium"
        }`}
      >
        <IconMapPin className="w-5 h-5" />
        <span className="text-[10px]">Mapa</span>
      </button>
      <button
        onClick={() => onChange("triage")}
        className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all ${
          active === "triage" ? "text-blue-600 font-bold" : "text-slate-400 font-medium"
        }`}
      >
        <IconActivity className="w-5 h-5" />
        <span className="text-[10px]">Triagem</span>
      </button>
    </div>
  )
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("home")

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-slate-200 p-2 sm:p-4 font-sans">
      <div className="relative flex flex-col bg-white overflow-hidden shadow-2xl w-full max-w-[375px] h-[720px] rounded-[36px] border-4 border-slate-800">
        {/* Notch do telemóvel */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 w-32 h-6 bg-slate-800 rounded-b-2xl flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-slate-900"></div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden pt-6">
          {screen === "home" && <HomeScreen onTriageOpen={() => setScreen("triage")} />}
          {screen === "triage" && <TriageScreen onBack={() => setScreen("home")} />}
        </div>

        <BottomNav active={screen} onChange={setScreen} />
      </div>
    </div>
  )
}

// ── App shell ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<Screen>("home")

  return (
    <div
      className="w-screen h-screen flex items-center justify-center bg-[#CBD5E1] p-0 sm:p-4 overflow-hidden"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      {/* Moldura centralizada do telemóvel com as proporções exatas do protótipo */}
      <div
        className="relative flex flex-col bg-white overflow-hidden shadow-2xl"
        style={{ width: "100%", maxWidth: 375, height: "100%", maxHeight: 720, borderRadius: window.innerWidth < 640 ? 0 : 40 }}
      >
        {/* Ilha / Notch superior do telemóvel */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 w-28 h-7 bg-[#1A6FBF] rounded-b-2xl flex items-center justify-center gap-1.5 shadow-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-[#0F4A8A]/60" />
          <div className="w-10 h-1 bg-[#0F4A8A]/40 rounded-full" />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden mt-7">
          {screen === "home" && (
            <HomeScreen onTriageOpen={() => setScreen("triage")} />
          )}
          {screen === "triage" && (
            <TriageScreen onBack={() => setScreen("home")} />
          )}
        </div>

        <BottomNav active={screen} onChange={setScreen} />
      </div>
    </div>
  )
}

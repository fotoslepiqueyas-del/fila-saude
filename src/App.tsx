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
    bg: "bg-[#E8F8EF]",
    text: "text-[#27AE60]",
    dot: "bg-[#27AE60]",
    border: "border-[#27AE60]/20",
  },
  attention: {
    label: "Atenção",
    bg: "bg-[#FEF9E7]",
    text: "text-[#F39C12]",
    dot: "bg-[#F39C12]",
    border: "border-[#F39C12]/20",
  },
  full: {
    label: "Lotado",
    bg: "bg-[#FDEDEC]",
    text: "text-[#E74C3C]",
    dot: "bg-[#E74C3C]",
    border: "border-[#E74C3C]/20",
  },
}

function parseBackendStatus(statusStr: string): StatusLevel {
  if (statusStr.includes("Vermelho")) return "full"
  if (statusStr.includes("Amarelo")) return "attention"
  return "normal"
}

// ── Triage steps ──────────────────────────────────────────────────────────────
interface TriageStep {
  id: number
  question: string
  hint: string
  options: { label: string; value: "yes" | "no" }[]
}

const triageSteps: TriageStep[] = [
  {
    id: 1,
    question: "Você está sentindo dor no peito ou dificuldade para respirar?",
    hint: "Pressão, aperto ou falta de ar súbita",
    options: [
      { label: "Sim", value: "yes" },
      { label: "Não", value: "no" },
    ],
  },
  {
    id: 2,
    question: "Seus sintomas começaram há menos de 24 horas?",
    hint: "Ou pioraram rapidamente",
    options: [
      { label: "Sim", value: "yes" },
      { label: "Não", value: "no" },
    ],
  },
  {
    id: 3,
    question: "Você tem febre acima de 38,5 °C?",
    hint: "Aferida com termômetro",
    options: [
      { label: "Sim", value: "yes" },
      { label: "Não", value: "no" },
    ],
  },
  {
    id: 4,
    question: "Você tem alguma condição crônica de saúde?",
    hint: "Diabetes, hipertensão, cardiopatia, etc.",
    options: [
      { label: "Sim", value: "yes" },
      { label: "Não", value: "no" },
    ],
  },
]

type Recommendation = "ubs_urgent" | "ubs"

function getRecommendation(answers: ("yes" | "no")[]): Recommendation {
  const urgentFlags = [answers[0] === "yes", answers[2] === "yes"]
  return urgentFlags.some(Boolean) ? "ubs_urgent" : "ubs"
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function IconMapPin({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function IconSearch({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}

function IconNavigation({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="3 11 22 2 13 21 11 13 3 11" />
    </svg>
  )
}

function IconClock({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function IconChevronRight({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

function IconActivity({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  )
}

function IconCheck({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function IconAlertTriangle({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

function IconHospital({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
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
    <div className="relative w-full h-full bg-[#EEF1F5] overflow-hidden">
      <svg
        className="absolute inset-0 w-full h-full opacity-40"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="#C8CDD6"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      <div className="absolute bottom-2 right-3 text-[10px] text-[#9EA5B0] font-medium">
        Carapicuíba - SP
      </div>
    </div>
  )
}

// ── Screen: Home ──────────────────────────────────────────────────────────────
function HomeScreen({ onTriageOpen }: { onTriageOpen: () => void }) {
  const [search, setSearch] = useState("")
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    fetch("https://app-saude2-1.onrender.com/hospitais")
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao carregar dados do servidor")
        return res.json()
      })
      .then((data) => {
        const formatted = data.map((item: any) => ({
          id: item.id,
          name: item.nome,
          type: "Pronto Atendimento",
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
        setErrorMsg("Servidor a iniciar (aguarde alguns segundos)...")
        setLoading(false)
      })
  }, [])

  const filtered = hospitals.filter(
    (h) =>
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.type.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="flex flex-col h-full bg-[#F7F8FA]">
      <div className="bg-[#1A6FBF] px-5 pt-4 pb-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[#A8C8ED] text-xs font-medium tracking-wide uppercase">
              Localização atual
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <IconMapPin className="w-3.5 h-3.5 text-white" />
              <span className="text-white text-sm font-semibold">
                Carapicuíba, São Paulo
              </span>
            </div>
          </div>
          <button
            onClick={onTriageOpen}
            className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 transition-colors rounded-2xl px-3 py-2"
          >
            <IconActivity className="w-3.5 h-3.5 text-white" />
            <span className="text-white text-xs font-semibold">Triagem</span>
          </button>
        </div>

        <div className="relative mb-4">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9EA5B0]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar hospital em Carapicuíba..."
            className="w-full bg-white rounded-2xl pl-10 pr-4 py-3 text-sm text-[#1A1D23] placeholder:text-[#9EA5B0] outline-none shadow-sm font-medium"
          />
        </div>
      </div>

      <div className="h-44 relative flex-shrink-0 shadow-sm">
        <MapPlaceholder />
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#F7F8FA] to-transparent" />
      </div>

      <div className="flex items-center justify-between px-5 pt-3 pb-2">
        <p className="text-[#1A1D23] text-sm font-bold">
          {loading
            ? "A carregar do Python..."
            : `${filtered.length} unidades em tempo real`}
        </p>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#27AE60] animate-pulse" />
          <span className="text-[#5A6170] text-xs font-medium">
            Conectado ao Render
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="mx-4 mb-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 text-center font-medium">
          {errorMsg}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
        {filtered.map((h) => {
          const s = statusConfig[h.status]
          const isSelected = selectedId === h.id
          return (
            <button
              key={h.id}
              onClick={() => setSelectedId(isSelected ? null : h.id)}
              className={`w-full text-left bg-white rounded-3xl p-4 shadow-sm border transition-all duration-200 ${
                isSelected
                  ? "border-[#1A6FBF] shadow-[#1A6FBF]/10 shadow-md"
                  : "border-[#E8EAED] hover:border-[#C5D8EE] hover:shadow-md"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#EBF4FF] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <IconHospital className="w-5 h-5 text-[#1A6FBF]" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[#1A1D23] text-[15px] font-bold leading-tight truncate">
                        {h.name}
                      </p>
                      <p className="text-[#9EA5B0] text-xs mt-0.5 font-medium">
                        {h.type}
                      </p>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border flex-shrink-0 ${s.bg} ${s.border}`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                      <span className={`text-xs font-bold ${s.text}`}>
                        {s.label}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-2.5">
                    <div className="flex items-center gap-1">
                      <IconMapPin className="w-3.5 h-3.5 text-[#9EA5B0]" />
                      <span className="text-[#5A6170] text-xs font-semibold">
                        {h.distance}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <IconClock className="w-3.5 h-3.5 text-[#9EA5B0]" />
                      <span className="text-[#5A6170] text-xs font-semibold">
                        ~{h.waitMin} min de espera
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="mt-3 pt-3 border-t border-[#E8EAED]">
                      <p className="text-[#9EA5B0] text-xs mb-3">{h.address}</p>
                      <button className="w-full flex items-center justify-center gap-2 bg-[#1A6FBF] hover:bg-[#0F4A8A] transition-colors rounded-2xl py-3 px-4">
                        <IconNavigation className="w-4 h-4 text-white" />
                        <span className="text-white text-sm font-bold">
                          Ver Rota no GPS
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Screen: Triage ────────────────────────────────────────────────────────────
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
    <div className="flex flex-col h-full bg-[#F7F8FA]">
      <div className="bg-[#1A6FBF] px-5 pt-4 pb-5">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-2xl bg-white/15 hover:bg-white/25 transition-colors flex items-center justify-center"
          >
            <svg
              className="w-4 h-4 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div>
            <p className="text-white text-base font-bold leading-tight">
              Triagem Rápida
            </p>
            <p className="text-[#A8C8ED] text-xs font-medium">
              Orientação de cuidado
            </p>
          </div>
        </div>

        {!isDone && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-[#A8C8ED] text-xs font-medium">
              <span>
                {step === 0
                  ? "Início"
                  : `Pergunta ${step} de ${triageSteps.length}`}
              </span>
              <span>{Math.round((step / triageSteps.length) * 100)}%</span>
            </div>
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(step / triageSteps.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        {step === 0 && (
          <div className="flex flex-col h-full">
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-5">
              <div className="w-20 h-20 rounded-3xl bg-[#EBF4FF] flex items-center justify-center">
                <IconActivity className="w-10 h-10 text-[#1A6FBF]" />
              </div>
              <div>
                <h2 className="text-[#1A1D23] text-xl font-bold leading-tight">
                  Como você está se sentindo?
                </h2>
                <p className="text-[#5A6170] text-sm mt-2 leading-relaxed max-w-xs mx-auto">
                  Responda às perguntas para saber se deve procurar um
                  Pronto-Socorro imediatamente ou a UBS mais próxima.
                </p>
              </div>
              <div className="bg-[#FEF9E7] border border-[#F39C12]/20 rounded-2xl p-4 w-full text-left">
                <div className="flex gap-3">
                  <IconAlertTriangle className="w-5 h-5 text-[#F39C12] flex-shrink-0 mt-0.5" />
                  <p className="text-[#5A6170] text-sm leading-relaxed">
                    Sintomas indicando dor no peito ou febre alta resultarão no{" "}
                    <strong className="text-[#1A1D23]">
                      encaminhamento para uma UBS
                    </strong>{" "}
                    ao final desta triagem.
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setStep(1)}
              className="w-full bg-[#1A6FBF] hover:bg-[#0F4A8A] transition-colors rounded-2xl py-4 text-white text-base font-bold mt-6 flex items-center justify-center gap-2"
            >
              Iniciar Triagem
              <IconChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {questionStep && currentQuestion && (
          <div className="flex flex-col h-full">
            <div className="flex-1 flex flex-col justify-center gap-6">
              <div className="bg-white rounded-3xl p-6 border border-[#E8EAED] shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-[#EBF4FF] flex items-center justify-center mb-4">
                  <span className="text-[#1A6FBF] text-lg font-black">
                    {step}
                  </span>
                </div>
                <h3 className="text-[#1A1D23] text-lg font-bold leading-snug">
                  {currentQuestion.question}
                </h3>
                {currentQuestion.hint && (
                  <p className="text-[#9EA5B0] text-sm mt-2 leading-relaxed">
                    {currentQuestion.hint}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleAnswer("yes")}
                  className="w-full bg-white hover:bg-[#EBF4FF] border border-[#E8EAED] transition-all rounded-2xl py-4 px-5 flex items-center justify-between group"
                >
                  <span className="text-[#1A1D23] text-base font-semibold">
                    Sim
                  </span>
                  <div className="w-7 h-7 rounded-full border-2 border-[#E8EAED] group-hover:border-[#1A6FBF] group-hover:bg-[#1A6FBF] transition-all flex items-center justify-center">
                    <IconCheck className="w-3.5 h-3.5 text-transparent group-hover:text-white" />
                  </div>
                </button>
                <button
                  onClick={() => handleAnswer("no")}
                  className="w-full bg-white hover:bg-[#EBF4FF] border border-[#E8EAED] transition-all rounded-2xl py-4 px-5 flex items-center justify-between group"
                >
                  <span className="text-[#1A1D23] text-base font-semibold">
                    Não
                  </span>
                  <div className="w-7 h-7 rounded-full border-2 border-[#E8EAED] group-hover:border-[#1A6FBF] group-hover:bg-[#1A6FBF] transition-all flex items-center justify-center" />
                </button>
              </div>
            </div>
          </div>
        )}

        {isDone && recommendation && (
          <div className="flex flex-col h-full">
            <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center">
              {recommendation === "ubs_urgent" ? (
                <>
                  <div className="w-24 h-24 rounded-3xl bg-[#FDEDEC] flex items-center justify-center animate-bounce">
                    <IconAlertTriangle className="w-12 h-12 text-[#E74C3C]" />
                  </div>
                  <div>
                    <div className="inline-block bg-[#FDEDEC] text-[#E74C3C] text-xs font-extrabold px-3 py-1 rounded-full mb-2 uppercase tracking-wider">
                      Atenção
                    </div>
                    <h2 className="text-[#1A1D23] text-xl font-bold">
                      Encaminhe-se a uma UBS
                    </h2>
                    <p className="text-[#5A6170] text-sm mt-2 leading-relaxed max-w-xs mx-auto">
                      O seu sintoma exige avaliação médica. Por favor, dirija-se
                      imediatamente à Unidade Básica de Saúde (UBS) mais
                      próxima.
                    </p>
                  </div>
                  <button
                    onClick={onBack}
                    className="w-full bg-[#E74C3C] hover:bg-[#C0392B] transition-colors rounded-2xl py-4 text-white text-base font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#E74C3C]/30"
                  >
                    <IconMapPin className="w-5 h-5 text-white" />
                    Ver UBS Próximas no Mapa
                  </button>
                </>
              ) : (
                <>
                  <div className="w-24 h-24 rounded-3xl bg-[#E8F8EF] flex items-center justify-center shadow-sm">
                    <IconHospital className="w-12 h-12 text-[#27AE60]" />
                  </div>
                  <div>
                    <div className="inline-block bg-[#E8F8EF] text-[#27AE60] text-xs font-extrabold px-3 py-1 rounded-full mb-2 uppercase tracking-wider">
                      Atendimento Recomendado
                    </div>
                    <h2 className="text-[#1A1D23] text-xl font-bold">
                      Buscar a UBS mais perto de você
                    </h2>
                    <p className="text-[#5A6170] text-sm mt-2 leading-relaxed max-w-xs mx-auto">
                      Como não foram detetados sinais de urgência grave, procure
                      a Unidade Básica de Saúde (UBS) mais próxima para
                      atendimento de rotina com segurança.
                    </p>
                  </div>
                  <button
                    onClick={onBack}
                    className="w-full bg-[#27AE60] hover:bg-[#1E8449] transition-colors rounded-2xl py-4 text-white text-base font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#27AE60]/30"
                  >
                    <IconMapPin className="w-5 h-5 text-white" />
                    Ver UBS Próxima no Mapa
                  </button>
                </>
              )}
              <button
                onClick={restart}
                className="text-[#9EA5B0] text-sm font-medium underline"
              >
                Refazer a triagem
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Bottom nav ─────────────────────────────────────────────────────────────────
function BottomNav({
  active,
  onChange,
}: {
  active: Screen
  onChange: (s: Screen) => void
}) {
  return (
    <div className="flex-shrink-0 bg-white border-t border-[#E8EAED] px-2 pt-2 pb-4">
      <div className="flex">
        <button
          onClick={() => onChange("home")}
          className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-2xl transition-colors ${
            active === "home" ? "text-[#1A6FBF]" : "text-[#9EA5B0]"
          }`}
        >
          <IconMapPin className="w-5 h-5" />
          <span className="text-[10px] font-semibold tracking-wide">Mapa</span>
        </button>
        <button
          onClick={() => onChange("triage")}
          className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-2xl transition-colors ${
            active === "triage" ? "text-[#1A6FBF]" : "text-[#9EA5B0]"
          }`}
        >
          <IconActivity className="w-5 h-5" />
          <span className="text-[10px] font-semibold tracking-wide">
            Triagem
          </span>
        </button>
      </div>
    </div>
  )
}

// ── App shell ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<Screen>("home")

  return (
    <div
      className="size-full flex items-center justify-center bg-[#CBD5E1] p-4"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      <div
        className="relative flex flex-col bg-white overflow-hidden shadow-2xl"
        style={{ width: 375, height: 720, borderRadius: 40 }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 w-28 h-7 bg-[#1A6FBF] rounded-b-2xl flex items-center justify-center gap-1.5">
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

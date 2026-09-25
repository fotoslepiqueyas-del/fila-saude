import { useState, useEffect } from "react"

type Screen = "home" | "triage" | "profile"
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

interface Comment {
  id: string
  hospitalName: string
  userName: string
  text: string
  time: string
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

// Hospitais oficiais corrigidos conforme pedido
const officialHospitals: Hospital[] = [
  {
    id: 1,
    name: "Hospital Geral de Carapicuíba",
    type: "Hospital Estadual / Urgência",
    distance: "1.8 km",
    status: "normal",
    waitMin: 15,
    address: "Av. Gov. Mário Covas Júnior - Carapicuíba - SP",
  },
  {
    id: 2,
    name: "UPA Bruno Covas",
    type: "Unidade de Pronto Atendimento",
    distance: "2.4 km",
    status: "attention",
    waitMin: 45,
    address: "Carapicuíba - SP",
  },
  {
    id: 3,
    name: "Pronto Atendimento Cohab II",
    type: "Pronto Socorro 24h",
    distance: "3.5 km",
    status: "full",
    waitMin: 90,
    address: "Cohab II, Carapicuíba - SP",
  },
]

// Ícones SVG minimalistas
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

function IconUser({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function IconMessage({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
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

// ── HomeScreen ──────────────────────────────────────────────────────────────
function HomeScreen({ onTriageOpen }: { onTriageOpen: () => void }) {
  const [search, setSearch] = useState("")
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [hospitals, setHospitals] = useState<Hospital[]>(officialHospitals)

  useEffect(() => {
    fetch("https://app-saude2-1.onrender.com/hospitais")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: Hospital[] = data.map((item: any, idx: number) => ({
            id: item.id || idx + 1,
            name: item.nome || officialHospitals[idx % officialHospitals.length].name,
            type: idx === 0 ? "Hospital Estadual / Urgência" : "Unidade de Saúde 24h",
            distance: `${(1.2 + idx * 0.9).toFixed(1)} km`,
            status: item.status?.includes("Vermelho") ? "full" : item.status?.includes("Amarelo") ? "attention" : "normal",
            waitMin: item.tempo_espera || 20,
            address: "Carapicuíba - SP",
          }))
          setHospitals(mapped)
        }
      })
      .catch(() => {
        setHospitals(officialHospitals)
      })
  }, [])

  const filtered = hospitals.filter(
    (h) =>
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.type.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-blue-600 px-5 pt-5 pb-4 text-white shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-blue-200 text-[11px] font-bold tracking-wider uppercase">Localização atual</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <IconMapPin className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-bold">Carapicuíba, São Paulo</span>
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

      <div className="h-32 relative flex-shrink-0 border-b border-slate-200">
        <MapPlaceholder />
      </div>

      <div className="flex items-center justify-between px-5 pt-3 pb-2">
        <p className="text-slate-800 text-xs font-bold uppercase tracking-wider">
          {filtered.length} unidades oficiais
        </p>
        <span className="text-emerald-600 text-[11px] font-semibold flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Online
        </span>
      </div>

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
                      <h4 className="text-slate-900 text-sm font-bold leading-tight truncate">{h.name}</h4>
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

// ── Profile / Login & Community Comments Screen ─────────────────────────────
function ProfileScreen() {
  const [userName, setUserName] = useState(localStorage.getItem("saude_user") || "")
  const [inputName, setInputName] = useState("")
  const [selectedHospital, setSelectedHospital] = useState("Hospital Geral de Carapicuíba")
  const [commentText, setCommentText] = useState("")
  const [comments, setComments] = useState<Comment[]>(() => {
    const saved = localStorage.getItem("saude_comments")
    return saved ? JSON.parse(saved) : [
      { id: "1", hospitalName: "Hospital Geral de Carapicuíba", userName: "Mariana Costa", text: "Atendimento organizado hoje pela manhã.", time: "Há 15 min" },
      { id: "2", hospitalName: "UPA Bruno Covas", userName: "João Pedro", text: "Fila de espera um pouco cheia, mas médicos atenciosos.", time: "Há 40 min" }
    ]
  })

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputName.trim()) return
    localStorage.setItem("saude_user", inputName)
    setUserName(inputName)
    setInputName("")
  }

  const handleLogout = () => {
    localStorage.removeItem("saude_user")
    setUserName("")
  }

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim() || !userName) return

    const newComment: Comment = {
      id: Date.now().toString(),
      hospitalName: selectedHospital,
      userName: userName,
      text: commentText,
      time: "Agora mesmo",
    }

    const updated = [newComment, ...comments]
    setComments(updated)
    localStorage.setItem("saude_comments", JSON.stringify(updated))
    setCommentText("")
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-blue-600 px-5 pt-5 pb-5 text-white shadow-md">
        <h3 className="text-white text-base font-bold leading-tight flex items-center gap-2">
          <IconUser className="w-5 h-5" /> Comunidade & Relatos
        </h3>
        <p className="text-blue-200 text-xs mt-0.5">Comentários e filas em tempo real</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!userName ? (
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
              <IconUser className="w-6 h-6" />
            </div>
            <h4 className="text-slate-900 font-bold text-sm">Entrar na Comunidade</h4>
            <p className="text-slate-500 text-xs">Insira o seu nome para comentar o estado dos hospitais.</p>
            <form onSubmit={handleLogin} className="space-y-3 pt-2">
              <input
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                placeholder="Seu nome..."
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none focus:border-blue-500"
              />
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 text-xs font-bold shadow-sm transition-all">
                Entrar
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-blue-600 font-bold uppercase">Sessão ativa</p>
              <h4 className="text-slate-900 font-bold text-sm">{userName}</h4>
            </div>
            <button onClick={handleLogout} className="text-xs text-rose-600 font-semibold hover:underline bg-white px-3 py-1.5 rounded-lg shadow-sm">
              Sair
            </button>
          </div>
        )}

        {userName && (
          <form onSubmit={handleAddComment} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
            <h4 className="text-slate-900 font-bold text-xs uppercase tracking-wide">Novo Relato</h4>
            <select
              value={selectedHospital}
              onChange={(e) => setSelectedHospital(e.target.value)}
              className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none"
            >
              {officialHospitals.map((h) => (
                <option key={h.id} value={h.name}>{h.name}</option>
              ))}
            </select>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Como está o atendimento nesta unidade agora?"
              rows={3}
              className="w-full bg-slate-100 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 outline-none resize-none focus:border-blue-500"
            />
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5">
              <IconMessage className="w-4 h-4" /> Publicar Comentário
            </button>
          </form>
        )}

        <div className="space-y-2.5">
          <h4 className="text-slate-800 font-bold text-xs uppercase tracking-wide px-1">Relatos Recentes</h4>
          {comments.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-600">{c.userName}</span>
                <span className="text-[10px] text-slate-400">{c.time}</span>
              </div>
              <p className="text-xs font-semibold text-slate-700">{c.hospitalName}</p>
              <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">{c.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── TriageScreen ────────────────────────────────────────────────────────────
const triageSteps = [
  { id: 1, question: "Você está sentindo dor no peito ou dificuldade para respirar?", hint: "Pressão, aperto ou falta de ar súbita" },
  { id: 2, question: "Seus sintomas começaram há menos de 24 horas?", hint: "Ou pioraram rapidamente" },
  { id: 3, question: "Você tem febre acima de 38,5 °C?", hint: "Aferida com termômetro" },
  { id: 4, question: "Você tem alguma condição crônica de saúde?", hint: "Diabetes, hipertensão, cardiopatia, etc." },
]

function TriageScreen({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<("yes" | "no")[]>([])

  const handleAnswer = (value: "yes" | "no") => {
    setAnswers([...answers, value])
    setStep(step + 1)
  }

  const restart = () => {
    setStep(0)
    setAnswers([])
  }

  const questionStep = step >= 1 && step <= triageSteps.length
  const isDone = step > triageSteps.length
  const recommendation = isDone ? (answers[0] === "yes" || answers[2] === "yes" ? "ubs_urgent" : "ubs") : null
  const currentQuestion = questionStep ? triageSteps[step - 1] : null

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-blue-600 px-5 pt-5 pb-5 text-white shadow-md">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={onBack} className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <div>
            <h3 className="text-white text-base font-bold">Triagem Rápida</h3>
            <p className="text-blue-200 text-xs">Orientação médica segura</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        {step === 0 && (
          <div className="flex flex-col h-full justify-between">
            <div className="space-y-5 text-center pt-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
                <IconActivity className="w-8 h-8" />
              </div>
              <h2 className="text-slate-900 text-lg font-bold">Como você está se sentindo?</h2>
              <p className="text-slate-500 text-xs leading-relaxed">Responda a perguntas rápidas para receber orientações adequadas em Carapicuíba.</p>
            </div>
            <button onClick={() => setStep(1)} className="w-full bg-blue-600 text-white rounded-2xl py-3.5 text-sm font-bold shadow-md flex items-center justify-center gap-2">
              Iniciar Triagem <IconChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {questionStep && currentQuestion && (
          <div className="flex flex-col h-full justify-between">
            <div className="space-y-6 pt-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <span className="text-xs font-bold text-blue-600 uppercase">Questão {step}</span>
                <h3 className="text-slate-900 text-base font-bold mt-1.5">{currentQuestion.question}</h3>
                <p className="text-slate-400 text-xs mt-2">{currentQuestion.hint}</p>
              </div>
              <div className="space-y-3">
                <button onClick={() => handleAnswer("yes")} className="w-full bg-white hover:bg-blue-50 border border-slate-200 rounded-2xl py-4 px-5 flex items-center justify-between font-bold text-slate-800">
                  Sim
                </button>
                <button onClick={() => handleAnswer("no")} className="w-full bg-white hover:bg-blue-50 border border-slate-200 rounded-2xl py-4 px-5 flex items-center justify-between font-bold text-slate-800">
                  Não
                </button>
              </div>
            </div>
          </div>
        )}

        {isDone && recommendation && (
          <div className="flex flex-col h-full justify-between text-center pt-2">
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
                <IconActivity className="w-8 h-8" />
              </div>
              <h2 className="text-slate-900 text-lg font-bold">Recomendação Final</h2>
              <p className="text-slate-500 text-xs">
                {recommendation === "ubs_urgent" ? "Dirija-se a um Pronto Atendimento ou Hospital imediatamente." : "Procure a unidade de saúde mais próxima para atendimento regular."}
              </p>
            </div>
            <button onClick={restart} className="text-slate-400 text-xs font-semibold hover:underline">
              Refazer triagem
            </button>
            <button onClick={onBack} className="w-full bg-blue-600 text-white rounded-2xl py-3.5 text-sm font-bold shadow-md">
              Voltar ao Mapa
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── BottomNav ───────────────────────────────────────────────────────────────
function BottomNav({ active, onChange }: { active: Screen; onChange: (s: Screen) => void }) {
  return (
    <div className="flex-shrink-0 bg-white border-t border-slate-200 px-4 py-2 flex justify-around">
      <button onClick={() => onChange("home")} className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl ${active === "home" ? "text-blue-600 font-bold" : "text-slate-400"}`}>
        <IconMapPin className="w-5 h-5" />
        <span className="text-[10px]">Mapa</span>
      </button>
      <button onClick={() => onChange("triage")} className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl ${active === "triage" ? "text-blue-600 font-bold" : "text-slate-400"}`}>
        <IconActivity className="w-5 h-5" />
        <span className="text-[10px]">Triagem</span>
      </button>
      <button onClick={() => onChange("profile")} className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl ${active === "profile" ? "text-blue-600 font-bold" : "text-slate-400"}`}>
        <IconUser className="w-5 h-5" />
        <span className="text-[10px]">Comunidade</span>
      </button>
    </div>
  )
}

// ── App Shell ───────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<Screen>("home")

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-[#CBD5E1] p-0 sm:p-4 overflow-hidden" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <div className="relative flex flex-col bg-white overflow-hidden shadow-2xl w-full max-w-[375px] h-full max-h-[720px] sm:rounded-[40px] border-0 sm:border-8 border-slate-800">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 w-28 h-7 bg-[#1A6FBF] rounded-b-2xl hidden sm:flex items-center justify-center gap-1.5 shadow-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-[#0F4A8A]/60" />
          <div className="w-10 h-1 bg-[#0F4A8A]/40 rounded-full" />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden sm:pt-7">
          {screen === "home" && <HomeScreen onTriageOpen={() => setScreen("triage")} />}
          {screen === "triage" && <TriageScreen onBack={() => setScreen("home")} />}
          {screen === "profile" && <ProfileScreen />}
        </div>

        <BottomNav active={screen} onChange={setScreen} />
      </div>
    </div>
  )
}

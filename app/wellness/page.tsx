"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smile, Frown, Meh, Angry, HeartCrack, CheckCircle2, Star, ArrowLeft, ThumbsUp, ThumbsDown, PartyPopper } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const emojis = [
  { icon: <Smile className="w-12 h-12" />, label: "Happy", color: "text-green-500", bg: "bg-green-100" },
  { icon: <Frown className="w-12 h-12" />, label: "Sad", color: "text-blue-500", bg: "bg-blue-100" },
  { icon: <Meh className="w-12 h-12" />, label: "Sleepy", color: "text-purple-500", bg: "bg-purple-100" },
  { icon: <Angry className="w-12 h-12" />, label: "Angry", color: "text-red-500", bg: "bg-red-100" },
  { icon: <HeartCrack className="w-12 h-12" />, label: "Sick", color: "text-orange-500", bg: "bg-orange-100" },
];

export default function WellnessPage() {
  const [step, setStep] = useState(1);
  const [feelingLevel, setFeelingLevel] = useState(5);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Record<string, boolean | null>>({});
  const [dynamicQuestions, setDynamicQuestions] = useState<any[]>([]);
  const router = useRouter();

  // Attendance check state
  const [checkLoading, setCheckLoading] = useState(true);
  const [alreadyPresent, setAlreadyPresent] = useState(false);
  const [presentData, setPresentData] = useState<{ student_name: string; score: number | null; emoji: string | null } | null>(null);
  const [colorsLoaded, setColorsLoaded] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/colors?t=${Date.now()}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data.clock_emotions) {
          for (const key in data.clock_emotions) {
            if (EMOTIONS[Number(key)]) EMOTIONS[Number(key)].color = data.clock_emotions[key];
          }
        }
        if (data.puzzle_emotions) {
          for (const key in data.puzzle_emotions) {
            const p = PUZZLE_EMOTIONS.find(e => e.label === key);
            if (p) p.color = data.puzzle_emotions[key];
          }
        }
      })
      .finally(() => setColorsLoaded(true));
  }, []);

  useEffect(() => {
    const rollNumber = localStorage.getItem("studentRoll");
    if (!rollNumber) { router.push("/"); return; }

    const checkAttendance = async () => {
      try {
        const [attRes, qsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/check/${rollNumber}`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/wellness/questions?rollNumber=${rollNumber}`)
        ]);
        
        if (qsRes.ok) {
          const qs = await qsRes.json();
          setDynamicQuestions(qs);
          const initialQs: Record<string, boolean | null> = {};
          qs.forEach((q: any) => initialQs[q.text] = null);
          setQuestions(initialQs);
        }

        if (attRes.ok) {
          const data = await attRes.json();
          if (data.already_present) {
            setAlreadyPresent(true);
            setPresentData({ student_name: data.student_name, score: data.score, emoji: data.emoji });
          }
        }
      } catch { /* allow check-in if API fails */ }
      finally { setCheckLoading(false); }
    };
    checkAttendance();
  }, [router]);

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const submitAttendance = async () => {
    const rollNumber = localStorage.getItem("studentRoll");
    if (!rollNumber) {
      router.push("/");
      return;
    }
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wellness/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roll_number: rollNumber,
          feeling_level: feelingLevel,
          selected_emoji: selectedEmoji,
          questions: questions
        }),
      });
      router.push("/success");
    } catch (e) {
      console.error(e);
    }
  };

  // ── Loading splash ──
  if (checkLoading || !colorsLoaded) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-100 via-pink-50 to-sky-100">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          className="w-14 h-14 rounded-full border-4 border-purple-300 border-t-purple-600"
        />
      </main>
    );
  }

  // ── Already Present Screen ──
  if (alreadyPresent && presentData) {
    const moodColor = (presentData.score ?? 0) >= 8 ? "from-green-400 to-teal-500" :
      (presentData.score ?? 0) >= 5 ? "from-orange-400 to-amber-500" : "from-red-400 to-rose-500";
    const moodLabel = (presentData.score ?? 0) >= 8 ? "Great mood today!" :
      (presentData.score ?? 0) >= 5 ? "Doing okay today!" : "Needs a little care today";

    return (
      <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-violet-50 via-pink-50 to-sky-100">
        {/* Bg blobs */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-200/30 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-green-200/30 rounded-full blur-[100px]" />

        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", bounce: 0.35, duration: 0.7 }}
          className="bg-white/80 backdrop-blur-2xl border border-white/60 rounded-4xl shadow-2xl shadow-purple-200/40 p-8 w-full max-w-sm text-center relative overflow-hidden"
        >
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-green-200/20 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-purple-200/20 rounded-full blur-2xl" />

          <div className="relative z-10">
            {/* Success ring */}
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="relative mx-auto w-28 h-28 mb-6"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${moodColor} rounded-full opacity-20 blur-md`} />
              <div className={`relative w-28 h-28 rounded-full bg-gradient-to-br ${moodColor} flex items-center justify-center shadow-xl`}>
                <CheckCircle2 className="w-14 h-14 text-white" strokeWidth={2} />
              </div>
            </motion.div>

            {/* Stars */}
            <motion.div className="flex justify-center gap-1 mb-4">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.08 }}>
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                </motion.div>
              ))}
            </motion.div>

            <h2 className="text-2xl font-black text-slate-800 mb-1">
              Hey, {presentData.student_name.split(" ")[0]}! 👋
            </h2>
            <p className="text-slate-500 font-bold text-sm mb-6">
              You have already given your attendance today!
            </p>

            {/* Score card */}
            <div className={`bg-gradient-to-r ${moodColor} rounded-3xl p-5 text-white mb-6 relative overflow-hidden`}>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.2),transparent)]" />
              <div className="relative z-10">
                <div className="text-xs font-bold uppercase tracking-wider opacity-80 mb-2">Today's Check-in</div>
                <div className="text-4xl font-black mb-1">{presentData.score}/10</div>
                <div className="text-sm font-bold opacity-90">{moodLabel}</div>
                {presentData.emoji && (
                  <div className="text-xs mt-2 opacity-80 bg-white/20 inline-block px-3 py-1 rounded-full font-bold">
                    Mood: {presentData.emoji}
                  </div>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-400 font-medium mb-6">
              Come back tomorrow for your next check-in. Have a wonderful day! 🌟
            </p>

            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={() => { localStorage.removeItem("studentRoll"); router.push("/"); }}
              className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-black text-sm shadow-lg shadow-purple-300/40 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </motion.button>
          </div>
        </motion.div>
      </main>
    );
  }

  const emotion = EMOTIONS[feelingLevel] || EMOTIONS[5];

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center p-4 font-outfit overflow-hidden transition-all duration-700"
      style={{ background: `linear-gradient(135deg, ${emotion.color}22 0%, #0f0a1e 50%, ${emotion.color}11 100%)` }}
    >
      {/* Progress Bar */}
      <div className="absolute top-8 w-full max-w-md px-4 z-20">
        <div className="h-3 bg-white/40 rounded-full overflow-hidden backdrop-blur-sm border border-white/50">
          <motion.div 
            className="h-full bg-gradient-to-r from-purple-400 to-pink-500"
            initial={{ width: "25%" }}
            animate={{ width: `${(step / 4) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <Slide1 key="slide1" feelingLevel={feelingLevel} setFeelingLevel={setFeelingLevel} onNext={nextStep} />
        )}
        {step === 2 && (
          <Slide2 key="slide2" selectedEmoji={selectedEmoji} setSelectedEmoji={setSelectedEmoji} onNext={nextStep} />
        )}
        {step === 3 && (
          <Slide3 key="slide3" dynamicQuestions={dynamicQuestions} questions={questions} setQuestions={setQuestions} onNext={nextStep} />
        )}
        {step === 4 && (
          <Slide4 key="slide4" onSubmit={submitAttendance} />
        )}
      </AnimatePresence>
    </main>
  );
}


// ── Emotion data ──
const EMOTIONS: Record<number, { label: string; color: string; bg: string; grad: string; particle: string }> = {
  1:  { label: "Very Bad",    color: "#6366f1", bg: "from-indigo-900 via-slate-900 to-blue-900",  grad: "from-indigo-500 to-slate-600",   particle: "❄️" },
  2:  { label: "Sad",         color: "#818cf8", bg: "from-blue-900 via-indigo-900 to-slate-800",  grad: "from-blue-500 to-indigo-600",    particle: "💧" },
  3:  { label: "Low Energy",  color: "#a78bfa", bg: "from-violet-900 via-purple-900 to-slate-900",grad: "from-violet-500 to-purple-600",  particle: "🌧️" },
  4:  { label: "Hurt",        color: "#f472b6", bg: "from-pink-800 via-rose-900 to-fuchsia-900",  grad: "from-pink-400 to-rose-500",      particle: "🩹" },
  5:  { label: "Okay",        color: "#fb923c", bg: "from-orange-700 via-amber-800 to-yellow-800",grad: "from-orange-400 to-amber-500",   particle: "🍂" },
  6:  { label: "Calm",        color: "#34d399", bg: "from-teal-700 via-green-800 to-emerald-800", grad: "from-teal-400 to-green-500",     particle: "🌿" },
  7:  { label: "Happy",       color: "#fbbf24", bg: "from-yellow-600 via-amber-600 to-orange-600",grad: "from-yellow-400 to-amber-500",   particle: "🌟" },
  8:  { label: "Great",       color: "#60a5fa", bg: "from-sky-600 via-blue-600 to-cyan-600",      grad: "from-sky-400 to-blue-500",       particle: "⭐" },
  9:  { label: "Amazing",     color: "#a78bfa", bg: "from-violet-600 via-purple-600 to-fuchsia-600",grad:"from-violet-400 to-purple-500", particle: "✨" },
  10: { label: "Excellent",   color: "#f9a8d4", bg: "from-pink-500 via-fuchsia-500 to-violet-600",grad: "from-pink-400 to-fuchsia-500",   particle: "🎉" },
};

function scoreToAngle(score: number) {
  // 12 o'clock = 0°. Score 1 at ~6° and 10 at ~360°
  return ((score - 1) / 9) * 360;
}

function angleToScore(angle: number): number {
  let a = ((angle % 360) + 360) % 360;
  const raw = (a / 360) * 9 + 1;
  return Math.max(1, Math.min(10, Math.round(raw)));
}

function StarRating({ score }: { score: number }) {
  const stars = score / 2; // 1→0.5, 10→5
  return (
    <div className="flex items-center justify-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.min(1, Math.max(0, stars - (i - 1)));
        return (
          <motion.div key={i}
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.07, type: "spring", stiffness: 300 }}
            className="relative w-8 h-8"
          >
            <svg viewBox="0 0 24 24" className="w-8 h-8">
              <defs>
                <linearGradient id={`sg${i}`} x1="0" x2="1" y1="0" y2="0">
                  <stop offset={`${fill * 100}%`} stopColor="#f59e0b" />
                  <stop offset={`${fill * 100}%`} stopColor="#d1d5db" />
                </linearGradient>
              </defs>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                fill={`url(#sg${i})`} stroke="#f59e0b" strokeWidth="0.5" />
            </svg>
          </motion.div>
        );
      })}
    </div>
  );
}

function EmotionClock({ score, onScoreChange }: { score: number; onScoreChange: (s: number) => void }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const isDragging = useRef(false);
  const [handAngle, setHandAngle] = useState(scoreToAngle(score));

  const CX = 150, CY = 155, R = 130;

  useEffect(() => { setHandAngle(scoreToAngle(score)); }, [score]);

  function getAngleFromEvent(e: MouseEvent | TouchEvent) {
    const svg = svgRef.current;
    if (!svg) return 0;
    const rect = svg.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + (rect.height * (155 / 320));
    const clientX = "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
    const dx = clientX - cx, dy = clientY - cy;
    let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;
    return angle;
  }

  function handleStart(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    isDragging.current = true;
  }

  useEffect(() => {
    function onMove(e: MouseEvent | TouchEvent) {
      if (!isDragging.current) return;
      const a = getAngleFromEvent(e);
      setHandAngle(a);
      onScoreChange(angleToScore(a));
    }
    function onUp() { isDragging.current = false; }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [onScoreChange]);

  const isHigh = score >= 7, isLow = score <= 3;
  const emotion = EMOTIONS[score];

  // Hand tip position
  const rad = (handAngle - 90) * (Math.PI / 180);
  const handLen = 90;
  const hx = CX + handLen * Math.cos(rad);
  const hy = CY + handLen * Math.sin(rad);

  // Hour hand (fixed at 10 o'clock position for aesthetic)
  const hourRad = (-60) * (Math.PI / 180);
  const hourLen = 60;
  const hourX = CX + hourLen * Math.cos(hourRad);
  const hourY = CY + hourLen * Math.sin(hourRad);

  // Number positions
  const nums = [1,2,3,4,5,6,7,8,9,10];
  const numPositions = nums.map((n) => {
    const a = (((n - 1) / 9) * 360 - 90) * (Math.PI / 180);
    return { n, x: CX + 110 * Math.cos(a), y: CY + 110 * Math.sin(a) };
  });

  return (
    <svg ref={svgRef} viewBox="0 0 300 320" className="w-full max-w-[320px] touch-none select-none cursor-grab active:cursor-grabbing"
      onMouseDown={handleStart} onTouchStart={handleStart}>
      <defs>
        <radialGradient id="clockFace" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
          <stop offset="100%" stopColor="rgba(240,235,255,0.85)" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="softShadow">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="rgba(139,92,246,0.3)" />
        </filter>
        <filter id="handGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Floating shadow */}
      <ellipse cx={CX} cy={CY + R + 28} rx={R * 0.7} ry={14} fill="rgba(139,92,246,0.15)" />

      {/* Legs */}
      <line x1={CX - 22} y1={CY + R + 8} x2={CX - 38} y2={CY + R + 42} stroke="#c4b5fd" strokeWidth="10" strokeLinecap="round" />
      <line x1={CX + 22} y1={CY + R + 8} x2={CX + 38} y2={CY + R + 42} stroke="#c4b5fd" strokeWidth="10" strokeLinecap="round" />
      {/* Feet */}
      <ellipse cx={CX - 42} cy={CY + R + 46} rx={16} ry={8} fill="#a78bfa" />
      <ellipse cx={CX + 42} cy={CY + R + 46} rx={16} ry={8} fill="#a78bfa" />

      {/* Clock body */}
      <circle cx={CX} cy={CY} r={R} fill="url(#clockFace)" filter="url(#softShadow)" />
      <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(139,92,246,0.3)" strokeWidth="3" />
      {/* Inner ring */}
      <circle cx={CX} cy={CY} r={R - 12} fill="none" stroke="rgba(196,181,253,0.3)" strokeWidth="1.5" />

      {/* Number labels */}
      {numPositions.map(({ n, x, y }) => {
        const isActive = n === score;
        return (
          <g key={n}>
            {isActive && <circle cx={x} cy={y} r={14} fill={emotion.color} opacity={0.25} />}
            <text x={x} y={y} textAnchor="middle" dominantBaseline="central"
              fontSize={isActive ? 14 : 11}
              fontWeight={isActive ? "900" : "700"}
              fill={isActive ? emotion.color : "#94a3b8"}
              fontFamily="system-ui">{n}</text>
          </g>
        );
      })}

      {/* Tick marks */}
      {Array.from({ length: 60 }).map((_, i) => {
        const a = (i / 60) * 2 * Math.PI - Math.PI / 2;
        const isMajor = i % 6 === 0;
        const r1 = R - (isMajor ? 20 : 16), r2 = R - 8;
        return (
          <line key={i}
            x1={CX + r1 * Math.cos(a)} y1={CY + r1 * Math.sin(a)}
            x2={CX + r2 * Math.cos(a)} y2={CY + r2 * Math.sin(a)}
            stroke={isMajor ? "rgba(139,92,246,0.5)" : "rgba(196,181,253,0.2)"}
            strokeWidth={isMajor ? 2.5 : 1} strokeLinecap="round" />
        );
      })}

      {/* Score arc */}
      {(() => {
        const sweepAngle = (handAngle / 360) * 2 * Math.PI;
        const arcR = R - 8;
        const startX = CX, startY = CY - arcR;
        const endX = CX + arcR * Math.sin(sweepAngle);
        const endY = CY - arcR * Math.cos(sweepAngle);
        const large = sweepAngle > Math.PI ? 1 : 0;
        return (
          <path d={`M ${startX} ${startY} A ${arcR} ${arcR} 0 ${large} 1 ${endX} ${endY}`}
            fill="none" stroke={emotion.color} strokeWidth="4" strokeLinecap="round" opacity="0.6" />
        );
      })()}

      {/* Clock face expressions */}
      {/* Eyes */}
      {isLow ? (
        <>
          <ellipse cx={CX - 28} cy={CY - 22} rx={9} ry={6} fill="#334155" />
          <ellipse cx={CX + 28} cy={CY - 22} rx={9} ry={6} fill="#334155" />
          {/* Tears */}
          <ellipse cx={CX - 28} cy={CY - 10} rx={3} ry={5} fill="#93c5fd" opacity={0.7} />
          <ellipse cx={CX + 28} cy={CY - 10} rx={3} ry={5} fill="#93c5fd" opacity={0.7} />
        </>
      ) : isHigh ? (
        <>
          {/* Happy squint eyes */}
          <path d={`M ${CX - 38} ${CY - 18} Q ${CX - 28} ${CY - 30} ${CX - 18} ${CY - 18}`} fill="none" stroke="#334155" strokeWidth="5" strokeLinecap="round" />
          <path d={`M ${CX + 18} ${CY - 18} Q ${CX + 28} ${CY - 30} ${CX + 38} ${CY - 18}`} fill="none" stroke="#334155" strokeWidth="5" strokeLinecap="round" />
          {/* Sparkles */}
          <text x={CX - 55} y={CY - 45} fontSize="18" filter="url(#glow)">✦</text>
          <text x={CX + 40} y={CY - 50} fontSize="14" filter="url(#glow)">✦</text>
        </>
      ) : (
        <>
          <ellipse cx={CX - 28} cy={CY - 22} rx={9} ry={9} fill="#334155" />
          <ellipse cx={CX + 28} cy={CY - 22} rx={9} ry={9} fill="#334155" />
          <ellipse cx={CX - 25} cy={CY - 25} rx={3} ry={3} fill="white" />
          <ellipse cx={CX + 25} cy={CY - 25} rx={3} ry={3} fill="white" />
        </>
      )}

      {/* Mouth */}
      {isLow ? (
        <path d={`M ${CX - 22} ${CY + 22} Q ${CX} ${CY + 10} ${CX + 22} ${CY + 22}`}
          fill="none" stroke="#334155" strokeWidth="5" strokeLinecap="round" />
      ) : isHigh ? (
        <path d={`M ${CX - 28} ${CY + 10} Q ${CX} ${CY + 40} ${CX + 28} ${CY + 10}`}
          fill={emotion.color} stroke="#334155" strokeWidth="3" strokeLinecap="round" />
      ) : (
        <path d={`M ${CX - 20} ${CY + 18} Q ${CX} ${CY + 28} ${CX + 20} ${CY + 18}`}
          fill="none" stroke="#334155" strokeWidth="5" strokeLinecap="round" />
      )}

      {/* Score label inside */}
      <text x={CX} y={CY + 55} textAnchor="middle" fontSize="13" fontWeight="800"
        fill={emotion.color} fontFamily="system-ui">{emotion.label}</text>

      {/* Hour hand (decorative) */}
      <line x1={CX} y1={CY} x2={hourX} y2={hourY}
        stroke="#94a3b8" strokeWidth="7" strokeLinecap="round" />

      {/* Minute hand (interactive) */}
      <line x1={CX} y1={CY} x2={hx} y2={hy}
        stroke={emotion.color} strokeWidth="5" strokeLinecap="round" filter="url(#handGlow)" />
      <circle cx={hx} cy={hy} r={9} fill={emotion.color} filter="url(#glow)" />
      <circle cx={hx} cy={hy} r={5} fill="white" />

      {/* Center cap */}
      <circle cx={CX} cy={CY} r={12} fill={emotion.color} />
      <circle cx={CX} cy={CY} r={6} fill="white" />

      {/* Hat */}
      <rect x={CX - 30} y={CY - R - 36} width={60} height={28} rx={5} fill="#4c1d95" />
      <rect x={CX - 44} y={CY - R - 8} width={88} height={10} rx={5} fill="#5b21b6" />
      {/* Hat band */}
      <rect x={CX - 30} y={CY - R - 16} width={60} height={8} fill={emotion.color} rx={2} />
      {/* Hat star */}
      <text x={CX} y={CY - R - 18} textAnchor="middle" fontSize="14" filter="url(#glow)">✦</text>
    </svg>
  );
}

function Slide1({ feelingLevel, setFeelingLevel, onNext }: any) {
  const emotion = EMOTIONS[feelingLevel];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85, y: -30 }}
      transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
      className="w-full max-w-sm mx-auto flex flex-col items-center gap-5 relative"
    >
      {/* Dynamic background glow — pure CSS transition, no Framer */}
      <div
        className="absolute inset-0 pointer-events-none -z-10 blur-3xl transition-colors duration-700"
        style={{ backgroundColor: `${emotion.color}22` }}
      />

      {/* Heading */}
      <motion.div className="text-center space-y-1" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1
          className="text-3xl font-black tracking-tight transition-colors duration-300"
          style={{ color: emotion.color }}
        >
          How Are You Feeling?
        </h1>
        <p className="text-white/70 font-bold text-sm">
          Drag the clock hand to show your mood (1–10)
        </p>
      </motion.div>

      {/* Emotion Clock */}
      <motion.div
        className="w-full flex justify-center"
        animate={feelingLevel >= 7 ? { y: [0, -6, 0] } : {}}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <EmotionClock score={feelingLevel} onScoreChange={setFeelingLevel} />
      </motion.div>

      {/* Score badge */}
      <motion.div
        key={feelingLevel}
        initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="flex items-center gap-3 px-6 py-3 rounded-full backdrop-blur-md border border-white/20 bg-white/10 shadow-xl"
      >
        <motion.span
          className="text-4xl font-black"
          style={{ color: emotion.color, textShadow: `0 0 20px ${emotion.color}88` }}
        >
          {feelingLevel}
        </motion.span>
        <div>
          <div className="text-white font-black text-base leading-none">{emotion.label}</div>
          <div className="text-white/60 text-xs font-bold">out of 10</div>
        </div>
      </motion.div>

      {/* Star rating */}
      <StarRating score={feelingLevel} />

      {/* Particles for high mood */}
      <AnimatePresence>
        {feelingLevel >= 7 && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none overflow-hidden"
          >
            {[...Array(6)].map((_, i) => (
              <motion.div key={i}
                className="absolute text-xl"
                initial={{ x: `${Math.random() * 100}%`, y: "110%", opacity: 0 }}
                animate={{ y: "-10%", opacity: [0, 1, 0] }}
                transition={{ duration: 2 + Math.random() * 2, delay: i * 0.4, repeat: Infinity }}
              >
                {emotion.particle}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Continue button */}
      <motion.button
        whileHover={{ scale: 1.04, y: -3 }} whileTap={{ scale: 0.96 }}
        onClick={onNext}
        className="w-full py-4 rounded-2xl font-black text-base text-white shadow-2xl relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${emotion.color}, ${emotion.color}bb)`, boxShadow: `0 8px 32px ${emotion.color}55` }}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          Continue Check-In
          <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1, repeat: Infinity }}>→</motion.span>
        </span>
      </motion.button>
    </motion.div>
  );
}


// ── Puzzle Emotion Data ──
const PUZZLE_EMOTIONS = [
  { label: "Happy",   color: "#22c55e", bg: "from-green-400 to-emerald-500",  emoji: "😊", glow: "rgba(34,197,94,0.4)" },
  { label: "Sad",     color: "#3b82f6", bg: "from-blue-400 to-indigo-500",    emoji: "😢", glow: "rgba(59,130,246,0.4)" },
  { label: "Mad",     color: "#ef4444", bg: "from-red-400 to-rose-500",       emoji: "😡", glow: "rgba(239,68,68,0.4)" },
  { label: "Scared",  color: "#334155", bg: "from-slate-600 to-slate-800",    emoji: "😨", glow: "rgba(51,65,85,0.4)" },
  { label: "Worried", color: "#eab308", bg: "from-yellow-400 to-amber-500",   emoji: "😟", glow: "rgba(234,179,8,0.4)" },
  { label: "Excited", color: "#ec4899", bg: "from-pink-400 to-fuchsia-500",   emoji: "🤩", glow: "rgba(236,72,153,0.4)" },
];

function PuzzleBulb({ emotion }: { emotion: typeof PUZZLE_EMOTIONS[0] | null }) {
  const fill = emotion ? emotion.color : "rgba(255,255,255,0.08)";
  const glowColor = emotion ? emotion.glow : "rgba(139,92,246,0.1)";

  return (
    <motion.svg
      viewBox="0 0 260 340"
      className="w-52 h-64 sm:w-60 sm:h-72"
      animate={emotion ? { y: [0, -6, 0] } : {}}
      transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
    >
      <defs>
        <filter id="bulbGlow">
          <feGaussianBlur stdDeviation="8" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="innerGlow">
          <feGaussianBlur stdDeviation="12" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <radialGradient id="bulbFill" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor={emotion ? `${fill}` : "rgba(255,255,255,0.15)"} />
          <stop offset="100%" stopColor={emotion ? `${fill}88` : "rgba(255,255,255,0.03)"} />
        </radialGradient>
        <clipPath id="bulbClip">
          <path d="M130 20 C60 20 20 80 20 140 C20 190 55 225 75 250 L80 260 C82 268 88 275 95 275 L165 275 C172 275 178 268 180 260 L185 250 C205 225 240 190 240 140 C240 80 200 20 130 20Z" />
        </clipPath>
      </defs>

      {/* Outer glow */}
      <ellipse cx={130} cy={140} rx={120} ry={130} fill={glowColor} filter="url(#innerGlow)" opacity={emotion ? 0.5 : 0.15} />

      {/* Bulb body */}
      <path d="M130 20 C60 20 20 80 20 140 C20 190 55 225 75 250 L80 260 C82 268 88 275 95 275 L165 275 C172 275 178 268 180 260 L185 250 C205 225 240 190 240 140 C240 80 200 20 130 20Z"
        fill="url(#bulbFill)" stroke="rgba(255,255,255,0.3)" strokeWidth="2" filter="url(#bulbGlow)" />

      {/* Puzzle pieces inside the bulb — real jigsaw tabs */}
      <g clipPath="url(#bulbClip)">
        {/* Piece 1 — top left (tab right, tab bottom) */}
        <motion.path d="M20 30 L120 30 L120 75 C120 75 105 75 105 90 C105 105 120 105 120 105 L120 130 L75 130 C75 130 75 115 60 115 C45 115 45 130 45 130 L20 130Z"
          fill={fill} stroke="rgba(255,255,255,0.35)" strokeWidth="2"
          initial={{ opacity: 0 }} animate={{ opacity: emotion ? 1 : 0.1 }}
          transition={{ duration: 0.5, delay: 0.0 }} />

        {/* Piece 2 — top right (socket left, tab bottom) */}
        <motion.path d="M120 30 L240 30 L240 130 L205 130 C205 130 205 115 190 115 C175 115 175 130 175 130 L120 130 L120 105 C120 105 135 105 135 90 C135 75 120 75 120 75Z"
          fill={fill} stroke="rgba(255,255,255,0.35)" strokeWidth="2"
          initial={{ opacity: 0 }} animate={{ opacity: emotion ? 1 : 0.1 }}
          transition={{ duration: 0.5, delay: 0.12 }} />

        {/* Piece 3 — middle left (socket top, tab right, tab bottom) */}
        <motion.path d="M20 130 L45 130 C45 130 45 145 60 145 C75 145 75 130 75 130 L120 130 L120 175 C120 175 105 175 105 190 C105 205 120 205 120 205 L120 235 L75 235 C75 235 75 220 60 220 C45 220 45 235 45 235 L20 235Z"
          fill={fill} stroke="rgba(255,255,255,0.35)" strokeWidth="2"
          initial={{ opacity: 0 }} animate={{ opacity: emotion ? 1 : 0.1 }}
          transition={{ duration: 0.5, delay: 0.24 }} />

        {/* Piece 4 — middle right (socket top, socket left, tab bottom) */}
        <motion.path d="M120 130 L175 130 C175 130 175 145 190 145 C205 145 205 130 205 130 L240 130 L240 235 L205 235 C205 235 205 220 190 220 C175 220 175 235 175 235 L120 235 L120 205 C120 205 135 205 135 190 C135 175 120 175 120 175Z"
          fill={fill} stroke="rgba(255,255,255,0.35)" strokeWidth="2"
          initial={{ opacity: 0 }} animate={{ opacity: emotion ? 1 : 0.1 }}
          transition={{ duration: 0.5, delay: 0.36 }} />

        {/* Piece 5 — bottom (socket top left, socket top right) */}
        <motion.path d="M20 235 L45 235 C45 235 45 250 60 250 C75 250 75 235 75 235 L120 235 L175 235 C175 235 175 250 190 250 C205 250 205 235 205 235 L240 235 L240 290 L20 290Z"
          fill={fill} stroke="rgba(255,255,255,0.35)" strokeWidth="2"
          initial={{ opacity: 0 }} animate={{ opacity: emotion ? 1 : 0.1 }}
          transition={{ duration: 0.5, delay: 0.48 }} />
      </g>

      {/* Bulb outline re-draw for crispness */}
      <path d="M130 20 C60 20 20 80 20 140 C20 190 55 225 75 250 L80 260 C82 268 88 275 95 275 L165 275 C172 275 178 268 180 260 L185 250 C205 225 240 190 240 140 C240 80 200 20 130 20Z"
        fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2.5" />

      {/* Bulb base / screw */}
      <rect x={90} y={275} width={80} height={10} rx={3} fill="rgba(196,181,253,0.6)" stroke="rgba(255,255,255,0.2)" />
      <rect x={95} y={285} width={70} height={8} rx={3} fill="rgba(167,139,250,0.5)" />
      <rect x={100} y={293} width={60} height={8} rx={3} fill="rgba(139,92,246,0.4)" />
      <rect x={108} y={301} width={44} height={10} rx={5} fill="rgba(124,58,237,0.3)" />

      {/* Face expressions */}
      {emotion ? (
        emotion.label === "Happy" || emotion.label === "Excited" ? (
          <>
            <path d={`M 105 125 Q 115 115 125 125`} fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" opacity={0.9} />
            <path d={`M 135 125 Q 145 115 155 125`} fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" opacity={0.9} />
            <path d={`M 105 155 Q 130 180 155 155`} fill="rgba(255,255,255,0.3)" stroke="white" strokeWidth="3" strokeLinecap="round" />
          </>
        ) : emotion.label === "Sad" ? (
          <>
            <ellipse cx={115} cy={120} rx={7} ry={8} fill="white" opacity={0.8} />
            <ellipse cx={145} cy={120} rx={7} ry={8} fill="white" opacity={0.8} />
            <ellipse cx={115} cy={135} rx={3} ry={5} fill="rgba(147,197,253,0.8)" />
            <ellipse cx={145} cy={135} rx={3} ry={5} fill="rgba(147,197,253,0.8)" />
            <path d={`M 110 165 Q 130 150 150 165`} fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" opacity={0.8} />
          </>
        ) : (
          <>
            <ellipse cx={115} cy={122} rx={7} ry={7} fill="white" opacity={0.8} />
            <ellipse cx={145} cy={122} rx={7} ry={7} fill="white" opacity={0.8} />
            <ellipse cx={115} cy={120} rx={3} ry={3} fill="rgba(0,0,0,0.5)" />
            <ellipse cx={145} cy={120} rx={3} ry={3} fill="rgba(0,0,0,0.5)" />
            <line x1={108} y1={160} x2={152} y2={160} stroke="white" strokeWidth="3" strokeLinecap="round" opacity={0.7} />
          </>
        )
      ) : (
        <>
          <ellipse cx={115} cy={122} rx={6} ry={6} fill="rgba(255,255,255,0.2)" />
          <ellipse cx={145} cy={122} rx={6} ry={6} fill="rgba(255,255,255,0.2)" />
          <line x1={115} y1={158} x2={145} y2={158} stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeLinecap="round" />
        </>
      )}

      {/* Sparkles for happy/excited */}
      {emotion && (emotion.label === "Happy" || emotion.label === "Excited") && (
        <>
          <text x={45} y={60} fontSize="16" opacity={0.7}>✦</text>
          <text x={200} y={50} fontSize="12" opacity={0.5}>✦</text>
          <text x={220} y={100} fontSize="14" opacity={0.6}>✦</text>
        </>
      )}
    </motion.svg>
  );
}

function Slide2({ selectedEmoji, setSelectedEmoji, onNext }: any) {
  const activeEmotion = PUZZLE_EMOTIONS.find(e => e.label === selectedEmoji) || null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85, y: -30 }}
      transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
      className="w-full max-w-md mx-auto flex flex-col items-center gap-5 relative"
    >
      {/* Floating particles */}
      {activeEmotion && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
          {[...Array(6)].map((_, i) => (
            <motion.div key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{ backgroundColor: activeEmotion.color, left: `${10 + i * 16}%` }}
              initial={{ y: "110%", opacity: 0 }}
              animate={{ y: "-10%", opacity: [0, 0.5, 0] }}
              transition={{ duration: 3 + Math.random() * 2, delay: i * 0.5, repeat: Infinity }}
            />
          ))}
        </div>
      )}

      {/* Instruction */}
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-xl sm:text-2xl font-black text-white/90 tracking-tight">
          Color in your emotion using the key below
        </h2>
      </motion.div>

      {/* Puzzle Bulb */}
      <PuzzleBulb emotion={activeEmotion} />

      {/* Question */}
      <p className="text-white/60 font-bold text-sm text-center">
        How do you feel on a daily basis?
      </p>

      {/* Emotion Cards Grid */}
      <div className="grid grid-cols-3 gap-3 w-full">
        {PUZZLE_EMOTIONS.map((em, i) => {
          const isActive = selectedEmoji === em.label;
          return (
            <motion.button
              key={em.label}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.06 }}
              whileHover={{ scale: 1.06, y: -3 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => setSelectedEmoji(em.label)}
              className={cn(
                "relative flex flex-col items-center justify-center py-3 px-2 rounded-2xl font-black text-sm transition-all duration-300 overflow-hidden",
                isActive
                  ? "text-white shadow-xl scale-105 border-2 border-white/40"
                  : "bg-white/8 backdrop-blur-sm border border-white/15 text-white/80 hover:bg-white/12"
              )}
              style={isActive ? {
                background: `linear-gradient(135deg, ${em.color}, ${em.color}aa)`,
                boxShadow: `0 6px 24px ${em.glow}`
              } : {}}
            >
              {isActive && (
                <motion.div
                  layoutId="emotionGlow"
                  className="absolute inset-0 rounded-2xl"
                  style={{ background: `linear-gradient(135deg, ${em.color}44, transparent)` }}
                  transition={{ type: "spring", bounce: 0.2 }}
                />
              )}
              <span className="text-2xl mb-1 relative z-10">{em.emoji}</span>
              <span className="relative z-10 text-xs">{em.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Continue button */}
      <AnimatePresence>
        {selectedEmoji && (
          <motion.button
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15 }}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={onNext}
            className="w-full py-4 rounded-2xl font-black text-base text-white shadow-2xl relative overflow-hidden"
            style={{
              background: activeEmotion ? `linear-gradient(135deg, ${activeEmotion.color}, ${activeEmotion.color}bb)` : "linear-gradient(135deg, #7c3aed, #ec4899)",
              boxShadow: activeEmotion ? `0 8px 32px ${activeEmotion.glow}` : undefined
            }}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Continue
              <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1, repeat: Infinity }}>→</motion.span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}


function Slide3({ dynamicQuestions, questions, setQuestions, onNext }: any) {
  const updateAnswer = (text: string, value: boolean) => {
    setQuestions({ ...questions, [text]: value });
  };

  const allAnswered = Object.values(questions).every(v => v !== null);

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -50, scale: 0.9 }}
      className="glass-card w-full max-w-2xl space-y-6"
    >
      <h1 className="text-4xl font-bold text-slate-800 text-center mb-8">Quick Check!</h1>
      
      {dynamicQuestions.map((q: any) => (
        <div key={q.id} className="bg-white/40 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between border border-white/50 space-y-4 sm:space-y-0">
          <span className="text-xl font-bold text-slate-700">{q.text}</span>
          <div className="flex space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => updateAnswer(q.text, true)}
              className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center transition-all",
                questions[q.text] === true ? "bg-green-400 text-white shadow-lg shadow-green-400/30 scale-110" : "bg-white text-green-400 hover:bg-green-50"
              )}
            >
              <ThumbsUp className="w-8 h-8" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => updateAnswer(q.text, false)}
              className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center transition-all",
                questions[q.text] === false ? "bg-red-400 text-white shadow-lg shadow-red-400/30 scale-110" : "bg-white text-red-400 hover:bg-red-50"
              )}
            >
              <ThumbsDown className="w-8 h-8" />
            </motion.button>
          </div>
        </div>
      ))}

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onNext}
        disabled={!allAnswered}
        className="px-8 py-4 bg-pink-500 disabled:bg-pink-300 text-white rounded-full font-bold text-xl shadow-lg shadow-pink-500/30 w-full mt-8"
      >
        Almost Done! ✨
      </motion.button>
    </motion.div>
  );
}

function Slide4({ onSubmit }: any) {
  const [checked, setChecked] = useState(false);

  const handleCheckIn = () => {
    setChecked(true);
    setTimeout(() => onSubmit(), 1800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85, y: -30 }}
      transition={{ type: "spring", bounce: 0.3, duration: 0.7 }}
      className="w-full max-w-sm mx-auto flex flex-col items-center gap-6 relative"
    >
      {!checked ? (
        <>
          {/* Ready icon */}
          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-400/40"
          >
            <PartyPopper className="w-12 h-12 text-white" />
          </motion.div>

          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-white">All Done!</h2>
            <p className="text-white/60 font-bold text-sm">Your emotional wellness check-in is complete.</p>
          </div>

          <motion.button
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.04, y: -3 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleCheckIn}
            className="w-full py-4 rounded-2xl font-black text-base text-white relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #22c55e, #10b981)",
              boxShadow: "0 8px 32px rgba(34,197,94,0.4)"
            }}
          >
            <motion.div
              className="absolute inset-0 bg-white/10 rounded-2xl"
              animate={{ opacity: [0, 0.3, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="relative z-10 flex items-center justify-center gap-2">
              Submit Check-In
              <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <Star className="w-5 h-5 fill-amber-300 text-amber-300" />
              </motion.span>
            </span>
          </motion.button>
        </>
      ) : (
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="text-center space-y-4"
        >
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
            className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-xl shadow-green-400/40"
          >
            <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={2.5} />
          </motion.div>
          <h3 className="text-2xl font-black text-white">You're Checked In!</h3>
          <p className="text-white/60 font-bold text-sm">Have a wonderful day at school!</p>
        </motion.div>
      )}
    </motion.div>
  );
}

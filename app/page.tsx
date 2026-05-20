/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable prefer-const */

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, User, KeyRound, Star, Heart, Zap, Lock, GraduationCap, Search, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Lottie from "lottie-react";
import searchLottieData from "@/public/lottie/Search icon.json";
import profileLottieData from "@/public/lottie/Profile.json";

const floatingItems = [
  { emoji: "⭐", x: "8%", y: "15%", delay: 0, size: "text-3xl" },
  { emoji: "🌈", x: "88%", y: "10%", delay: 0.4, size: "text-2xl" },
  { emoji: "🎨", x: "5%", y: "75%", delay: 0.8, size: "text-3xl" },
  { emoji: "🦋", x: "90%", y: "70%", delay: 0.2, size: "text-2xl" },
  { emoji: "🌸", x: "15%", y: "45%", delay: 1.0, size: "text-xl" },
  { emoji: "🎵", x: "82%", y: "40%", delay: 0.6, size: "text-2xl" },
  { emoji: "💫", x: "50%", y: "5%", delay: 0.3, size: "text-xl" },
  { emoji: "🎪", x: "70%", y: "85%", delay: 0.9, size: "text-2xl" },
  { emoji: "🌟", x: "25%", y: "85%", delay: 0.5, size: "text-xl" },
];

// ── Premium OTP Input Component ──
function OTPMaskInput({ value, onChange, placeholder, className }: any) {
  const [visibleIndex, setVisibleIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    onChange(newVal);
    if (newVal.length > value.length) {
      setVisibleIndex(newVal.length - 1);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setVisibleIndex(-1), 1000);
    } else {
      setVisibleIndex(-1);
    }
  };

  return (
    <div className="relative w-full group">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-text"
        required
        autoComplete="off"
      />
      <div className={`${className} flex items-center relative transition-all duration-200 ${isFocused ? 'border-purple-400 bg-white ring-4 ring-purple-500/10' : 'border-slate-100 bg-slate-50/50'}`}>
        {!value && <span className="text-slate-400 font-normal select-none">{placeholder}</span>}
        {value && (
          <span className="tracking-[0.3em] font-bold text-lg translate-y-[1px] select-none text-slate-800">
            {value.split('').map((char: string, i: number) => i === visibleIndex ? char : '●').join('')}
          </span>
        )}
        {isFocused && <motion.span initial={{opacity:0}} animate={{opacity:[1, 0]}} transition={{duration: 0.8, repeat: Infinity}} className="inline-block w-[2px] h-[20px] bg-purple-500 ml-1 rounded-full" />}
      </div>
    </div>
  );
}

// ── Compact Clock Mascot for Login Page ──
function LoginClockMascot() {
  const [time, setTime] = useState<Date | null>(null);
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    setTime(new Date());
    const t = setInterval(() => setTime(new Date()), 1000);
    const b = setInterval(() => { setBlink(true); setTimeout(() => setBlink(false), 200); }, 3500);
    return () => { clearInterval(t); clearInterval(b); };
  }, []);

  const CX = 100, CY = 100, R = 75;
  const now = time || new Date();
  const usStr = now.toLocaleString("en-US", { timeZone: "America/New_York" });
  const usD = new Date(usStr);
  const sec = usD.getSeconds(), min = usD.getMinutes() + sec / 60, hr = (usD.getHours() % 12) + min / 60;
  const hand = (a: number, l: number) => { const r = ((a - 90) * Math.PI) / 180; return { x: CX + l * Math.cos(r), y: CY + l * Math.sin(r) }; };
  const sH = hand((sec / 60) * 360, 60), mH = hand((min / 60) * 360, 50), hH = hand((hr / 12) * 360, 35);

  return (
    <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }} className="my-1">
      <svg viewBox="0 0 200 230" className="w-56 h-64 sm:w-64 sm:h-72 lg:w-80 lg:h-96 xl:w-[24rem] xl:h-[26rem] drop-shadow-xl">
        <defs>
          <radialGradient id="lcf" cx="50%" cy="45%" r="55%"><stop offset="0%" stopColor="#fff" /><stop offset="100%" stopColor="#e9e5ff" /></radialGradient>
          <filter id="lcs"><feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="rgba(139,92,246,0.3)" /></filter>
        </defs>
        {/* Shadow */}
        <ellipse cx={CX} cy={CY + R + 30} rx={50} ry={8} fill="rgba(139,92,246,0.1)" />
        {/* Legs */}
        <line x1={CX - 18} y1={CY + R + 6} x2={CX - 28} y2={CY + R + 30} stroke="#c4b5fd" strokeWidth="7" strokeLinecap="round" />
        <line x1={CX + 18} y1={CY + R + 6} x2={CX + 28} y2={CY + R + 30} stroke="#c4b5fd" strokeWidth="7" strokeLinecap="round" />
        <ellipse cx={CX - 30} cy={CY + R + 33} rx={10} ry={5} fill="#a78bfa" />
        <ellipse cx={CX + 30} cy={CY + R + 33} rx={10} ry={5} fill="#a78bfa" />
        {/* Arms */}
        <motion.line x1={CX - R - 3} y1={CY + 6} x2={CX - R - 22} y2={CY - 18} stroke="#c4b5fd" strokeWidth="6" strokeLinecap="round"
          animate={{ rotate: [0, -12, 12, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ transformOrigin: `${CX - R - 3}px ${CY + 6}px` }} />
        <motion.line x1={CX + R + 3} y1={CY + 6} x2={CX + R + 22} y2={CY - 18} stroke="#c4b5fd" strokeWidth="6" strokeLinecap="round"
          animate={{ rotate: [0, 12, -12, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ transformOrigin: `${CX + R + 3}px ${CY + 6}px` }} />
        <circle cx={CX - R - 24} cy={CY - 21} r={7} fill="#ddd6fe" />
        <circle cx={CX + R + 24} cy={CY - 21} r={7} fill="#ddd6fe" />
        {/* Body */}
        <circle cx={CX} cy={CY} r={R} fill="url(#lcf)" filter="url(#lcs)" />
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(167,139,250,0.35)" strokeWidth="2" />
        {/* Ticks */}
        {Array.from({ length: 12 }).map((_, i) => { const a = (i / 12) * 2 * Math.PI - Math.PI / 2; return (
          <line key={i} x1={CX + (R - 12) * Math.cos(a)} y1={CY + (R - 12) * Math.sin(a)} x2={CX + (R - 5) * Math.cos(a)} y2={CY + (R - 5) * Math.sin(a)}
            stroke="rgba(139,92,246,0.35)" strokeWidth="2" strokeLinecap="round" />
        ); })}
        {[{ n: "12", x: CX, y: CY - R + 20 }, { n: "3", x: CX + R - 18, y: CY + 4 }, { n: "6", x: CX, y: CY + R - 14 }, { n: "9", x: CX - R + 18, y: CY + 4 }].map(({ n, x, y }) => (
          <text key={n} x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize="10" fontWeight="800" fill="#8b5cf6" fontFamily="system-ui">{n}</text>
        ))}
        {/* Hands */}
        <line x1={CX} y1={CY} x2={hH.x} y2={hH.y} stroke="#4c1d95" strokeWidth="5" strokeLinecap="round" />
        <line x1={CX} y1={CY} x2={mH.x} y2={mH.y} stroke="#7c3aed" strokeWidth="3.5" strokeLinecap="round" />
        <line x1={CX} y1={CY} x2={sH.x} y2={sH.y} stroke="#f43f5e" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx={CX} cy={CY} r={5} fill="#7c3aed" /><circle cx={CX} cy={CY} r={2.5} fill="white" />
        {/* Eyes */}
        {blink ? (<>
          <line x1={CX - 22} y1={CY - 16} x2={CX - 10} y2={CY - 16} stroke="#334155" strokeWidth="3" strokeLinecap="round" />
          <line x1={CX + 10} y1={CY - 16} x2={CX + 22} y2={CY - 16} stroke="#334155" strokeWidth="3" strokeLinecap="round" />
        </>) : (<>
          <ellipse cx={CX - 16} cy={CY - 16} rx={5} ry={6} fill="#334155" />
          <ellipse cx={CX + 16} cy={CY - 16} rx={5} ry={6} fill="#334155" />
          <ellipse cx={CX - 14} cy={CY - 18} rx={2} ry={2} fill="white" />
          <ellipse cx={CX + 14} cy={CY - 18} rx={2} ry={2} fill="white" />
        </>)}
        {/* Mouth */}
        <path d={`M ${CX - 15} ${CY + 10} Q ${CX} ${CY + 28} ${CX + 15} ${CY + 10}`} fill="#a78bfa" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
        {/* Cheeks */}
        <ellipse cx={CX - 30} cy={CY + 3} rx={7} ry={5} fill="rgba(244,114,182,0.25)" />
        <ellipse cx={CX + 30} cy={CY + 3} rx={7} ry={5} fill="rgba(244,114,182,0.25)" />
        {/* Hat */}
        <rect x={CX - 20} y={CY - R - 24} width={40} height={20} rx={4} fill="#4c1d95" />
        <rect x={CX - 30} y={CY - R - 4} width={60} height={8} rx={4} fill="#6d28d9" />
        <rect x={CX - 20} y={CY - R - 10} width={40} height={6} fill="#f59e0b" rx={2} />
      </svg>
    </motion.div>
  );
}

const VideoBoyMascot = () => {
  const [videoIndex, setVideoIndex] = useState(0);

  return (
    <motion.div
      className="absolute -top-[160px] z-30 right-0 sm:-right-4 pointer-events-none"
      initial={{ opacity: 0, x: 200 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1.2, type: "spring", stiffness: 80 }}
    >
      <div className="relative w-[240px] h-[240px]">
        {/* User Provided Transparent WebM Video Sequence */}
        {videoIndex === 0 ? (
          <video 
            autoPlay 
            muted 
            playsInline 
            onEnded={() => setVideoIndex(1)}
            src="/c5308b7293ca45b582e1d5c19227c70c.webm" 
            className="w-full h-full object-contain drop-shadow-2xl"
          />
        ) : (
          <video 
            autoPlay 
            muted 
            playsInline 
            onEnded={() => setVideoIndex(0)}
            src="/ccb74e9e46ff4dba88e5e8174f14f5f1.webm" 
            className="w-full h-full object-contain drop-shadow-2xl"
          />
        )}
        
        {/* Chat Bubble transitions between videos */}
        <AnimatePresence>
          <motion.div 
             key={videoIndex}
             className={`absolute bg-white/95 backdrop-blur-md text-xs sm:text-sm font-black px-5 py-3 rounded-2xl rounded-br-none shadow-xl border whitespace-nowrap origin-bottom-right ${videoIndex === 0 ? '-left-16 top-2 text-purple-600 border-purple-100' : '-left-28 top-2 text-pink-600 border-pink-100'}`}
             initial={{ scale: 0, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             exit={{ scale: 0, opacity: 0, transition: { duration: 0.15 } }}
             transition={{ type: "spring", stiffness: 350, damping: 25 }}
          >
             <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
               {videoIndex === 0 ? "Hello! 👋" : "Let's learn today ✨"}
             </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function Home() {

  const [studentName, setStudentName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [teacherUsername, setTeacherUsername] = useState("");
  const [teacherPassword, setTeacherPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [schoolName, setSchoolName] = useState("Student Attendance\n& Engagement Platform");
  const [schoolLogo, setSchoolLogo] = useState("");
  
  const [animKey, setAnimKey] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimKey(prev => prev + 1);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Fetch school branding
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/school`);
        if (res.ok) {
          const data = await res.json();
          if (data.name) setSchoolName(data.name);
          if (data.logo) setSchoolLogo(data.logo);
        }
      } catch {}
    })();
  }, []);

  // Debounced name search
  const searchStudents = useCallback(async (query: string) => {
    if (query.trim().length < 1) { setSuggestions([]); return; }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data);
        setShowSuggestions(data.length > 0);
      }
    } catch { setSuggestions([]); }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { if (studentName && studentName.trim()) searchStudents(studentName); }, 200);
    return () => clearTimeout(timer);
  }, [studentName, searchStudents]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node) &&
          nameInputRef.current && !nameInputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectStudent = (s: any) => {
    const formattedName = `${s.firstName || ""} ${s.lastInitial ? s.lastInitial.charAt(0) : ""}`.trim();
    setStudentName(formattedName || s.name || "");
    setRollNumber(s.rollNumber);
    setSelectedStudent(s);
    setShowSuggestions(false);
  };

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roll_number: rollNumber, otp }),
      });
      if (res.ok) {
        localStorage.setItem("studentRoll", rollNumber);
        setIsLoginLoading(true);
      } else {
        alert("❌ Invalid Magic Code! Ask your teacher for today's code.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTeacherLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/teacher-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: teacherUsername, password: teacherPassword }),
      });
      if (res.ok) {
        router.push("/admin");
      } else {
        setLoginError("Invalid credentials. Please try again.");
      }
    } catch {
      setLoginError("Could not connect to server. Try again.");
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden font-outfit flex flex-col">

      {/* ─── Animated gradient background ─── */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-100 via-pink-50 to-sky-100" />
      <div className="absolute inset-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-300/30 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-pink-300/30 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-[30%] right-[20%] w-[400px] h-[400px] bg-blue-200/20 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* ─── Floating emoji decorations ─── */}
      {floatingItems.map((item, i) => (
        <motion.div
          key={i}
          className={`absolute select-none pointer-events-none z-10 ${item.size}`}
          style={{ left: item.x, top: item.y }}
          animate={{ y: [0, -16, 0], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: "easeInOut", delay: item.delay }}
        >
          {item.emoji}
        </motion.div>
      ))}

      {/* ─── Top Navigation Bar ─── */}
      <div className="relative z-20 flex items-center justify-between px-8 pt-6">
        {/* Logo (Secret Teacher Login Trigger) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 cursor-default select-none"
          onDoubleClick={() => setShowTeacherModal(true)}
        >
          {schoolLogo ? (
            <div className="w-10 h-10 rounded-2xl overflow-hidden bg-white shadow-lg border border-purple-100">
              <img src={schoolLogo} alt="" className="w-full h-full object-contain p-0.5" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          )}
          <div>
            <div className="font-black text-slate-800 text-[15px] leading-[1.1] tracking-tight">{schoolName}</div>
          </div>
        </motion.div>

        {/* Teacher Login Button */}
        <motion.button
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowTeacherModal(true)}
          className="hidden items-center gap-2 bg-white/80 backdrop-blur-md border border-white/60 text-slate-700 px-5 py-2.5 rounded-2xl font-bold text-sm shadow-lg shadow-slate-200/50 hover:bg-white hover:shadow-xl transition-all"
        >
          <GraduationCap className="w-4 h-4 text-purple-600" />
          Teacher Login
        </motion.button>
      </div>


      {/* ─── Main Content: Clock Mascot + Login Form ─── */}
      <div className="relative z-20 flex-1 flex flex-col lg:flex-row items-center justify-center px-6 py-8 max-w-6xl mx-auto w-full gap-12 lg:gap-24">

        {/* Left Side: Title and Clock */}
        <div className="flex-1 flex flex-col items-center justify-center w-full">
          {/* Floating Title */}
          <div key={animKey} className="flex flex-col items-center gap-1 lg:gap-3 mb-10 lg:mb-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
              className="flex justify-center gap-1 sm:gap-2 flex-nowrap"
            >
              {"TODAY".split("").map((ch, i) => {
                const isO = ch === "O";
                const isA = ch === "A";
                const content = isO ? "🍩" : isA ? "🍕" : ch;
                
                // O from top, A from bottom, others from sides
                let initX = (i % 2 === 0 ? -60 : 60);
                let initY = (i % 2 === 0 ? -40 : 40);
                let initRot = -30 + i * 15;
                
                if (isO) { initX = 0; initY = -120; initRot = -180; }
                if (isA) { initX = 0; initY = 120; initRot = 180; }

                return (
                  <motion.span
                    key={`today-${i}`}
                    initial={{ opacity: 0, scale: 0.1, x: initX, y: initY, rotate: initRot }}
                    animate={{ opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 120,
                      damping: 10,
                      delay: i * 0.1,
                      mass: 0.8
                    }}
                    className="relative inline-block mx-0.5 sm:mx-1"
                  >
                    <motion.span
                      animate={{ 
                        y: [0, -10, 0], 
                        rotate: [0, i % 2 === 0 ? 3 : -3, 0]
                      }}
                      transition={{ 
                        delay: i * 0.1 + 1.2,
                        duration: 3 + (i % 3) * 0.4, 
                        repeat: Infinity, 
                        ease: "easeInOut"
                      }}
                      className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black tracking-widest drop-shadow-lg flex items-center justify-center"
                      style={{
                        color: i % 3 === 0 ? "#8b5cf6" : i % 3 === 1 ? "#ec4899" : "#60a5fa",
                        WebkitTextStroke: (isO || isA) ? "0px transparent" : "2px white",
                      }}
                    >
                      {content}
                    </motion.span>
                  </motion.span>
                );
              })}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              className="flex justify-center gap-0.5 sm:gap-1 flex-nowrap w-full whitespace-nowrap mt-2"
            >
              {"ATTENDANCE".split("").map((ch, i) => {
                const isA = ch === "A";
                let content = ch;
                if (isA) content = i === 0 ? "⛺" : "🚀";
                
                let initX = (i % 2 === 0 ? 50 : -50);
                let initY = (i % 3 === 0 ? 50 : -50);
                let initRot = 45 - i * 10;
                
                if (isA) { initX = 0; initY = 100; initRot = 90; }

                return (
                  <motion.span
                    key={`att-${i}`}
                    initial={{ opacity: 0, scale: 0.1, x: initX, y: initY, rotate: initRot }}
                    animate={{ opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 140,
                      damping: 12,
                      delay: 0.4 + i * 0.08,
                    }}
                    className="relative inline-block mx-[1px] sm:mx-0.5"
                  >
                    <motion.span
                      animate={{ 
                        y: [0, -8, 0], 
                        rotate: [0, i % 2 === 0 ? -2 : 2, 0]
                      }}
                      transition={{ 
                        delay: 0.4 + i * 0.08 + 1.2,
                        duration: 2.5 + (i % 3) * 0.4, 
                        repeat: Infinity, 
                        ease: "easeInOut"
                      }}
                      className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black tracking-wider drop-shadow-md flex items-center justify-center"
                      style={{
                        color: (i + 5) % 3 === 0 ? "#8b5cf6" : (i + 5) % 3 === 1 ? "#ec4899" : "#60a5fa",
                        WebkitTextStroke: isA ? "0px transparent" : "1.5px white",
                      }}
                    >
                      {content}
                    </motion.span>
                  </motion.span>
                );
              })}
            </motion.div>
          </div>

          {/* Clock Mascot — Real-time US Eastern */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4, type: "spring", stiffness: 120 }}
            className="flex justify-center w-full mt-4 lg:mt-8"
          >
            <LoginClockMascot />
          </motion.div>
        </div>

        {/* Right Side: Login Card */}
        <div className="flex-1 w-full max-w-md lg:max-w-lg">
          {/* Login Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
            className="w-full relative"
          >
            <VideoBoyMascot />

            <div className="bg-white/80 backdrop-blur-2xl border border-white/60 rounded-[2rem] shadow-2xl shadow-purple-200/50 p-6 sm:p-8 relative">
              {/* Background Blobs (Clipped) */}
              <div className="absolute inset-0 overflow-hidden rounded-[2rem] pointer-events-none">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-300/15 rounded-full blur-2xl" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-400/15 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-pink-300/5 rounded-full blur-3xl" />
              </div>

              <div className="relative z-10">
                <form onSubmit={handleStudentLogin} className="space-y-5">
                  {/* Student Name with Autocomplete */}
                  <div className="relative">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1 mb-2 block">Your Name</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-1 flex items-center pointer-events-none z-10">
                        {selectedStudent?.profilePhoto ? (
                          <div className="pl-3">
                            <img
                              src={selectedStudent.profilePhoto}
                              alt={selectedStudent.fullName || selectedStudent.firstName}
                              className="w-8 h-8 rounded-full object-cover border-2 border-purple-200 shadow-sm"
                            />
                          </div>
                        ) : selectedStudent ? (
                          <div className="pl-3">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          </div>
                        ) : (
                          <Lottie animationData={searchLottieData} loop={true} className="w-14 h-14 opacity-90 group-focus-within:opacity-100 transition-opacity drop-shadow-sm" />
                        )}
                      </div>
                      <input
                        ref={nameInputRef}
                        type="text"
                        value={studentName}
                        onChange={(e) => {
                          setStudentName(e.target.value);
                          setSelectedStudent(null);
                          setRollNumber("");
                        }}
                        onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                        className={`w-full pr-4 py-3.5 bg-slate-50/50 hover:bg-slate-50 border-2 border-slate-100 focus:border-purple-400 focus:bg-white rounded-2xl outline-none transition-all placeholder:text-slate-400 text-slate-800 font-bold text-sm sm:text-base shadow-sm ${
                          selectedStudent?.profilePhoto ? "pl-14" : selectedStudent ? "pl-12" : "pl-[3.8rem]"
                        }`}
                        placeholder="Start typing your name..."
                        autoComplete="off"
                        required
                      />
                    </div>

                    {/* Suggestions Dropdown */}
                    <AnimatePresence>
                      {showSuggestions && suggestions.length > 0 && (
                        <motion.div
                          ref={suggestionsRef}
                          initial={{ opacity: 0, y: -5, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -5, scale: 0.98 }}
                          transition={{ duration: 0.15 }}
                          className="absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-xl border-2 border-purple-100 rounded-2xl shadow-2xl shadow-purple-200/40 overflow-hidden"
                        >
                          <div className="px-4 py-3 border-b border-purple-50">
                            <p className="text-[10px] font-black text-purple-500 uppercase tracking-wider">Matching Students</p>
                          </div>
                          <div className="max-h-48 overflow-y-auto">
                            {suggestions.map((s, i) => (
                              <motion.button
                                key={`${s.rollNumber}-${i}`}
                                type="button"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.04 }}
                                onClick={() => selectStudent(s)}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition-all text-left group/item"
                              >
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center shrink-0 group-hover/item:from-purple-200 group-hover/item:to-pink-200 transition-all shadow-sm overflow-hidden">
                                  {s.profilePhoto ? (
                                    <img src={s.profilePhoto} alt={s.fullName} className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="text-base font-black text-purple-600">{s.firstName?.charAt(0) || s.name?.charAt(0) || s.fullName?.charAt(0) || "?"}</span>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-black text-slate-700 truncate">
                                    {`${s.firstName || ""} ${s.lastInitial ? s.lastInitial.charAt(0) : ""}`.trim() || s.name}
                                  </p>
                                  <p className="text-[11px] font-bold text-slate-400">Roll: {s.rollNumber} · {s.className || s.class_name}</p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-300 group-hover/item:text-purple-500 transition-colors" />
                              </motion.button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Roll Number */}
                  <div>
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1 mb-2 block">Roll Number</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lottie animationData={profileLottieData} loop={true} className="w-7 h-7 opacity-70 group-focus-within:opacity-100 transition-opacity" />
                      </div>
                      <input
                        type="text"
                        value={rollNumber}
                        onChange={(e) => setRollNumber(e.target.value)}
                        className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-2xl outline-none transition-all placeholder:text-slate-400 text-slate-800 font-bold text-sm sm:text-base shadow-sm ${
                          selectedStudent ? "bg-green-50/50 hover:bg-green-50 border-green-200 focus:border-green-400" : "bg-slate-50/50 hover:bg-slate-50 border-slate-100 focus:border-purple-400 focus:bg-white"
                        }`}
                        placeholder="Enter your roll number"
                        required
                      />
                    </div>
                  </div>

                  {/* Daily Magic Code */}
                  <div>
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1 mb-2 block">Daily Magic Code</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <img src="/lottie/key.gif" alt="Key" className="w-9 h-9 opacity-80 group-focus-within:opacity-100 transition-opacity mix-blend-multiply scale-110" />
                      </div>
                      <OTPMaskInput
                        value={otp}
                        onChange={(val: string) => setOtp(val)}
                        className="w-full pl-12 pr-4 py-3.5 border-2 rounded-2xl shadow-sm"
                        placeholder="Ask your teacher for today's code"
                      />
                    </div>
                    <p className="text-xs text-slate-400 font-semibold mt-2 ml-1">💡 Your teacher gives you this every morning</p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full mt-2 py-4 sm:py-4 bg-gradient-to-r from-purple-500 via-purple-600 to-pink-500 hover:from-purple-600 hover:via-pink-500 hover:to-pink-600 text-white rounded-2xl font-black text-base sm:text-lg shadow-xl shadow-purple-400/40 flex items-center justify-center gap-2 group transition-all"
                  >
                    Let's Go! 🚀
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      </div>


      {/* ─── Teacher Login Modal ─── */}
      <AnimatePresence>
        {showTeacherModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", bounce: 0.25, duration: 0.4 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.3),transparent)]" />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="font-black text-lg">Teacher Login</h2>
                      <p className="text-white/70 text-xs font-medium">Admin Dashboard Access</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setShowTeacherModal(false); setLoginError(""); }}
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors text-white font-black text-lg leading-none"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleTeacherLogin} className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2 block">Username</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={teacherUsername}
                      onChange={e => setTeacherUsername(e.target.value)}
                      placeholder="Enter username"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-100 focus:border-purple-400 rounded-xl outline-none text-sm font-bold text-slate-800 transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2 block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      value={teacherPassword}
                      onChange={e => setTeacherPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-100 focus:border-purple-400 rounded-xl outline-none text-sm font-bold text-slate-800 transition-all"
                      required
                    />
                  </div>
                </div>

                {loginError && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-100 text-red-600 rounded-xl p-3 text-xs font-bold flex items-center gap-2"
                  >
                    <span>⚠️</span> {loginError}
                  </motion.div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-xl font-black text-sm shadow-lg hover:from-slate-700 hover:to-slate-600 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" /> Access Admin Dashboard
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Premium Loading Overlay ─── */}
      <AnimatePresence>
        {isLoginLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/40 backdrop-blur-3xl"
          >
            {/* Ambient Animated Glow */}
            <motion.div 
              className="absolute w-[40vw] h-[40vw] bg-purple-500/20 rounded-full blur-[100px]"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div 
              className="absolute w-[30vw] h-[30vw] bg-pink-500/20 rounded-full blur-[80px]"
              animate={{ 
                scale: [1.2, 1, 1.2],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="relative z-10 flex flex-col items-center"
            >
              <div className="w-96 h-96 sm:w-[500px] sm:h-[500px] md:w-[600px] md:h-[600px] relative flex items-center justify-center drop-shadow-2xl">
                <video
                  autoPlay
                  playsInline
                  onEnded={() => router.push("/wellness")}
                  onError={() => {
                    setTimeout(() => router.push("/wellness"), 1500);
                  }}
                  onLoadedData={(e) => {
                    // Fallback timeout in case onEnded doesn't fire
                    setTimeout(() => {
                      if (isLoginLoading) {
                        router.push("/wellness");
                      }
                    }, (e.currentTarget.duration * 1000) + 1000 || 5000);
                  }}
                  className="w-full h-full object-contain"
                  style={{ backgroundColor: "transparent" }}
                >
                  <source src="/6683fc78a5514e8bb5c9a296bc6a9128.webm" type="video/webm" />
                </video>
              </div>
              <motion.h2 
                className="mt-8 text-2xl sm:text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-sm"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                Getting things ready...
              </motion.h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}

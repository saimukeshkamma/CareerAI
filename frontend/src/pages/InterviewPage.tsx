import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { interviewApi } from '../services/api';
import { Interview, InterviewQuestion, InterviewAnswer } from '../types';
import {
  Mic, MicOff, Send, Sparkles, CheckCircle2,
  AlertTriangle, ArrowRight, RefreshCw, Trophy,
  Clock, Play, HelpCircle, Layers, Check, Compass
} from 'lucide-react';
import { ScoreRing } from '../components/common/ScoreRing';
import { LoadingState } from '../components/common/LoadingState';
import confetti from 'canvas-confetti';

interface InterviewPageProps {
  onNavigate?: (tab: string, contextId?: any) => void;
  initialInterviewId?: number;
}

export const InterviewPage: React.FC<InterviewPageProps> = ({ onNavigate, initialInterviewId }) => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  // Setup state
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(false);
  const [targetRole, setTargetRole] = useState(user?.target_role || 'AI Engineer');
  const [interviewType, setInterviewType] = useState('Technical');
  const [difficulty, setDifficulty] = useState('Intermediate');

  // Active question state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastEvaluation, setLastEvaluation] = useState<InterviewAnswer | null>(null);
  const [showHint, setShowHint] = useState(false);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (initialInterviewId) {
      loadExistingInterview(initialInterviewId);
    }
  }, [initialInterviewId]);

  const loadExistingInterview = async (id: number) => {
    try {
      setLoading(true);
      const data = await interviewApi.get(id);
      setInterview(data);
    } catch (err) {
      showToast('Error', 'Failed to load interview.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStartInterview = async () => {
    try {
      setLoading(true);
      const newSession = await interviewApi.create({
        role: targetRole,
        interview_type: interviewType,
        difficulty: difficulty
      });
      setInterview(newSession);
      setCurrentQuestionIndex(0);
      setUserAnswer('');
      setLastEvaluation(null);
      showToast('Interview Initialized', `5 dynamic questions prepared for ${targetRole}.`, 'success');
    } catch (err) {
      showToast('Error', 'Failed to start interview.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Speech to text toggle using browser Web Speech API
  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      clearInterval(timerRef.current);
      setIsRecording(false);
      showToast('Voice Recorded', 'Speech transcribed into text answer box.', 'info');
    } else {
      // Start recording
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        showToast('Speech API Unavailable', 'Your browser does not support Web Speech API. Please type your response.', 'warning');
        return;
      }

      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setUserAnswer(prev => prev ? `${prev} ${transcript}` : transcript);
        };

        recognition.onerror = (err: any) => {
          console.error("Speech recognition error:", err);
          setIsRecording(false);
          clearInterval(timerRef.current);
        };

        recognition.onend = () => {
          setIsRecording(false);
          clearInterval(timerRef.current);
        };

        recognition.start();
        recognitionRef.current = recognition;
        setIsRecording(true);
        setRecordingSeconds(0);
        timerRef.current = setInterval(() => {
          setRecordingSeconds(s => s + 1);
        }, 1000);
      } catch (err) {
        showToast('Error', 'Microphone permission denied or busy.', 'error');
      }
    }
  };

  const handleSubmitAnswer = async () => {
    if (!interview || !interview.questions || !userAnswer.trim()) return;
    const activeQ = interview.questions[currentQuestionIndex];

    try {
      setIsSubmitting(true);
      const evalRes = await interviewApi.submitAnswer(interview.id, activeQ.id, {
        user_answer: userAnswer,
        is_audio: recordingSeconds > 0,
        audio_duration: recordingSeconds
      });

      setLastEvaluation(evalRes);
      showToast('Answer Evaluated!', `Question scored ${evalRes.score}/100.`, 'success');

      // Refresh interview state
      const updated = await interviewApi.get(interview.id);
      setInterview(updated);
    } catch (err) {
      showToast('Error', 'Failed to evaluate answer.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (!interview || !interview.questions) return;
    if (currentQuestionIndex < interview.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setUserAnswer('');
      setLastEvaluation(null);
      setShowHint(false);
      setRecordingSeconds(0);
    }
  };

  const handleFinishInterview = async () => {
    if (!interview) return;
    try {
      setLoading(true);
      const completed = await interviewApi.complete(interview.id);
      setInterview(completed);

      // Trigger celebratory confetti if high score
      if ((completed.overall_score || 0) >= 80) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {
          // ignore
        }
      }

      showToast('Interview Completed!', `Overall Score: ${completed.overall_score}/100.`, 'success');
    } catch (err) {
      showToast('Error', 'Failed to complete interview.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 1. SETUP WIZARD VIEW (If no interview started yet)
  if (!interview) {
    return (
      <div className="max-w-2xl mx-auto py-8 animate-fade-in space-y-8 text-center">
        <div>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center mx-auto mb-4 text-white shadow-xl shadow-purple-500/20">
            <Mic className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">AI Mock Interview Coach</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-lg mx-auto leading-relaxed">
            Practice real technical & behavioral questions tailored to your target role. Receive instant multi-rubric evaluation, strengths, areas of growth, and structured model frameworks.
          </p>
        </div>

        {/* Setup Card */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-700/80 text-left space-y-6 shadow-2xl">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              1. Target Position
            </label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-xs font-semibold text-white rounded-xl p-3 outline-none focus:border-blue-500"
            >
              <option value="AI Engineer">AI Engineer</option>
              <option value="ML Engineer">Machine Learning Engineer</option>
              <option value="Data Scientist">Data Scientist</option>
              <option value="Software Engineer">Software Engineer (Backend & Systems)</option>
              <option value="Fullstack Developer">Fullstack Developer</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                2. Interview Format
              </label>
              <select
                value={interviewType}
                onChange={(e) => setInterviewType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-xs font-semibold text-white rounded-xl p-3 outline-none focus:border-blue-500"
              >
                <option value="Technical">Technical & Architecture</option>
                <option value="HR / Behavioral">HR & Behavioral (STAR)</option>
                <option value="System Design">System Design & Scalability</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                3. Difficulty Tier
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-xs font-semibold text-white rounded-xl p-3 outline-none focus:border-blue-500"
              >
                <option value="Beginner">Beginner (Internship / Foundational)</option>
                <option value="Intermediate">Intermediate (Entry-level / 0-2 yrs)</option>
                <option value="Advanced">Advanced (Mid-Senior / Deep Dive)</option>
              </select>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/30 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-blue-400 shrink-0" />
            <p className="text-xs text-slate-300 leading-relaxed">
              Your session will generate <span className="font-bold text-white">5 personalized questions</span> with Speech-to-Text microphone recording and instant rubric feedback.
            </p>
          </div>

          <button
            onClick={handleStartInterview}
            disabled={loading}
            className="w-full py-4 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-xl shadow-purple-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {loading ? 'Preparing Questions...' : 'Begin AI Mock Interview'}
            <Play className="w-4 h-4 fill-white" />
          </button>
        </div>
      </div>
    );
  }

  // 2. COMPLETED FINAL REPORT VIEW
  if (interview.status === 'completed') {
    return (
      <div className="max-w-4xl mx-auto py-8 animate-fade-in space-y-8 text-left">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1 text-emerald-400 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>Interview Session Completed</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {interview.role} Mock Interview Scorecard
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Format: {interview.interview_type} • Difficulty: {interview.difficulty}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setInterview(null);
                setCurrentQuestionIndex(0);
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-500/20"
            >
              Start New Interview
            </button>
            <button
              onClick={() => onNavigate && onNavigate('interview-history')}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 glass-card hover:bg-slate-800"
            >
              View All History
            </button>
          </div>
        </div>

        {/* Big Score Summary Banner */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <ScoreRing
              score={interview.overall_score || 84}
              size={130}
              strokeWidth={11}
              label="Overall Score"
              colorScheme="purple"
            />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Readiness Assessment</span>
              <h3 className="text-lg font-bold text-white mt-0.5">
                {(interview.overall_score || 0) >= 85 ? 'Strong Candidate Readiness' : 'Solid Foundational Grasp'}
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">
                {interview.feedback_summary}
              </p>
            </div>
          </div>

          {/* Sub-Scores */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 w-full md:w-auto text-center">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-base font-bold text-white">{interview.technical_score || 88}%</span>
              <p className="text-[9px] uppercase text-slate-400 font-semibold mt-0.5">Technical</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-base font-bold text-white">{interview.communication_score || 81}%</span>
              <p className="text-[9px] uppercase text-slate-400 font-semibold mt-0.5">Communication</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-base font-bold text-white">{interview.problem_solving_score || 86}%</span>
              <p className="text-[9px] uppercase text-slate-400 font-semibold mt-0.5">Problem Solving</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-base font-bold text-white">{interview.relevance_score || 90}%</span>
              <p className="text-[9px] uppercase text-slate-400 font-semibold mt-0.5">Relevance</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-base font-bold text-white">{interview.clarity_score || 82}%</span>
              <p className="text-[9px] uppercase text-slate-400 font-semibold mt-0.5">Clarity</p>
            </div>
          </div>
        </div>

        {/* Strengths & Improvements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-card p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/10">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-3">
              <CheckCircle2 className="w-4 h-4" />
              What You Did Well
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              {interview.key_strengths?.map((str, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-amber-500/30 bg-amber-950/10">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-3">
              <AlertTriangle className="w-4 h-4" />
              High-Value Improvements
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              {interview.key_improvements?.map((imp, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{imp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Detailed Question by Question Review */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Detailed Question Review ({interview.questions?.length || 0})
          </h3>

          {interview.questions?.map((q) => (
            <div key={q.id} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-blue-400 uppercase">Question {q.order_index} • {q.category}</span>
                {q.answer && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                    Score: {q.answer.score}/100
                  </span>
                )}
              </div>

              <h4 className="text-sm font-bold text-white">{q.question_text}</h4>

              {q.answer && (
                <div className="space-y-2 text-xs pt-2 border-t border-slate-800/80">
                  <p className="text-slate-300"><span className="font-semibold text-slate-400">Your Answer: </span>{q.answer.user_answer}</p>
                  <p className="text-blue-300"><span className="font-semibold">AI Evaluation: </span>{q.answer.feedback}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 3. LIVE INTERVIEW SESSION IN-PROGRESS VIEW
  const questions = interview.questions || [];
  const currentQ = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const answeredCount = questions.filter(q => q.answer !== null).length;

  return (
    <div className="max-w-3xl mx-auto py-6 animate-fade-in space-y-6 text-left">
      
      {/* Session Progress Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400">
            {interview.role} ({interview.difficulty})
          </span>
          <h2 className="text-base font-bold text-white mt-0.5">
            Question {currentQuestionIndex + 1} of {questions.length}
          </h2>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-1.5">
          {questions.map((q, idx) => {
            const isAnswered = q.answer !== null;
            const isCurrent = idx === currentQuestionIndex;

            return (
              <div
                key={q.id}
                onClick={() => {
                  setCurrentQuestionIndex(idx);
                  setUserAnswer(q.answer?.user_answer || '');
                  setLastEvaluation(q.answer || null);
                  setShowHint(false);
                }}
                className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center cursor-pointer transition-all ${
                  isCurrent
                    ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                    : isAnswered
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-900 text-slate-500 border border-slate-800'
                }`}
              >
                {idx + 1}
              </div>
            );
          })}
        </div>
      </div>

      {/* Question Box */}
      <div className="glass-card p-6 rounded-3xl border border-slate-700/80 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">
            {currentQ?.category}
          </span>

          {currentQ?.context_hint && (
            <button
              onClick={() => setShowHint(!showHint)}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              {showHint ? 'Hide Hint' : 'Show Answer Hint'}
            </button>
          )}
        </div>

        <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed mb-4">
          {currentQ?.question_text}
        </h3>

        {/* Hint Box */}
        {showHint && currentQ?.context_hint && (
          <div className="mb-4 p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200">
            <span className="font-bold">Hint: </span>{currentQ.context_hint}
          </div>
        )}

        {/* Answer Area */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Your Response:</span>
            <div className="flex items-center gap-2">
              {isRecording && (
                <span className="flex items-center gap-1.5 text-rose-400 font-bold animate-pulse text-xs">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Recording... ({recordingSeconds}s)
                </span>
              )}
              <button
                type="button"
                onClick={toggleRecording}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  isRecording
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                    : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
                }`}
              >
                {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                {isRecording ? 'Stop Voice Recording' : 'Voice Record Answer'}
              </button>
            </div>
          </div>

          <textarea
            rows={5}
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Type your explanation or click 'Voice Record Answer' to speak using your microphone..."
            className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-blue-500 rounded-2xl p-4 text-xs text-white placeholder-slate-500 outline-none leading-relaxed transition-all"
          />

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-500">
              Word count: {userAnswer.trim() ? userAnswer.trim().split(/\s+/).length : 0} words
            </span>

            <button
              onClick={handleSubmitAnswer}
              disabled={!userAnswer.trim() || isSubmitting}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/25 transition-all disabled:opacity-40 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  Evaluating Answer...
                </>
              ) : (
                <>
                  Submit Answer & Get Evaluation
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Immediate Live Question Evaluation Card */}
      {lastEvaluation && (
        <div className="glass-card p-6 rounded-3xl border border-blue-500/40 bg-blue-950/10 space-y-4 animate-fade-in shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">AI Evaluation Result</h4>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-emerald-400">{lastEvaluation.score} / 100</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Score</span>
            </div>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed font-medium">
            {lastEvaluation.feedback}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-emerald-500/30">
              <span className="text-[10px] font-bold text-emerald-400 uppercase block mb-1">Strengths:</span>
              <ul className="text-xs text-slate-300 space-y-1">
                {lastEvaluation.strengths?.map((s, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-400">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-amber-500/30">
              <span className="text-[10px] font-bold text-amber-400 uppercase block mb-1">To Improve:</span>
              <ul className="text-xs text-slate-300 space-y-1">
                {lastEvaluation.improvements?.map((imp, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-amber-400">•</span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Model Answer Structure */}
          {lastEvaluation.model_answer_structure && lastEvaluation.model_answer_structure.length > 0 && (
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] font-bold uppercase text-purple-400 block mb-1.5 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                Ideal Answer Blueprint:
              </span>
              <div className="space-y-1 text-[11px] text-slate-300">
                {lastEvaluation.model_answer_structure.map((step, idx) => (
                  <p key={idx} className="font-mono">{step}</p>
                ))}
              </div>
            </div>
          )}

          {/* Next Action Button */}
          <div className="pt-2 flex justify-end">
            {isLastQuestion ? (
              <button
                onClick={handleFinishInterview}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-500/20 flex items-center gap-2"
              >
                Complete Interview & View Scorecard ➔
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-500/20 flex items-center gap-2"
              >
                Proceed to Question {currentQuestionIndex + 2}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

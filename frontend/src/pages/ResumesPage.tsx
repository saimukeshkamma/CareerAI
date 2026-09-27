import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { resumeApi } from '../services/api';
import { Resume, ResumeAnalysis } from '../types';
import {
  Upload, FileText, CheckCircle2, AlertTriangle,
  Sparkles, Trash2, ArrowUpRight, Clock, Star,
  RefreshCw, Check, Download, ShieldCheck
} from 'lucide-react';
import { ScoreRing } from '../components/common/ScoreRing';
import { LoadingState } from '../components/common/LoadingState';
import { Modal } from '../components/common/Modal';

export const ResumesPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);

  // Upload State
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadStep, setUploadStep] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      setLoading(true);
      const data = await resumeApi.list();
      setResumes(data);
      if (data.length > 0) {
        // Select active or first
        const active = data.find(r => r.is_active) || data[0];
        setSelectedResume(active);
      }
    } catch (err) {
      showToast('Error', 'Failed to load resumes list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    try {
      setUploadProgress(10);
      setUploadStep(1); // Uploading

      setTimeout(() => {
        setUploadProgress(45);
        setUploadStep(2); // Text extracted
      }, 500);

      setTimeout(() => {
        setUploadProgress(78);
        setUploadStep(3); // Skills detected
      }, 1000);

      const res = await resumeApi.upload(file, file.name, (pct) => {
        setUploadProgress(Math.max(pct, 20));
      });

      setUploadProgress(100);
      setUploadStep(4); // Complete

      showToast('Resume Analyzed!', `Resume successfully parsed with score ${res.resume?.latest_analysis?.overall_score || 85}/100.`, 'success');
      await loadResumes();
    } catch (err: any) {
      showToast('Upload Failed', err.response?.data?.detail || 'Unable to parse resume file.', 'error');
    } finally {
      setTimeout(() => {
        setUploadProgress(null);
        setUploadStep(0);
      }, 1200);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleActivate = async (id: number) => {
    try {
      await resumeApi.activate(id);
      showToast('Active Resume Updated', 'This resume is now used for job matching and interview questions.', 'success');
      await loadResumes();
    } catch (err) {
      showToast('Error', 'Failed to activate resume.', 'error');
    }
  };

  const handleReanalyze = async (id: number) => {
    try {
      const res = await resumeApi.analyze(id);
      showToast('Analysis Refreshed', `Re-analyzed against current target role (${user?.target_role}).`, 'success');
      await loadResumes();
    } catch (err) {
      showToast('Error', 'Failed to re-analyze resume.', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this resume?")) return;
    try {
      await resumeApi.delete(id);
      showToast('Resume Deleted', 'Resume and its analysis have been removed.', 'info');
      await loadResumes();
    } catch (err) {
      showToast('Error', 'Failed to delete resume.', 'error');
    }
  };

  const analysis: ResumeAnalysis | undefined = selectedResume?.latest_analysis;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Resumes & ATS Audit</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluate ATS readability, extract competencies, and review bullet point enhancements
          </p>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 hover:scale-105"
        >
          <Upload className="w-4 h-4" />
          Upload New Resume
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
          }}
        />
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`glass-card p-8 rounded-3xl border-2 border-dashed text-center cursor-pointer transition-all duration-300 ${
          isDragging
            ? 'border-blue-500 bg-blue-950/20 scale-[1.01]'
            : 'border-slate-700/80 hover:border-blue-500/60 hover:bg-slate-900/40'
        }`}
      >
        {uploadProgress !== null ? (
          <div className="max-w-md mx-auto py-4">
            <div className="flex items-center justify-between text-xs font-bold text-white mb-2">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400 animate-spin" />
                {uploadStep === 1 && "Uploading Resume..."}
                {uploadStep === 2 && "Extracting Structured Text..."}
                {uploadStep === 3 && "Auditing ATS Keywords & Scoring..."}
                {uploadStep === 4 && "Analysis Complete!"}
              </span>
              <span className="text-blue-400">{uploadProgress}%</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Drag & drop your resume here</h3>
            <p className="text-xs text-slate-400 mb-3">Supports PDF, DOCX, or plain text up to 10MB</p>
            <span className="px-3.5 py-1 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-300 hover:text-white border border-slate-700">
              Browse Files
            </span>
          </div>
        )}
      </div>

      {/* Main Grid: Resume Selector (Left) & Deep ATS Analysis (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Manage Multiple Resumes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[11px] text-slate-400">
              My Resumes ({resumes.length})
            </h3>
          </div>

          <div className="space-y-2.5">
            {resumes.map((r) => {
              const isSelected = selectedResume?.id === r.id;
              const score = r.latest_analysis?.overall_score || 85;

              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedResume(r)}
                  className={`p-4 rounded-2xl glass-card border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-blue-500/80 bg-blue-950/20 shadow-lg shadow-blue-500/10'
                      : 'border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-xs font-bold text-white truncate">{r.title}</h4>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                          <span>{new Date(r.uploaded_at).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className="uppercase">{r.file_type}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`text-xs font-black px-2 py-0.5 rounded-md ${
                        score >= 85 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        {score}
                      </span>
                    </div>
                  </div>

                  {/* Actions row */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-xs">
                    {r.is_active ? (
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Active for Matching
                      </span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleActivate(r.id);
                        }}
                        className="text-[10px] text-slate-400 hover:text-blue-400 font-semibold"
                      >
                        Set as Active
                      </button>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReanalyze(r.id);
                        }}
                        className="p-1 text-slate-400 hover:text-white"
                        title="Re-analyze resume"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(r.id);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-400"
                        title="Delete resume"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Deep ATS Analysis Dashboard */}
        <div className="lg:col-span-2">
          {analysis ? (
            <div className="space-y-6">
              
              {/* Score Breakdown Banner */}
              <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-800">
                  <div className="flex items-center gap-6">
                    <ScoreRing score={analysis.overall_score} size={110} strokeWidth={9} label="Resume Score" />
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Target Role Fit</span>
                      <h3 className="text-lg font-black text-white mt-0.5">{user?.target_role || 'AI Engineer'}</h3>
                      <p className="text-xs text-slate-400 mt-1">
                        ATS Compatibility: <span className="font-bold text-emerald-400">{analysis.ats_score}%</span>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full sm:w-auto text-center">
                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                      <span className="text-sm font-bold text-white">{analysis.skills_score}%</span>
                      <p className="text-[9px] uppercase text-slate-400 font-semibold mt-0.5">Skills</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                      <span className="text-sm font-bold text-white">{analysis.experience_score}%</span>
                      <p className="text-[9px] uppercase text-slate-400 font-semibold mt-0.5">Experience</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                      <span className="text-sm font-bold text-white">{analysis.education_score}%</span>
                      <p className="text-[9px] uppercase text-slate-400 font-semibold mt-0.5">Education</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                      <span className="text-sm font-bold text-white">{analysis.formatting_score}%</span>
                      <p className="text-[9px] uppercase text-slate-400 font-semibold mt-0.5">Formatting</p>
                    </div>
                  </div>
                </div>

                {/* Extracted Skills Chips */}
                <div className="mt-6">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Identified Technical Skills ({analysis.extracted_skills?.length || 0})
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.extracted_skills?.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-950/40 border border-blue-500/30 text-blue-200"
                      >
                        ✓ {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Strengths & Weaknesses Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Strengths */}
                <div className="glass-card p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/10">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-3">
                    <CheckCircle2 className="w-4 h-4" />
                    Key Resume Strengths
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {analysis.strengths?.map((str, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="glass-card p-5 rounded-2xl border border-amber-500/30 bg-amber-950/10">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-3">
                    <AlertTriangle className="w-4 h-4" />
                    Areas to Improve
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {analysis.weaknesses?.map((w, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* AI Bullet Point Rewrites */}
              <div className="glass-card p-6 rounded-3xl border border-slate-800">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <h4 className="text-sm font-bold text-white">AI Bullet Point Enhancements</h4>
                </div>

                <div className="space-y-4">
                  {analysis.bullet_rewrites?.map((rewrite, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Before (Original)</span>
                        <p className="text-slate-400 line-through mt-0.5 italic">{rewrite.original}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">After (AI Enhanced with Metrics)</span>
                        <p className="text-emerald-200 font-medium mt-0.5">{rewrite.suggested}</p>
                      </div>
                      <div className="pt-2 border-t border-slate-800/60 text-[11px] text-blue-300">
                        <span className="font-semibold">Rationale: </span>{rewrite.impact_reason}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actionable Suggestions */}
              <div className="glass-card p-6 rounded-3xl border border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Tailored Action Plan
                </h4>
                <div className="space-y-2.5">
                  {analysis.suggestions?.map((sug, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300">
                      <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-bold text-[10px] flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <p className="leading-relaxed">{sug}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="glass-card p-12 rounded-3xl border border-slate-800 text-center">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-1">No Resume Selected</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
                Upload your resume above or select an existing resume from the list to view your full ATS breakdown.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { learningApi } from '../services/api';
import {
  LearningTopicBrief, LearningTopicDetail, LearningCategory,
  UserLearningProgress, PersonalizedLearningData, LearningVideo
} from '../types';
import {
  Tv, Sparkles, Search, Filter, BookOpen, Bookmark,
  CheckCircle2, Clock, Play, ExternalLink, ArrowRight,
  TrendingUp, Award, Layers, Code, Database, Cpu,
  Brain, Briefcase, Cloud, Check, ChevronRight, X,
  BookmarkCheck, Star, Users, Flame, AlertTriangle
} from 'lucide-react';
import { LoadingState } from '../components/common/LoadingState';

interface LearningHubPageProps {
  onNavigate?: (tab: string, contextId?: any) => void;
  initialTopic?: string;
}

export const LearningHubPage: React.FC<LearningHubPageProps> = ({ onNavigate, initialTopic }) => {
  const { showToast } = useNotifications();

  // Active view tab: 'for-you' | 'library' | 'my-learning'
  const [activeTab, setActiveTab] = useState<'for-you' | 'library' | 'my-learning'>(
    initialTopic ? 'library' : 'for-you'
  );

  // Data state
  const [categories, setCategories] = useState<LearningCategory[]>([]);
  const [topics, setTopics] = useState<LearningTopicBrief[]>([]);
  const [forYouData, setForYouData] = useState<PersonalizedLearningData | null>(null);
  const [myLearning, setMyLearning] = useState<{
    in_progress: UserLearningProgress[];
    completed: UserLearningProgress[];
    saved: UserLearningProgress[];
    total_active_topics: number;
    total_completed_topics: number;
    total_saved_topics: number;
  } | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');

  // Active detailed topic modal / drawer
  const [selectedTopicDetail, setSelectedTopicDetail] = useState<LearningTopicDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Embedded video player modal
  const [activePlayingVideo, setActivePlayingVideo] = useState<LearningVideo | null>(null);

  const [loading, setLoading] = useState(true);

  // Category Icon helper
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Programming': return <Code className="w-4 h-4 text-emerald-400" />;
      case 'Artificial Intelligence': return <Brain className="w-4 h-4 text-purple-400" />;
      case 'Data': return <Database className="w-4 h-4 text-cyan-400" />;
      case 'Machine Learning': return <Cpu className="w-4 h-4 text-blue-400" />;
      case 'Deep Learning': return <Layers className="w-4 h-4 text-indigo-400" />;
      case 'Interview Preparation': return <Briefcase className="w-4 h-4 text-amber-400" />;
      case 'Cloud & DevOps': return <Cloud className="w-4 h-4 text-sky-400" />;
      default: return <BookOpen className="w-4 h-4 text-blue-400" />;
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (initialTopic) {
      openTopicModal(initialTopic);
      setSearchQuery(initialTopic);
    }
  }, [initialTopic]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [cats, tops, forYou, myL] = await Promise.all([
        learningApi.getCategories(),
        learningApi.getTopics(),
        learningApi.getForYou(),
        learningApi.getMyLearning()
      ]);
      setCategories(cats);
      setTopics(tops);
      setForYouData(forYou);
      setMyLearning(myL);
    } catch (err) {
      console.error('Failed to load learning hub data:', err);
      showToast('Error', 'Failed to load learning resources.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchFilter = async (q: string, cat: string, diff: string) => {
    setSearchQuery(q);
    setSelectedCategory(cat);
    setSelectedDifficulty(diff);
    try {
      const filtered = await learningApi.getTopics({
        q: q || undefined,
        category: cat !== 'All' ? cat : undefined,
        difficulty: diff !== 'All' ? diff : undefined
      });
      setTopics(filtered);
    } catch (err) {
      console.error(err);
    }
  };

  const openTopicModal = async (idOrSlug: string | number) => {
    try {
      setLoadingDetail(true);
      const detail = await learningApi.getTopic(idOrSlug);
      setSelectedTopicDetail(detail);
    } catch (err) {
      showToast('Notice', 'Opening learning topic overview.', 'info');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleUpdateProgress = async (topicId: number, status: string, progress: number) => {
    try {
      await learningApi.updateProgress({
        topic_id: topicId,
        status,
        progress
      });
      showToast('Progress Updated', `Topic marked as ${status.replace('_', ' ').toLowerCase()} (${progress}%).`, 'success');
      
      // Refresh user progress
      const [tops, myL] = await Promise.all([
        learningApi.getTopics({
          q: searchQuery || undefined,
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          difficulty: selectedDifficulty !== 'All' ? selectedDifficulty : undefined
        }),
        learningApi.getMyLearning()
      ]);
      setTopics(tops);
      setMyLearning(myL);

      if (selectedTopicDetail && selectedTopicDetail.id === topicId) {
        setSelectedTopicDetail(prev => prev ? { ...prev, user_status: status, user_progress: progress } : null);
      }
    } catch (err) {
      showToast('Error', 'Failed to update progress.', 'error');
    }
  };

  const handleToggleSave = async (topicId: number, currentSaved: boolean) => {
    try {
      await learningApi.updateProgress({
        topic_id: topicId,
        is_saved: !currentSaved
      });
      showToast(
        !currentSaved ? 'Saved to Watch Later' : 'Removed from Watch Later',
        !currentSaved ? 'Topic added to My Learning collection.' : 'Topic removed from saved list.',
        'info'
      );
      // Refresh list
      const [tops, myL] = await Promise.all([
        learningApi.getTopics({
          q: searchQuery || undefined,
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          difficulty: selectedDifficulty !== 'All' ? selectedDifficulty : undefined
        }),
        learningApi.getMyLearning()
      ]);
      setTopics(tops);
      setMyLearning(myL);

      if (selectedTopicDetail && selectedTopicDetail.id === topicId) {
        setSelectedTopicDetail(prev => prev ? { ...prev, is_saved: !currentSaved } : null);
      }
    } catch (err) {
      showToast('Error', 'Failed to update saved status.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="py-24">
        <LoadingState title="Loading AI-Personalized Learning Hub..." />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-left pb-16">
      
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl glass-card border border-blue-500/25 bg-gradient-to-r from-blue-950/40 via-purple-950/20 to-slate-900 shadow-2xl">
        <div className="absolute -right-12 -top-12 w-56 h-56 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1.5">
                <Tv className="w-3 h-3" />
                Multi-Creator YouTube Library
              </span>
              <span className="text-xs text-slate-400 font-semibold">• AI Weakness Aligned</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              AI-Personalized Learning Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Target your exact interview weak spots with vetted YouTube masterclasses from top creators like 
              <span className="text-blue-300 font-semibold"> 3Blue1Brown, StatQuest, FreeCodeCamp, Andrej Karpathy</span>, and more. Choose the teaching style you learn best with.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
              <span className="text-base font-black text-white">{topics.length}</span>
              <p className="text-[10px] uppercase font-semibold text-slate-400 mt-0.5">Core Topics</p>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
              <span className="text-base font-black text-purple-400">{myLearning?.in_progress.length || 0}</span>
              <p className="text-[10px] uppercase font-semibold text-slate-400 mt-0.5">In Progress</p>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
              <span className="text-base font-black text-emerald-400">{myLearning?.completed.length || 0}</span>
              <p className="text-[10px] uppercase font-semibold text-slate-400 mt-0.5">Completed</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('for-you')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'for-you'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>🎯 For You (AI Recommendations)</span>
            {forYouData?.weak_topics && forYouData.weak_topics.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-rose-500/80 text-white">
                {forYouData.weak_topics.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('library')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'library'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>📚 Explore Topic Library</span>
          </button>

          <button
            onClick={() => setActiveTab('my-learning')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'my-learning'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Star className="w-3.5 h-3.5 text-amber-400" />
            <span>⭐ My Learning</span>
            {(myLearning?.total_saved_topics || 0) + (myLearning?.total_active_topics || 0) > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-indigo-500/80 text-white">
                {(myLearning?.total_saved_topics || 0) + (myLearning?.total_active_topics || 0)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 2. TAB CONTENT: FOR YOU (AI RECOMMENDATIONS) */}
      {activeTab === 'for-you' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Targeted AI Improvement Tracks
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {forYouData?.latest_interview_role ? (
                  <>Based on your latest mock interview evaluation for <span className="text-white font-semibold">{forYouData.latest_interview_role}</span></>
                ) : (
                  <>Derived from your verified resume skills and target role requirements</>
                )}
              </p>
            </div>

            {forYouData?.strong_topics && forYouData.strong_topics.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Verified strengths: {forYouData.strong_topics.slice(0, 2).join(', ')}</span>
              </div>
            )}
          </div>

          {/* Weak Topics List */}
          {(!forYouData?.weak_topics || forYouData.weak_topics.length === 0) ? (
            <div className="p-8 text-center rounded-2xl glass-card border border-slate-800 space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-sm font-bold text-white">No Critical Weaknesses Identified!</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                You performed well in your recent assessments. Browse our topic library to advance your system design and distributed ML skills.
              </p>
              <button
                onClick={() => setActiveTab('library')}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500"
              >
                Browse All Topics
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {forYouData.weak_topics.map((item, idx) => (
                <div
                  key={idx}
                  className="glass-card p-6 rounded-3xl border border-slate-800 hover:border-blue-500/40 transition-all space-y-5"
                >
                  {/* Topic Header & Why It Needs Improvement */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-800/80">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {item.performance_level}
                        </span>
                        <span className="text-xs text-slate-400 font-semibold">Score: {item.score}/100</span>
                      </div>
                      <h3 className="text-lg font-bold text-white">{item.topic_name}</h3>
                      <p className="text-xs text-rose-300/90 mt-1 max-w-2xl leading-relaxed">
                        <span className="font-semibold text-rose-400">Why to improve: </span>
                        {item.reason}
                      </p>
                    </div>

                    <button
                      onClick={() => openTopicModal(item.topic_slug || item.topic_name)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-blue-400 hover:text-white glass-card hover:bg-blue-600 transition-all flex items-center gap-1.5 shrink-0"
                    >
                      <span>Explore Topic</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Multi-Creator Video Options */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Choose Your Preferred YouTube Creator:
                      </p>
                      <span className="text-[10px] text-slate-500">Pick the explanation style you connect with best</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {item.recommended_videos.slice(0, 3).map((video, vIdx) => (
                        <div
                          key={vIdx}
                          className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between group"
                        >
                          <div>
                            {/* Video Thumbnail Preview */}
                            <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 mb-3 border border-slate-800">
                              <img
                                src={video.thumbnail_url}
                                alt={video.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  (e.target as any).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80';
                                }}
                              />
                              <div className="absolute inset-0 bg-slate-950/30 group-hover:bg-transparent transition-colors" />
                              
                              {/* Duration Pill */}
                              {video.duration && (
                                <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-bold text-white">
                                  {video.duration}
                                </span>
                              )}

                              {/* Play Overlay */}
                              <button
                                onClick={() => setActivePlayingVideo(video)}
                                className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-rose-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                title="Play in CareerAI"
                              >
                                <Play className="w-4 h-4 fill-white ml-0.5" />
                              </button>
                            </div>

                            {/* Creator Name & Style Badge */}
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="text-xs font-bold text-indigo-400 truncate">
                                🎥 {video.channel_name}
                              </span>
                              {video.teaching_style && (
                                <span className="text-[9px] font-semibold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                                  {video.teaching_style}
                                </span>
                              )}
                            </div>

                            <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug">
                              {video.title}
                            </h4>
                          </div>

                          {/* Action Buttons */}
                          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
                            <button
                              onClick={() => setActivePlayingVideo(video)}
                              className="flex-1 py-1.5 rounded-lg text-[11px] font-bold bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-1"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              Watch
                            </button>
                            <a
                              href={video.youtube_url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                              title="Open on YouTube"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. TAB CONTENT: EXPLORE TOPIC LIBRARY */}
      {activeTab === 'library' && (
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search topics (e.g. Backpropagation, CNN, SQL Joins, Overfitting, Docker, React)..."
                  value={searchQuery}
                  onChange={(e) => handleSearchFilter(e.target.value, selectedCategory, selectedDifficulty)}
                  className="w-full bg-slate-900 border border-slate-700/80 text-xs font-semibold text-white pl-9 pr-4 py-2.5 rounded-xl outline-none focus:border-blue-500 placeholder-slate-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => handleSearchFilter('', selectedCategory, selectedDifficulty)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Difficulty selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-400 hidden sm:inline">Level:</span>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => handleSearchFilter(searchQuery, selectedCategory, e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-xs font-bold text-white rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                >
                  <option value="All">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => handleSearchFilter(searchQuery, 'All', selectedDifficulty)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedCategory === 'All'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                All Categories ({topics.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.category}
                  onClick={() => handleSearchFilter(searchQuery, cat.category, selectedDifficulty)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    selectedCategory === cat.category
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {getCategoryIcon(cat.category)}
                  <span>{cat.category}</span>
                  <span className="text-[10px] opacity-70">({cat.topic_count})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Topic Cards Grid */}
          {topics.length === 0 ? (
            <div className="py-16 text-center rounded-2xl glass-card border border-slate-800 space-y-3">
              <Search className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-white">No Topics Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No learning resources match "{searchQuery}". Try searching for concepts like "SQL", "Regression", or "Neural Networks".
              </p>
              <button
                onClick={() => handleSearchFilter('', 'All', 'All')}
                className="px-4 py-2 rounded-xl text-xs font-bold text-blue-400 glass-card hover:bg-blue-600 hover:text-white"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {topics.map((t) => {
                const isCompleted = t.user_status === 'COMPLETED' || t.user_progress >= 100;
                const isInProgress = t.user_status === 'IN_PROGRESS' || (t.user_progress > 0 && !isCompleted);

                return (
                  <div
                    key={t.id}
                    className="glass-card p-5 rounded-3xl border border-slate-800 hover:border-blue-500/40 transition-all flex flex-col justify-between group hover:-translate-y-1 duration-200"
                  >
                    <div>
                      {/* Top Bar: Category & Bookmark */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-[10px] font-bold text-slate-300">
                          {getCategoryIcon(t.category)}
                          <span>{t.category}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            t.difficulty === 'Beginner' ? 'bg-emerald-500/20 text-emerald-400' :
                            t.difficulty === 'Intermediate' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                          }`}>
                            {t.difficulty}
                          </span>

                          <button
                            onClick={() => handleToggleSave(t.id, t.is_saved)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              t.is_saved ? 'text-amber-400 bg-amber-500/10' : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800'
                            }`}
                            title={t.is_saved ? 'Saved in My Learning' : 'Save to Watch Later'}
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${t.is_saved ? 'fill-amber-400' : ''}`} />
                          </button>
                        </div>
                      </div>

                      {/* Topic Title & Description */}
                      <h3
                        onClick={() => openTopicModal(t.slug)}
                        className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors cursor-pointer line-clamp-1"
                      >
                        {t.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {t.description}
                      </p>

                      {/* Subtopics preview */}
                      {t.subtopics && t.subtopics.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {t.subtopics.slice(0, 3).map((st, i) => (
                            <span key={i} className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-slate-900/80 text-slate-400 border border-slate-800/80">
                              {st}
                            </span>
                          ))}
                          {t.subtopics.length > 3 && (
                            <span className="text-[9px] text-slate-500 px-1 py-0.5">+{t.subtopics.length - 3}</span>
                          )}
                        </div>
                      )}

                      {/* Creators Badge */}
                      {t.creators && t.creators.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-800/70 flex items-center justify-between text-[10px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-indigo-400" />
                            {t.creators.length} Creators
                          </span>
                          <span className="truncate max-w-[140px] text-slate-300 font-medium">
                            {t.creators.slice(0, 2).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Footer: User Progress & Learn Button */}
                    <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                      {/* Progress Bar */}
                      {t.user_progress > 0 && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className={isCompleted ? 'text-emerald-400 font-bold' : 'text-blue-400 font-bold'}>
                              {isCompleted ? 'Completed' : 'In Progress'}
                            </span>
                            <span className="text-slate-400 font-bold">{t.user_progress}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`}
                              style={{ width: `${t.user_progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => openTopicModal(t.slug)}
                        className="w-full py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-blue-600 transition-colors flex items-center justify-center gap-1.5 border border-slate-700/80 group-hover:border-blue-500"
                      >
                        <span>Choose Creator & Learn</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. TAB CONTENT: MY LEARNING */}
      {activeTab === 'my-learning' && (
        <div className="space-y-8">
          {/* Status summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-card p-5 rounded-2xl border border-blue-500/30 bg-blue-950/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Currently Learning</span>
              <h3 className="text-2xl font-black text-white mt-1">{myLearning?.total_active_topics || 0}</h3>
              <p className="text-xs text-slate-400 mt-1">Active courses in progress</p>
            </div>
            <div className="glass-card p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Completed Milestones</span>
              <h3 className="text-2xl font-black text-white mt-1">{myLearning?.total_completed_topics || 0}</h3>
              <p className="text-xs text-slate-400 mt-1">Mastered interview topics</p>
            </div>
            <div className="glass-card p-5 rounded-2xl border border-amber-500/30 bg-amber-950/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Watch Later Saved</span>
              <h3 className="text-2xl font-black text-white mt-1">{myLearning?.total_saved_topics || 0}</h3>
              <p className="text-xs text-slate-400 mt-1">Bookmarked for future study</p>
            </div>
          </div>

          {/* In-Progress Topics */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              In Progress ({myLearning?.in_progress.length || 0})
            </h3>

            {(!myLearning?.in_progress || myLearning.in_progress.length === 0) ? (
              <p className="text-xs text-slate-500 italic p-4 glass-card rounded-2xl">
                No courses currently in progress. Select any topic in the Explore Library to begin learning.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myLearning.in_progress.map((item) => (
                  <div key={item.id} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{item.topic_name}</span>
                      <span className="text-xs font-extrabold text-blue-400">{item.progress}%</span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-400">{item.category} • {item.difficulty}</span>
                      <button
                        onClick={() => openTopicModal(item.topic_slug)}
                        className="text-xs font-bold text-blue-400 hover:text-white flex items-center gap-1"
                      >
                        Continue <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Saved / Watch Later */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-indigo-400" />
              Saved / Watch Later ({myLearning?.saved.length || 0})
            </h3>

            {(!myLearning?.saved || myLearning.saved.length === 0) ? (
              <p className="text-xs text-slate-500 italic p-4 glass-card rounded-2xl">
                You haven't bookmarked any topics yet. Click the bookmark icon on any topic card to save it here.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {myLearning.saved.map((item) => (
                  <div key={item.id} className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">{item.topic_name}</h4>
                      <p className="text-[10px] text-slate-400">{item.category}</p>
                    </div>
                    <button
                      onClick={() => openTopicModal(item.topic_slug)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white transition-colors"
                    >
                      Start
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Completed Milestones */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Completed Topics ({myLearning?.completed.length || 0})
            </h3>

            {(!myLearning?.completed || myLearning.completed.length === 0) ? (
              <p className="text-xs text-slate-500 italic p-4 glass-card rounded-2xl">
                Topics you mark as 100% complete will be archived here for review before your technical interviews.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {myLearning.completed.map((item) => (
                  <div key={item.id} className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-xs font-bold text-white truncate">{item.topic_name}</span>
                    </div>
                    <button
                      onClick={() => openTopicModal(item.topic_slug)}
                      className="text-[10px] text-slate-400 hover:text-white"
                    >
                      Review
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. TOPIC DETAIL MODAL / DRAWER (MULTIPLE CREATORS VIEW) */}
      {selectedTopicDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="glass-card w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-700 p-6 sm:p-8 shadow-2xl relative space-y-6 text-left">
            {/* Close Button */}
            <button
              onClick={() => setSelectedTopicDetail(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {selectedTopicDetail.category}
                </span>
                <span className="text-xs text-slate-400 font-semibold">• {selectedTopicDetail.difficulty} Level</span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                {selectedTopicDetail.name}
              </h2>
            </div>

            {/* AI Concept Overview & Why Learn It */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5" />
                  What is it? (AI Concept Breakdown)
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedTopicDetail.description}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" />
                  Why should you learn it?
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedTopicDetail.why_learn || 'Crucial for high-scoring technical interviews and production system reliability.'}
                </p>
              </div>
            </div>

            {/* Subtopics Checklist */}
            {selectedTopicDetail.subtopics && selectedTopicDetail.subtopics.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Key Concepts Covered In This Topic:
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedTopicDetail.subtopics.map((st, i) => (
                    <span key={i} className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700/60 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-400" />
                      {st}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Progress Actions Toolbar */}
            <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/20 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-white">Your Learning Status:</span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                  selectedTopicDetail.user_progress >= 100 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                  selectedTopicDetail.user_progress > 0 ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                  'bg-slate-800 text-slate-400'
                }`}>
                  {selectedTopicDetail.user_progress >= 100 ? 'Completed' :
                   selectedTopicDetail.user_progress > 0 ? `In Progress (${selectedTopicDetail.user_progress}%)` : 'Not Started'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUpdateProgress(selectedTopicDetail.id, 'IN_PROGRESS', 50)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                >
                  Mark 50%
                </button>
                <button
                  onClick={() => handleUpdateProgress(selectedTopicDetail.id, 'COMPLETED', 100)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/20 transition-all"
                >
                  Mark 100% Done
                </button>
                <button
                  onClick={() => handleToggleSave(selectedTopicDetail.id, selectedTopicDetail.is_saved)}
                  className={`p-2 rounded-xl border transition-colors ${
                    selectedTopicDetail.is_saved
                      ? 'border-amber-500/40 text-amber-400 bg-amber-500/10'
                      : 'border-slate-700 text-slate-400 hover:text-white'
                  }`}
                  title={selectedTopicDetail.is_saved ? 'Saved in Watch Later' : 'Save for Watch Later'}
                >
                  <Bookmark className={`w-4 h-4 ${selectedTopicDetail.is_saved ? 'fill-amber-400' : ''}`} />
                </button>
              </div>
            </div>

            {/* Multiple Creators Video Options */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    Recommended YouTube Creators ({selectedTopicDetail.videos.length})
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Choose your preferred creator and explanation style
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedTopicDetail.videos.map((video) => (
                  <div
                    key={video.id}
                    className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Video Thumbnail */}
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 mb-3 border border-slate-800">
                        <img
                          src={video.thumbnail_url}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-transparent transition-colors" />
                        
                        {video.duration && (
                          <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-bold text-white">
                            {video.duration}
                          </span>
                        )}

                        <button
                          onClick={() => setActivePlayingVideo(video)}
                          className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-rose-600/90 text-white flex items-center justify-center opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all shadow-xl"
                        >
                          <Play className="w-5 h-5 fill-white ml-0.5" />
                        </button>
                      </div>

                      {/* Creator Info */}
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-xs font-bold text-indigo-400">
                          🎥 {video.channel_name}
                        </span>
                        {video.teaching_style && (
                          <span className="text-[10px] font-semibold text-slate-300 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700/60">
                            {video.teaching_style}
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug">
                        {video.title}
                      </h4>

                      {video.description && (
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {video.description}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2">
                      <button
                        onClick={() => setActivePlayingVideo(video)}
                        className="flex-1 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        Watch in CareerAI
                      </button>
                      <a
                        href={video.youtube_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 glass-card hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1"
                      >
                        <span>YouTube</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. EMBEDDED VIDEO PLAYER MODAL */}
      {activePlayingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
          <div className="glass-card w-full max-w-4xl rounded-3xl border border-slate-700 p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold text-indigo-400">🎥 {activePlayingVideo.channel_name}</span>
                <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1 mt-0.5">
                  {activePlayingVideo.title}
                </h3>
              </div>
              <button
                onClick={() => setActivePlayingVideo(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 16:9 Video Iframe */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-2xl">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activePlayingVideo.video_id}?autoplay=1&rel=0`}
                title={activePlayingVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>

            {/* Quick Completion Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <p className="text-xs text-slate-400">
                Watching: <span className="text-white font-medium">{activePlayingVideo.teaching_style || 'Educational Walkthrough'}</span>
              </p>

              <div className="flex items-center gap-2">
                <a
                  href={activePlayingVideo.youtube_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 glass-card hover:bg-slate-800 flex items-center gap-1.5"
                >
                  <span>Open on YouTube</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => {
                    handleUpdateProgress(activePlayingVideo.topic_id, 'COMPLETED', 100);
                    setActivePlayingVideo(null);
                  }}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                >
                  Mark Topic Complete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

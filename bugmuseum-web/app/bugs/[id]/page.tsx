'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getBugs, getComments, addComment, acceptSolution, summarizeBug, deleteBug } from '@/services/api';
import { BugExhibit } from '@/types/bug';
import { ExhibitComment } from '@/services/api';

function subscribe() { return () => { }; }
function getSnapshot() { return localStorage.getItem('username'); }
function getServerSnapshot() { return null; }

export default function BugDetailPage() {
    const params = useParams();
    const router = useRouter();
    const bugId = Number(params.id);
    const username = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    const [bug, setBug] = useState<BugExhibit | null>(null);
    const [comments, setComments] = useState<ExhibitComment[]>([]);

    // Input states for both Solution Proposals and General Comments
    const [newSolution, setNewSolution] = useState('');
    const [generalComment, setGeneralComment] = useState('');

    const [submittingSolution, setSubmittingSolution] = useState(false);
    const [submittingComment, setSubmittingComment] = useState(false);
    const [acceptingId, setAcceptingId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    // AI Summary State
    const [aiSummary, setAiSummary] = useState<string | null>(null);
    const [summarizing, setSummarizing] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                const bugsData = await getBugs();
                const found = bugsData.find((b) => b.id === bugId);
                if (found) setBug(found);

                const commentsData = await getComments(bugId);
                setComments(commentsData);
            } catch (err) {
                console.error('Failed to load exhibit detail:', err);
            }
        }
        fetchData();
    }, [bugId]);

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to remove this exhibit from the Museum? This action cannot be undone.')) {
            return;
        }

        setDeleting(true);
        try {
            await deleteBug(bugId);
            router.push('/gallery');
        } catch (err) {
            console.error('Failed to delete exhibit:', err);
            alert('Failed to delete exhibit. Ensure you have permission.');
            setDeleting(false);
        }
    };

    const handlePostSolution = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSolution.trim() || submittingSolution) return;
        setSubmittingSolution(true);
        try {
            const created = await addComment(bugId, `[PROPOSED SOLUTION] ${newSolution.trim()}`);
            setComments((prev) => [created, ...prev]);
            setNewSolution('');
        } catch (err) {
            alert('Failed to submit solution proposal. Make sure you are logged in!');
        } finally {
            setSubmittingSolution(false);
        }
    };

    const handlePostGeneralComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!generalComment.trim() || submittingComment) return;
        setSubmittingComment(true);
        try {
            const created = await addComment(bugId, generalComment.trim());
            setComments((prev) => [created, ...prev]);
            setGeneralComment('');
        } catch (err) {
            alert('Failed to submit comment. Make sure you are logged in!');
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleAccept = async (commentId: number) => {
        if (acceptingId !== null) return;
        setAcceptingId(commentId);
        try {
            await acceptSolution(bugId, commentId);
            setBug((prev) =>
                prev ? { ...prev, isResolved: true, isOpenQuestion: true, acceptedCommentId: commentId } : null
            );
        } catch (err) {
            alert('Failed to accept solution. Only the exhibit curator can mark solutions as accepted.');
        } finally {
            setAcceptingId(null);
        }
    };

    const handleGenerateAiSummary = async () => {
        if (summarizing) return;
        setSummarizing(true);
        try {
            const result = await summarizeBug(bugId);
            setAiSummary(result.summary);
        } catch (err) {
            console.error('Failed to generate AI summary:', err);
            alert('Could not generate AI summary at this moment.');
        } finally {
            setSummarizing(false);
        }
    };

    if (!bug) {
        return (
            <main className="min-h-screen bg-slate-950 text-slate-100 p-8 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            </main>
        );
    }

    const isAuthor = username && username === bug.authorUsername;
    const isUnresolved = Boolean(bug.isOpenQuestion) && !Boolean(bug.isResolved);

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Navigation Bar */}
                <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                    <Link
                        href="/gallery"
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs rounded-xl border border-slate-800 transition-all"
                    >
                        ← Back to Gallery
                    </Link>
                    <span className="text-xs text-slate-400">
                        Exhibit #{bug.id} • Curator: <strong className="text-amber-400">{bug.authorUsername}</strong> • {new Date(bug.createdAt).toLocaleDateString()}
                    </span>
                </div>

                {/* Main Exhibit Overview Header */}
                <article className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                        <div className="flex flex-wrap items-center gap-2">
                            {isUnresolved ? (
                                <span className="px-2.5 py-0.5 bg-purple-500/20 text-purple-400 text-[11px] font-semibold rounded-full border border-purple-500/30 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
                                    Open Question
                                </span>
                            ) : (
                                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[11px] font-semibold rounded-full border border-emerald-500/30">
                                    ✓ Resolved Post-Mortem
                                </span>
                            )}
                            <span className="px-2.5 py-0.5 bg-amber-400/10 text-amber-400 text-[11px] font-semibold rounded-full border border-amber-400/20">
                                {bug.programmingLanguage}
                            </span>
                            <span className="px-2.5 py-0.5 bg-purple-400/10 text-purple-400 text-[11px] font-semibold rounded-full border border-purple-400/20">
                                {bug.category}
                            </span>
                            <span className="px-2.5 py-0.5 bg-slate-800 text-slate-300 text-[11px] font-semibold rounded-full border border-slate-700">
                                {bug.difficulty}
                            </span>
                        </div>

                        {/* Author Management Actions + AI Brief */}
                        <div className="flex items-center gap-2">
                            {isAuthor && (
                                <>
                                    <Link
                                        href={`/bugs/${bug.id}/edit`}
                                        className="px-3 py-1.5 bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/30 font-bold text-xs rounded-xl transition-all"
                                    >
                                        ✏️ Edit
                                    </Link>
                                    <button
                                        onClick={handleDelete}
                                        disabled={deleting}
                                        className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs rounded-xl transition-all disabled:opacity-50"
                                    >
                                        {deleting ? 'Removing...' : '🗑️ Delete'}
                                    </button>
                                </>
                            )}

                            <button
                                onClick={handleGenerateAiSummary}
                                disabled={summarizing}
                                className="px-3 py-1.5 bg-purple-950/50 hover:bg-purple-900/50 text-purple-300 border border-purple-500/40 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
                            >
                                <span>🤖</span>
                                <span>{summarizing ? 'Generating...' : 'AI Brief'}</span>
                            </button>
                        </div>
                    </div>

                    <h1 className="text-2xl font-black text-slate-100">{bug.title}</h1>

                    {/* AI Executive Summary Block */}
                    {aiSummary && (
                        <div className="p-4 bg-purple-950/40 border border-purple-500/30 rounded-2xl space-y-2">
                            <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider block">
                                🤖 AI Curator Executive Summary
                            </span>
                            <p className="text-xs text-purple-200 leading-relaxed whitespace-pre-line">{aiSummary}</p>
                        </div>
                    )}

                    {/* AI Diagnostic Hint (For Open Questions) */}
                    {isUnresolved && bug.aiDiagnosticHint && (
                        <div className="p-4 bg-purple-950/30 border border-purple-500/30 rounded-2xl space-y-1">
                            <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider block">
                                🤖 AI Curator Initial Diagnostic
                            </span>
                            <p className="text-xs text-purple-200 italic leading-relaxed">{`"${bug.aiDiagnosticHint}"`}</p>
                        </div>
                    )}

                    {/* Core Problem Specifications */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Expected Behavior</span>
                            <p className="text-xs text-slate-300 leading-relaxed">{bug.expectedBehavior}</p>
                        </div>
                        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Actual Behavior / Error Details</span>
                            <p className="text-xs text-slate-300 leading-relaxed">{bug.actualBehavior}</p>
                        </div>
                    </div>

                    {/* Post-Mortem Analytical Data (Root Cause, Solution, Lessons Learned) */}
                    {(!isUnresolved || bug.solution) && (
                        <div className="space-y-4 pt-4 border-t border-slate-800">
                            {bug.rootCause && (
                                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">🔍 Root Cause Analysis</span>
                                    <p className="text-xs text-slate-300 leading-relaxed">{bug.rootCause}</p>
                                </div>
                            )}

                            {bug.solution && (
                                <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl">
                                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">💡 Solution & Fix Applied</span>
                                    <p className="text-xs text-emerald-200 leading-relaxed whitespace-pre-line">{bug.solution}</p>
                                </div>
                            )}

                            {bug.lessonLearned && (
                                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">🧠 Key Takeaway / Lesson Learned</span>
                                    <p className="text-xs text-slate-300 leading-relaxed">{bug.lessonLearned}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Screenshot Exhibit Preview */}
                    {bug.imageUrl && (
                        <div className="pt-4 border-t border-slate-800 space-y-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Attached Screenshot Exhibit</span>
                            <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                                <img src={bug.imageUrl} alt={bug.title} className="w-full object-cover max-h-96" />
                            </div>
                        </div>
                    )}
                </article>

                {/* 1. Propose Solution Form (ONLY for Open Questions) */}
                {isUnresolved && (
                    <form onSubmit={handlePostSolution} className="bg-purple-950/20 border border-purple-500/30 p-6 rounded-2xl space-y-3 shadow-xl">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-purple-300">
                            💡 Propose a Solution / Fix (Author Can Accept)
                        </label>
                        <textarea
                            required
                            rows={3}
                            value={newSolution}
                            onChange={(e) => setNewSolution(e.target.value)}
                            placeholder="Provide a step-by-step fix or code snippet for the curator..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-purple-400 resize-none"
                        />
                        <button
                            type="submit"
                            disabled={submittingSolution}
                            className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs rounded-xl transition-all disabled:opacity-50"
                        >
                            {submittingSolution ? 'Submitting Solution...' : '🚀 Submit Solution Proposal'}
                        </button>
                    </form>
                )}

                {/* 2. General Comment Form (ALWAYS Available on ALL Questions & Post-Mortems) */}
                <form onSubmit={handlePostGeneralComment} className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-3 shadow-xl">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        💬 Leave a General Comment / Question
                    </label>
                    <textarea
                        required
                        rows={2}
                        value={generalComment}
                        onChange={(e) => setGeneralComment(e.target.value)}
                        placeholder="Ask a question, add feedback, or leave a thought on this exhibit..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-amber-400 resize-none"
                    />
                    <button
                        type="submit"
                        disabled={submittingComment}
                        className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-all disabled:opacity-50"
                    >
                        {submittingComment ? 'Posting...' : 'Post Comment'}
                    </button>
                </form>

                {/* Community Comments & Solutions List */}
                <section className="space-y-4">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Discussion & Solutions ({comments.length})
                    </h2>

                    {comments.length === 0 ? (
                        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-500">
                            No comments or solutions posted yet. Be the first to comment!
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {comments.map((c) => {
                                const isAccepted = bug.acceptedCommentId === c.id;

                                return (
                                    <div
                                        key={c.id}
                                        className={`p-5 rounded-2xl border transition-all ${isAccepted
                                                ? 'bg-emerald-950/20 border-emerald-500/40 shadow-lg'
                                                : 'bg-slate-900/60 border-slate-800'
                                            }`}
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-semibold text-slate-300">
                                                Curator: <strong className="text-amber-400">{c.authorUsername}</strong>
                                            </span>
                                            <span className="text-[10px] text-slate-500">
                                                {new Date(c.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <p className="text-xs text-slate-200 leading-relaxed mb-4">{c.text}</p>

                                        <div className="flex justify-between items-center pt-2 border-t border-slate-800/60">
                                            {isAccepted ? (
                                                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                                                    ✓ Accepted Solution
                                                </span>
                                            ) : isAuthor && isUnresolved ? (
                                                <button
                                                    onClick={() => handleAccept(c.id)}
                                                    disabled={acceptingId === c.id}
                                                    className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-lg transition-all"
                                                >
                                                    ✔ Mark as Accepted Fix
                                                </button>
                                            ) : null}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
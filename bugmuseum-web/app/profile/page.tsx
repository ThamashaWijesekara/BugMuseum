'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getMyExhibits, deleteBug, toggleUpvote } from '@/services/api';
import { BugExhibit } from '@/types/bug';

function subscribe() {
    return () => { };
}

function getSnapshot() {
    return localStorage.getItem('username');
}

function getServerSnapshot() {
    return null;
}

export default function ProfilePage() {
    const router = useRouter();
    const username = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    const [myBugs, setMyBugs] = useState<BugExhibit[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [upvotingId, setUpvotingId] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<'exhibits' | 'overview'>('exhibits');

    useEffect(() => {
        let isMounted = true;

        const fetchUserExhibits = async () => {
            try {
                const data = await getMyExhibits();
                if (isMounted) {
                    setMyBugs(data);
                }
            } catch (err: unknown) {
                console.error('Failed to fetch user exhibits:', err);
                if (isMounted) {
                    setError('Could not load your exhibits. Please make sure you are logged in.');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchUserExhibits();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleUpvote = async (id: number) => {
        if (upvotingId !== null) return;
        setUpvotingId(id);

        try {
            const result = await toggleUpvote(id);

            // Force state update using the EXACT payload returned by the server
            setMyBugs((prevBugs) =>
                prevBugs.map((b) =>
                    b.id === id
                        ? {
                            ...b,
                            upvoteCount: result.upvoteCount,
                            hasUpvoted: result.hasUpvoted,
                        }
                        : b
                )
            );
        } catch (err) {
            console.error('Failed to upvote exhibit:', err);
        } finally {
            setUpvotingId(null);
        }
    };

    const handleDelete = async (id: number) => {
        const confirmed = window.confirm('Are you sure you want to remove this exhibit from the museum?');
        if (!confirmed) return;

        setDeletingId(id);
        try {
            await deleteBug(id);
            setMyBugs((prev) => prev.filter((b) => b.id !== id));
        } catch (err: unknown) {
            console.error('Failed to delete exhibit:', err);
            alert('Failed to delete exhibit.');
        } finally {
            setDeletingId(null);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        router.push('/');
        router.refresh();
    };

    // Metrics
    const totalExhibits = myBugs.length;

    const totalUpvotes = myBugs.reduce((acc, bug: any) => {
        const count =
            bug?.upvoteCount ??
            bug?.UpvoteCount ??
            bug?.upVoteCount ??
            bug?.reactions?.length ??
            bug?.Reactions?.length ??
            0;
        return acc + Number(count);
    }, 0);

    const totalComments = myBugs.reduce((acc, bug: any) => {
        const count =
            bug?.commentCount ??
            bug?.CommentCount ??
            bug?.comments?.length ??
            bug?.Comments?.length ??
            0;
        return acc + Number(count);
    }, 0);

    const communityScore = (totalExhibits * 20) + (totalUpvotes * 10) + (totalComments * 5);

    const categoryCounts = myBugs.reduce((acc, bug) => {
        const cat = bug.category || 'Backend';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const topCategory = Object.keys(categoryCounts).length > 0
        ? Object.keys(categoryCounts).reduce((a, b) => (categoryCounts[a] > categoryCounts[b] ? a : b))
        : 'Backend';

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-950 text-slate-100 p-8 flex items-center justify-center">
                <div className="text-center space-y-3">
                    <div className="inline-block w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs text-slate-400 font-medium">Loading curator workspace...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-400 selection:text-slate-950">
            <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-slate-950/40 to-slate-950 -z-10" />

            {/* Navbar */}
            <nav className="border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/gallery"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 font-semibold text-xs rounded-xl border border-slate-800 transition-all"
                        >
                            ← Gallery
                        </Link>
                        <div className="flex items-center gap-2">
                            <Link href="/" className="text-xl font-black text-amber-400 tracking-wider">
                                🐛 BUG MUSEUM
                            </Link>
                            <span className="text-slate-700">/</span>
                            <span className="text-xs text-slate-400 font-semibold">Curator Profile</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/bugs/create"
                            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-amber-400/10"
                        >
                            + Submit Exhibit
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs rounded-xl transition-colors border border-slate-800"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
                {/* Profile Header */}
                <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                        <div className="flex items-center gap-5">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 p-0.5 shadow-xl">
                                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-black text-3xl text-amber-400 uppercase">
                                    {(username || 'C').charAt(0)}
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="px-2.5 py-0.5 bg-amber-400/10 text-amber-400 text-[10px] font-bold uppercase tracking-wider rounded-full border border-amber-400/20">
                                        Verified Curator
                                    </span>
                                </div>
                                <h1 className="text-3xl font-black text-slate-100 tracking-tight">
                                    {username || 'Curator'}
                                </h1>
                                <p className="text-xs text-slate-400 mt-1">
                                    Software Engineer & System Resiliency Post-Mortem Contributor
                                </p>
                            </div>
                        </div>

                        {/* Live Dynamic Stat Cards */}
                        <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
                            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-center min-w-[100px]">
                                <span className="block text-2xl font-black text-amber-400">{totalExhibits}</span>
                                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Exhibits</span>
                            </div>
                            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-center min-w-[100px]">
                                <span className="block text-2xl font-black text-purple-400">{totalUpvotes}</span>
                                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Upvotes</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Tab Selection */}
                <div className="flex border-b border-slate-800/80 gap-6 text-sm font-bold">
                    <button
                        onClick={() => setActiveTab('exhibits')}
                        className={`pb-3 transition-colors ${activeTab === 'exhibits'
                            ? 'text-amber-400 border-b-2 border-amber-400'
                            : 'text-slate-400 hover:text-slate-200'
                            }`}
                    >
                        My Curated Exhibits ({myBugs.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`pb-3 transition-colors ${activeTab === 'overview'
                            ? 'text-amber-400 border-b-2 border-amber-400'
                            : 'text-slate-400 hover:text-slate-200'
                            }`}
                    >
                        Impact & Specialization Overview
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'exhibits' ? (
                    <section className="space-y-6">
                        {error && (
                            <div className="bg-rose-950/50 border border-rose-500/50 text-rose-300 p-4 rounded-2xl text-xs">
                                {error}
                            </div>
                        )}

                        {!error && myBugs.length === 0 ? (
                            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-16 text-center space-y-4">
                                <div className="text-4xl">🏛️</div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-200">No exhibits published yet</h3>
                                </div>
                                <Link
                                    href="/bugs/create"
                                    className="inline-block px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-all"
                                >
                                    Document First Exhibit
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {myBugs.map((bug) => (
                                    <article
                                        key={bug.id}
                                        className="group bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 shadow-xl flex flex-col justify-between transition-all duration-300"
                                    >
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                                <span className="px-2.5 py-0.5 bg-amber-400/10 text-amber-400 text-[11px] font-semibold rounded-full border border-amber-400/20">
                                                    {bug.programmingLanguage}
                                                </span>
                                                <span className="px-2.5 py-0.5 bg-purple-400/10 text-purple-400 text-[11px] font-semibold rounded-full border border-purple-400/20">
                                                    {bug.category || 'Backend'}
                                                </span>
                                                <span
                                                    className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full border ${bug.difficulty === 'Senior Nightmare'
                                                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                                        : bug.difficulty === 'Intermediate'
                                                            ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                        }`}
                                                >
                                                    {bug.difficulty || 'Intermediate'}
                                                </span>
                                            </div>

                                            <Link href={`/bugs/${bug.id}`}>
                                                <h3 className="text-lg font-bold text-slate-100 group-hover:text-amber-400 transition-colors mb-2 line-clamp-1">
                                                    {bug.title}
                                                </h3>
                                            </Link>

                                            <p className="text-[11px] text-slate-500 mb-4">
                                                Published on {new Date(bug.createdAt).toLocaleDateString()}
                                            </p>

                                            <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-6">
                                                {bug.actualBehavior}
                                            </p>
                                        </div>

                                        <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-xs">
                                            {/* Interactive Upvote Button */}
                                            <button
                                                onClick={() => handleUpvote(bug.id)}
                                                disabled={upvotingId === bug.id}
                                                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold transition-all border ${bug.hasUpvoted
                                                    ? 'bg-amber-400/20 text-amber-400 border-amber-400/30'
                                                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                                                    }`}
                                            >
                                                <span>▲</span>
                                                <span>{bug.upvoteCount ?? 0}</span>
                                            </button>

                                            <div className="flex items-center gap-3 font-semibold text-xs">
                                                <Link
                                                    href={`/bugs/${bug.id}/edit`}
                                                    className="text-amber-400 hover:text-amber-300 transition-colors"
                                                >
                                                    ✏️ Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(bug.id)}
                                                    disabled={deletingId === bug.id}
                                                    className="text-rose-400 hover:text-rose-300 transition-colors disabled:opacity-50"
                                                >
                                                    {deletingId === bug.id ? 'Deleting...' : '🗑️ Delete'}
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                ) : (
                    /* Overview Tab */
                    <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 space-y-6">
                        <h3 className="text-lg font-bold text-slate-100">Curator Specialization Insights</h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-2">
                                <span className="text-xs font-bold uppercase text-slate-500">Primary Domain</span>
                                <div className="text-2xl font-black text-amber-400">{topCategory}</div>
                                <p className="text-[11px] text-slate-400">
                                    Most frequently documented architectural failure category.
                                </p>
                            </div>

                            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-2">
                                <span className="text-xs font-bold uppercase text-slate-500">Community Score</span>
                                <div className="text-2xl font-black text-purple-400">{communityScore} pts</div>
                                <p className="text-[11px] text-slate-400">
                                    Calculated from 20pts per exhibit, 10pts per upvote, and 5pts per comment.
                                </p>
                            </div>

                            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-2">
                                <span className="text-xs font-bold uppercase text-slate-500">AI Post-Mortems</span>
                                <div className="text-2xl font-black text-emerald-400">Gemini 1.5 Active</div>
                                <p className="text-[11px] text-slate-400">
                                    AI summarization enabled for all your published exhibits.
                                </p>
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </main>
    );
}
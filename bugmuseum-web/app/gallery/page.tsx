'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getBugs, toggleUpvote } from '@/services/api';
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

export default function GalleryPage() {
    const router = useRouter();
    const username = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    const [bugs, setBugs] = useState<BugExhibit[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
    const [upvotingId, setUpvotingId] = useState<number | null>(null);

    // Status Tab Filter State: 'open' | 'resolved' | 'all'
    const [statusTab, setStatusTab] = useState<'open' | 'resolved' | 'all'>('open');

    useEffect(() => {
        let isMounted = true;

        async function loadExhibits() {
            try {
                const data = await getBugs();
                if (isMounted) {
                    setBugs(data);
                }
            } catch (err) {
                console.error('Failed to load exhibits:', err);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        loadExhibits();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        router.push('/');
        router.refresh();
    };

    const handleUpvote = async (id: number) => {
        if (upvotingId !== null) return;
        setUpvotingId(id);
        try {
            const result = await toggleUpvote(id);
            setBugs((prev) =>
                prev.map((b) =>
                    b.id === id
                        ? { ...b, upvoteCount: result.upvoteCount, hasUpvoted: result.hasUpvoted }
                        : b
                )
            );
        } catch (err) {
            console.error('Failed to upvote:', err);
            alert('You must be logged in to upvote exhibits!');
        } finally {
            setUpvotingId(null);
        }
    };

    // 🚨 DEFENSIVE FILTERING: Safely check boolean flags regardless of legacy null/undefined backend values
    const openQuestionsCount = bugs.filter(
        (b) => Boolean(b.isOpenQuestion) === true && Boolean(b.isResolved) === false
    ).length;

    const resolvedExhibitsCount = bugs.filter(
        (b) => Boolean(b.isOpenQuestion) === false || Boolean(b.isResolved) === true
    ).length;

    const filteredBugs = bugs.filter((bug) => {
        const matchesSearch =
            bug.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            bug.programmingLanguage.toLowerCase().includes(searchQuery.toLowerCase()) ||
            bug.actualBehavior.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory =
            selectedCategory === 'All' || bug.category === selectedCategory;

        const matchesDifficulty =
            selectedDifficulty === 'All' || bug.difficulty === selectedDifficulty;

        const isUnresolved = Boolean(bug.isOpenQuestion) === true && Boolean(bug.isResolved) === false;

        const matchesStatus =
            statusTab === 'all' ||
            (statusTab === 'open' && isUnresolved) ||
            (statusTab === 'resolved' && !isUnresolved);

        return matchesSearch && matchesCategory && matchesDifficulty && matchesStatus;
    });

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Navigation Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-800">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 font-semibold text-xs rounded-xl border border-slate-800 transition-all"
                        >
                            ← Home
                        </Link>
                        <Link href="/" className="text-2xl font-black text-amber-400 tracking-wide">
                            🐛 BUG MUSEUM
                        </Link>
                        <span className="text-slate-600">/</span>
                        <span className="text-sm text-slate-400 font-semibold">Exhibits Gallery</span>
                    </div>

                    <div className="flex items-center gap-4">
                        {username ? (
                            <div className="flex items-center gap-3">
                                <Link href="/profile" className="text-xs text-slate-300 hover:text-amber-400 transition-colors">
                                    Curator: <strong className="text-amber-400">{username}</strong>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-lg transition-colors border border-slate-700"
                                >
                                    Logout
                                </button>

                                {/* 🔒 ONLY SHOW SUBMIT EXHIBIT FOR LOGGED-IN USERS */}
                                <Link
                                    href="/bugs/create"
                                    className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition-all"
                                >
                                    + Submit Exhibit
                                </Link>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link href="/login" className="text-xs text-slate-300 hover:text-amber-400 transition-colors font-semibold">
                                    Sign In
                                </Link>
                                <Link href="/register" className="px-3.5 py-1.5 bg-amber-400 text-slate-950 font-bold text-xs rounded-lg hover:bg-amber-300 transition-colors">
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </header>
                {/* Status Toggle Bar */}
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Exhibit Status Mode
                    </label>
                    <div className="inline-flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 gap-2 w-fit">
                        <button
                            type="button"
                            onClick={() => setStatusTab('open')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${statusTab === 'open'
                                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-lg'
                                : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            <span>🤖 Open Questions</span>
                            <span className="px-2 py-0.5 rounded-full bg-slate-950 text-purple-300 text-[10px] font-mono border border-slate-800">
                                {openQuestionsCount}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setStatusTab('resolved')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${statusTab === 'resolved'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg'
                                : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            <span>📜 Resolved Post-Mortems</span>
                            <span className="px-2 py-0.5 rounded-full bg-slate-950 text-emerald-300 text-[10px] font-mono border border-slate-800">
                                {resolvedExhibitsCount}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setStatusTab('all')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${statusTab === 'all'
                                ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30 shadow-lg'
                                : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            <span>All Exhibits</span>
                            <span className="px-2 py-0.5 rounded-full bg-slate-950 text-amber-300 text-[10px] font-mono border border-slate-800">
                                {bugs.length}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Filter Controls Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-xl">
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                            Search Exhibits
                        </label>
                        <input
                            type="text"
                            placeholder="Search title or tech..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                            Category
                        </label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                        >
                            <option value="All">All Categories</option>
                            <option value="Frontend">Frontend</option>
                            <option value="Backend">Backend</option>
                            <option value="Database">Database</option>
                            <option value="Security">Security</option>
                            <option value="DevOps">DevOps</option>
                            <option value="Concurrency">Concurrency</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                            Difficulty Level
                        </label>
                        <select
                            value={selectedDifficulty}
                            onChange={(e) => setSelectedDifficulty(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                        >
                            <option value="All">All Difficulties</option>
                            <option value="Beginner">Beginner 🟢</option>
                            <option value="Intermediate">Intermediate 🟡</option>
                            <option value="Senior Nightmare">Senior Nightmare 🔴</option>
                        </select>
                    </div>
                </div>

                {/* Exhibit Grid */}
                {loading ? (
                    <div className="text-center py-20 space-y-3">
                        <div className="inline-block w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                        <p className="text-xs text-slate-500 font-medium">Retrieving exhibit collection...</p>
                    </div>
                ) : filteredBugs.length === 0 ? (
                    <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-16 text-center text-slate-500 text-sm">
                        No exhibits match your search criteria.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredBugs.map((bug) => {
                            const isUnresolved = Boolean(bug.isOpenQuestion) === true && Boolean(bug.isResolved) === false;

                            return (
                                <article
                                    key={bug.id}
                                    className={`bg-slate-900/60 border hover:border-slate-700 rounded-2xl p-6 shadow-xl flex flex-col justify-between transition-all duration-300 ${isUnresolved ? 'border-purple-500/30' : 'border-slate-800'
                                        }`}
                                >
                                    <div>
                                        {/* Badges Bar */}
                                        <div className="flex flex-wrap items-center gap-2 mb-4">
                                            {isUnresolved ? (
                                                <span className="px-2.5 py-0.5 bg-purple-500/20 text-purple-400 text-[11px] font-semibold rounded-full border border-purple-500/30 flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
                                                    Open Question
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[11px] font-semibold rounded-full border border-emerald-500/30">
                                                    ✓ Resolved
                                                </span>
                                            )}

                                            <span className="px-2.5 py-0.5 bg-amber-400/10 text-amber-400 text-[11px] font-semibold rounded-full border border-amber-400/20">
                                                {bug.programmingLanguage}
                                            </span>
                                            <span className="px-2.5 py-0.5 bg-purple-400/10 text-purple-400 text-[11px] font-semibold rounded-full border border-purple-400/20">
                                                {bug.category}
                                            </span>
                                            <span
                                                className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full border ${bug.difficulty === 'Senior Nightmare'
                                                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                                    : bug.difficulty === 'Intermediate'
                                                        ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                    }`}
                                            >
                                                {bug.difficulty}
                                            </span>
                                        </div>

                                        <Link href={`/bugs/${bug.id}`}>
                                            <h3 className="text-lg font-bold text-slate-100 hover:text-amber-400 transition-colors mb-2 line-clamp-1">
                                                {bug.title}
                                            </h3>
                                        </Link>

                                        <p className="text-[11px] text-slate-500 mb-4">
                                            Curator: <strong className="text-slate-300">{bug.authorUsername}</strong> •{' '}
                                            {new Date(bug.createdAt).toLocaleDateString()}
                                        </p>

                                        <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
                                            {bug.actualBehavior}
                                        </p>

                                        {/* AI Diagnostic Hint Preview Box */}
                                        {isUnresolved && bug.aiDiagnosticHint && (
                                            <div className="mb-4 p-3 bg-purple-950/40 border border-purple-500/30 rounded-xl">
                                                <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider block mb-1">
                                                    🤖 AI Curator Diagnostic
                                                </span>
                                                <p className="text-[11px] text-purple-200 line-clamp-2 italic">
                                                    {`"${bug.aiDiagnosticHint}"`}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-xs">
                                        <button
                                            onClick={() => handleUpvote(bug.id)}
                                            disabled={upvotingId === bug.id}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${bug.hasUpvoted
                                                ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30'
                                                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
                                                }`}
                                        >
                                            <span>▲</span>
                                            <span>{bug.upvoteCount}</span>
                                        </button>

                                        <Link href={`/bugs/${bug.id}`} className="text-slate-500 hover:text-slate-300 transition-colors">
                                            💬 {bug.commentCount} comments
                                        </Link>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}
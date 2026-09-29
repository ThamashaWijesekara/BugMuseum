'use client';

import { use, useEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getBugById, updateBug } from '@/services/api';
import { CreateBugExhibit } from '@/types/bug';

function subscribe() { return () => { }; }
function getSnapshot() { return localStorage.getItem('username'); }
function getServerSnapshot() { return null; }

export default function EditBugPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    // Unwrap Next.js async params cleanly
    const resolvedParams = use(params);
    const bugId = Number(resolvedParams.id);

    const username = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    const [loading, setLoading] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // 🚨 State initialized with ALL required properties of CreateBugExhibit
    const [formData, setFormData] = useState<CreateBugExhibit>({
        title: '',
        programmingLanguage: '',
        category: 'Backend',
        difficulty: 'Intermediate',
        expectedBehavior: '',
        actualBehavior: '',
        rootCause: '',
        solution: '',
        lessonLearned: '',
        isOpenQuestion: true,
    });

    useEffect(() => {
        async function fetchBug() {
            try {
                const data = await getBugById(bugId);
                setFormData({
                    title: data.title || '',
                    programmingLanguage: data.programmingLanguage || '',
                    category: data.category || 'Backend',
                    difficulty: data.difficulty || 'Intermediate',
                    expectedBehavior: data.expectedBehavior || '',
                    actualBehavior: data.actualBehavior || '',
                    rootCause: data.rootCause || '',
                    solution: data.solution || '',
                    lessonLearned: data.lessonLearned || '',
                    isOpenQuestion: Boolean(data.isOpenQuestion),
                });
            } catch (err) {
                console.error('Failed to load exhibit for editing:', err);
                setError('Failed to fetch exhibit details.');
            } finally {
                setLoading(false);
            }
        }

        if (bugId) {
            fetchBug();
        }
    }, [bugId]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        router.push('/');
        router.refresh();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            await updateBug(bugId, formData);
            router.push(`/bugs/${bugId}`);
        } catch (err) {
            console.error('Failed to update exhibit:', err);
            setError('Failed to update exhibit. Please check your permissions.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-950 text-slate-100 p-8 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Navigation Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-800">
                    <div className="flex items-center gap-4">
                        <Link
                            href={`/bugs/${bugId}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 font-semibold text-xs rounded-xl border border-slate-800 transition-all"
                        >
                            ← Cancel & Return
                        </Link>
                        <Link href="/" className="text-2xl font-black text-amber-400 tracking-wide">
                            🐛 BUG MUSEUM
                        </Link>
                        <span className="text-slate-600">/</span>
                        <span className="text-sm text-slate-400 font-semibold">Edit Exhibit #{bugId}</span>
                    </div>

                    <div className="flex items-center gap-4">
                        {username && (
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-slate-300">
                                    Curator: <strong className="text-amber-400">{username}</strong>
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-lg transition-colors border border-slate-700"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                <div>
                    <h1 className="text-3xl font-black text-white">Edit Exhibit Details</h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Update exhibit specifications, root cause analysis, or resolution details.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 bg-slate-900/80 border border-slate-800 p-8 rounded-2xl shadow-xl">
                    {/* Title Input */}
                    <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Exhibit Title *
                        </label>
                        <input
                            type="text"
                            name="title"
                            required
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                        />
                    </div>

                    {/* Tech, Category & Difficulty Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Language / Tech *
                            </label>
                            <input
                                type="text"
                                name="programmingLanguage"
                                required
                                value={formData.programmingLanguage}
                                onChange={handleChange}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Category *
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                            >
                                <option value="Frontend">Frontend</option>
                                <option value="Backend">Backend</option>
                                <option value="Database">Database</option>
                                <option value="Security">Security</option>
                                <option value="DevOps">DevOps</option>
                                <option value="Concurrency">Concurrency</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Difficulty Level *
                            </label>
                            <select
                                name="difficulty"
                                value={formData.difficulty}
                                onChange={handleChange}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                            >
                                <option value="Beginner">Beginner 🟢</option>
                                <option value="Intermediate">Intermediate 🟡</option>
                                <option value="Senior Nightmare">Senior Nightmare 🔴</option>
                            </select>
                        </div>
                    </div>

                    {/* Behaviors */}
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Expected Behavior *
                            </label>
                            <textarea
                                name="expectedBehavior"
                                required
                                rows={3}
                                value={formData.expectedBehavior}
                                onChange={handleChange}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-100 focus:outline-none focus:border-amber-400 resize-none"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Actual Behavior / Error Details *
                            </label>
                            <textarea
                                name="actualBehavior"
                                required
                                rows={3}
                                value={formData.actualBehavior}
                                onChange={handleChange}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-100 focus:outline-none focus:border-amber-400 resize-none"
                            />
                        </div>
                    </div>

                    {/* Root Cause & Solution */}
                    <div className="space-y-4 pt-4 border-t border-slate-800">
                        <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-amber-400">
                                Root Cause Analysis
                            </label>
                            <textarea
                                name="rootCause"
                                rows={3}
                                value={formData.rootCause}
                                onChange={handleChange}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-100 focus:outline-none focus:border-amber-400 resize-none"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-amber-400">
                                Solution / Resolution
                            </label>
                            <textarea
                                name="solution"
                                rows={3}
                                value={formData.solution}
                                onChange={handleChange}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-100 focus:outline-none focus:border-amber-400 resize-none"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Lesson Learned / Key Takeaway
                            </label>
                            <input
                                type="text"
                                name="lessonLearned"
                                value={formData.lessonLearned}
                                onChange={handleChange}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-semibold">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xl disabled:opacity-50"
                    >
                        {submitting ? 'Saving Changes...' : '💾 Save Exhibit Changes'}
                    </button>
                </form>
            </div>
        </main>
    );
}
'use client';

import { useLayoutEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBug, uploadScreenshot } from '@/services/api';
import { CreateBugExhibit } from '@/types/bug';

function subscribe() { return () => { }; }
function getSnapshot() { return localStorage.getItem('username'); }
function getServerSnapshot() { return null; }

export default function CreateBugPage() {
    const router = useRouter();
    const username = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);

    // 🔒 Authentication Guard: Redirect guests immediately to /login
    useLayoutEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
        }
    }, [router]);

    const [formData, setFormData] = useState<CreateBugExhibit>({
        title: '',
        programmingLanguage: 'C# / ASP.NET',
        category: 'Backend',
        difficulty: 'Intermediate',
        expectedBehavior: '',
        actualBehavior: '',
        rootCause: '',
        solution: '',
        lessonLearned: '',
        isOpenQuestion: true,
    });

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

        // Secondary check for token
        const token = localStorage.getItem('token');
        if (!token) {
            alert('You must be signed in to submit an exhibit!');
            router.push('/login');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const payload: CreateBugExhibit = {
                ...formData,
                isOpenQuestion: Boolean(formData.isOpenQuestion),
            };

            const createdBug = await createBug(payload);

            if (file) {
                try {
                    await uploadScreenshot(createdBug.id, file);
                } catch (photoErr) {
                    console.error('Screenshot upload failed:', photoErr);
                }
            }

            router.push('/gallery');
        } catch (err: unknown) {
            console.error('Failed to create exhibit:', err);
            setError('Failed to document exhibit. Please check all required fields.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Navigation Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-800">
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => router.push('/gallery')}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 font-semibold text-xs rounded-xl border border-slate-800 transition-all"
                        >
                            ← Back to Gallery
                        </button>
                        <Link href="/" className="text-2xl font-black text-amber-400 tracking-wide">
                            🐛 BUG MUSEUM
                        </Link>
                        <span className="text-slate-600">/</span>
                        <span className="text-sm text-slate-400 font-semibold">Document Exhibit</span>
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

                {/* Page Title */}
                <div>
                    <h1 className="text-3xl font-black text-white">Document New Exhibit</h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Submit an open help request for community & AI diagnostics, or archive a solved post-mortem.
                    </p>
                </div>

                {/* Main Form Container */}
                <form onSubmit={handleSubmit} className="space-y-6 bg-slate-900/80 border border-slate-800 p-8 rounded-2xl shadow-xl">
                    {/* Exhibit Type Toggle Bar */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Exhibit Type
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                            <button
                                type="button"
                                onClick={() => setFormData((prev) => ({ ...prev, isOpenQuestion: true }))}
                                className={`py-3 px-4 rounded-xl text-xs font-bold transition-all ${formData.isOpenQuestion
                                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-lg'
                                        : 'text-slate-400 hover:text-slate-200'
                                    }`}
                            >
                                🤖 Open Question (AI & Community Help)
                            </button>

                            <button
                                type="button"
                                onClick={() => setFormData((prev) => ({ ...prev, isOpenQuestion: false }))}
                                className={`py-3 px-4 rounded-xl text-xs font-bold transition-all ${!formData.isOpenQuestion
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg'
                                        : 'text-slate-400 hover:text-slate-200'
                                    }`}
                            >
                                📜 Resolved Post-Mortem (Archived Fix)
                            </button>
                        </div>
                    </div>

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
                            placeholder="e.g. ASP.NET Core JWT Middleware Returning 401 Unauthorized"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                        />
                    </div>

                    {/* Language, Category & Difficulty Grid */}
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
                                placeholder="e.g. C# / ASP.NET Core 8"
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

                    {/* Expected & Actual Behavior */}
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
                                placeholder="What was supposed to happen?"
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
                                placeholder="What actually went wrong or failed?"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-100 focus:outline-none focus:border-amber-400 resize-none"
                            />
                        </div>
                    </div>

                    {/* Conditional Fields for Resolved Post-Mortems */}
                    {!formData.isOpenQuestion && (
                        <div className="space-y-4 pt-4 border-t border-slate-800">
                            <div className="space-y-1">
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                                    Root Cause *
                                </label>
                                <textarea
                                    name="rootCause"
                                    required={!formData.isOpenQuestion}
                                    rows={3}
                                    value={formData.rootCause}
                                    onChange={handleChange}
                                    placeholder="Why did this issue occur?"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-100 focus:outline-none focus:border-emerald-400 resize-none"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                                    Solution / Fix Applied *
                                </label>
                                <textarea
                                    name="solution"
                                    required={!formData.isOpenQuestion}
                                    rows={3}
                                    value={formData.solution}
                                    onChange={handleChange}
                                    placeholder="How was the bug resolved?"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-100 focus:outline-none focus:border-emerald-400 resize-none"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    Lesson Learned
                                </label>
                                <input
                                    type="text"
                                    name="lessonLearned"
                                    value={formData.lessonLearned}
                                    onChange={handleChange}
                                    placeholder="Key takeaway to prevent this issue in future development..."
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                                />
                            </div>
                        </div>
                    )}

                    {/* Screenshot Upload Field */}
                    <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Attach Screenshot (Optional)
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-400 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-amber-400 hover:file:bg-slate-700 cursor-pointer"
                        />
                    </div>

                    {/* Open Question Info Banner */}
                    {formData.isOpenQuestion && (
                        <div className="p-4 bg-purple-950/40 border border-purple-500/30 rounded-xl">
                            <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider block mb-1">
                                🤖 Instant AI Curator Diagnostics
                            </span>
                            <p className="text-xs text-purple-200">
                                Publishing as an open question will automatically trigger Gemini to generate an initial 3-step diagnostic guide for your issue.
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-semibold">
                            {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xl disabled:opacity-50"
                    >
                        {loading
                            ? 'Processing Exhibit...'
                            : formData.isOpenQuestion
                                ? '🚀 Publish Open Question to Museum'
                                : '📜 Document Resolved Post-Mortem'}
                    </button>
                </form>
            </div>
        </main>
    );
}
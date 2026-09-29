'use client';

interface TimelineStepProps {
  stepNumber: number;
  title: string;
  phase: string;
  color: 'rose' | 'amber' | 'purple' | 'emerald' | 'blue';
  children: React.ReactNode;
}

function TimelineStep({ stepNumber, title, phase, color, children }: TimelineStepProps) {
  const colorMap = {
    rose: 'border-rose-500/40 text-rose-400 bg-rose-500/10',
    amber: 'border-amber-500/40 text-amber-400 bg-amber-500/10',
    purple: 'border-purple-500/40 text-purple-400 bg-purple-500/10',
    emerald: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
    blue: 'border-blue-500/40 text-blue-400 bg-blue-500/10',
  };

  const badgeColor = colorMap[color];

  return (
    <div className="relative pl-8 pb-8 last:pb-0">
      {/* Timeline Connecting Line */}
      <div className="absolute left-3.5 top-3 -bottom-3 w-0.5 bg-slate-700/60 last:hidden" />

      {/* Timeline Bullet Badge */}
      <div className={`absolute left-0 top-1 w-7 h-7 rounded-full border-2 flex items-center justify-center font-bold text-xs shadow-md ${badgeColor}`}>
        {stepNumber}
      </div>

      <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 space-y-1">
        <div className="flex justify-between items-center text-xs">
          <strong className="text-slate-100 text-sm">{title}</strong>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border ${badgeColor}`}>
            {phase}
          </span>
        </div>
        <div className="text-slate-300 text-sm whitespace-pre-wrap pt-1">
          {children}
        </div>
      </div>
    </div>
  );
}

interface ResolutionTimelineProps {
  expectedBehavior: string;
  actualBehavior: string;
  rootCause: string;
  solution: string;
  lessonLearned: string;
}

export default function ResolutionTimeline({
  expectedBehavior,
  actualBehavior,
  rootCause,
  solution,
  lessonLearned,
}: ResolutionTimelineProps) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl space-y-4">
      <h2 className="text-xl font-bold text-amber-400 flex items-center gap-2">
        <span>⏱️</span> Resolution Lifecycle Timeline
      </h2>
      <p className="text-xs text-slate-400">
        Chronological post-mortem breakdown of how this bug was discovered, analyzed, and patched.
      </p>

      <div className="pt-4">
        <TimelineStep
          stepNumber={1}
          title="Initial Anomaly Discovered"
          phase="Phase 1: Discovery"
          color="rose"
        >
          <strong className="text-rose-400 block text-xs uppercase mb-1">Actual Failure:</strong>
          {actualBehavior}
        </TimelineStep>

        <TimelineStep
          stepNumber={2}
          title="Expected Baseline Behavior"
          phase="Phase 2: Reproduction"
          color="amber"
        >
          <strong className="text-amber-400 block text-xs uppercase mb-1">Target State:</strong>
          {expectedBehavior}
        </TimelineStep>

        <TimelineStep
          stepNumber={3}
          title="Underlying Cause Identified"
          phase="Phase 3: Root Cause"
          color="purple"
        >
          <strong className="text-purple-400 block text-xs uppercase mb-1">Deep Dive:</strong>
          {rootCause}
        </TimelineStep>

        <TimelineStep
          stepNumber={4}
          title="Code Fix Applied"
          phase="Phase 4: Resolution"
          color="emerald"
        >
          <strong className="text-emerald-400 block text-xs uppercase mb-1">Patched Solution:</strong>
          {solution}
        </TimelineStep>

        <TimelineStep
          stepNumber={5}
          title="Post-Mortem & Prevention"
          phase="Phase 5: Takeaway"
          color="blue"
        >
          <strong className="text-blue-400 block text-xs uppercase mb-1">Lesson Learned:</strong>
          {lessonLearned}
        </TimelineStep>
      </div>
    </div>
  );
}
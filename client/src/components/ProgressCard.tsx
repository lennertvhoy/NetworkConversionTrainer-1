interface ProgressCardProps {
  title: string;
  mastery: number;
  correct: number;
  total: number;
  color: string;
}

export default function ProgressCard({ title, mastery, correct, total, color }: ProgressCardProps) {
  return (
    <div className="bg-slate-50 p-4 rounded-lg dark:bg-zinc-800">
      <h3 className="font-medium text-slate-700 mb-2 dark:text-zinc-200">{title}</h3>
      <div className="relative w-full h-2 bg-slate-200 rounded-full overflow-hidden dark:bg-zinc-700">
        <div 
          className={`absolute top-0 left-0 h-full ${color} rounded-full`} 
          style={{width: `${mastery}%`}}
        ></div>
      </div>
      <div className="mt-2 flex justify-between text-sm">
        <span className="text-slate-500 dark:text-zinc-400">{mastery}% Mastery</span>
        <span className={`${color.replace('bg-', 'text-')} font-medium`}>{correct}/{total} correct</span>
      </div>
    </div>
  );
}

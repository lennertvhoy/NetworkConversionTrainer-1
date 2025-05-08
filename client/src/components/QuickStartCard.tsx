import { useLocation } from "wouter";
import { ArrowRight } from "lucide-react";

interface QuickStartCardProps {
  title: string;
  description: string;
  tags: string[];
  badgeText: string;
  badgeColor: string;
  buttonColor: string;
  path: string;
}

export default function QuickStartCard({ 
  title, 
  description, 
  tags, 
  badgeText, 
  badgeColor, 
  buttonColor, 
  path 
}: QuickStartCardProps) {
  const [, setLocation] = useLocation();

  const handleStartPractice = () => {
    setLocation(path);
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden dark:bg-zinc-800">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-slate-900 dark:text-zinc-100">{title}</h2>
          <span className={`${badgeColor} text-xs px-2 py-1 rounded-full`}>{badgeText}</span>
        </div>
        <p className="text-slate-600 mb-4 dark:text-zinc-400">{description}</p>
        <div className="flex flex-wrap gap-2 mb-6">
          {tags.map((tag, index) => (
            <span 
              key={index} 
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-zinc-700 dark:text-zinc-300"
            >
              {tag}
            </span>
          ))}
        </div>
        <button 
          onClick={handleStartPractice}
          className={`w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${buttonColor} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50 dark:focus:ring-offset-zinc-900`}
        >
          Start Practice
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

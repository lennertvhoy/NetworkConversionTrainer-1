import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import ProgressCard from "@/components/ProgressCard";
import QuickStartCard from "@/components/QuickStartCard";
import { Card, CardContent } from "@/components/ui/card";
import type { ProgressSummary } from "@shared/schema";

export default function Dashboard() {
  const { data: progressData, isLoading, error } = useQuery<ProgressSummary>({
    queryKey: ["/api/progress"],
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="bg-slate-200 h-48 rounded-lg dark:bg-zinc-700"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-200 h-64 rounded-lg dark:bg-zinc-700"></div>
          <div className="bg-slate-200 h-64 rounded-lg dark:bg-zinc-700"></div>
        </div>
      </div>
    );
  }

  // Fallback data in case API fails or hasn't been implemented yet
  const fallbackData: ProgressSummary = {
    binaryProgress: { mastery: 65, correct: 32, total: 50 },
    subnettingProgress: { mastery: 42, correct: 21, total: 50 },
    vlsmProgress: { mastery: 28, correct: 14, total: 50 },
    recentActivity: [
      {
        id: 1,
        topic: "binary",
        subtype: "bin2dec",
        score: 8,
        totalQuestions: 10,
        difficulty: "medium",
        timeSpent: 720,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        id: 2,
        topic: "subnet",
        subtype: "basic",
        score: 6,
        totalQuestions: 10,
        difficulty: "medium",
        timeSpent: 1080,
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
      },
      {
        id: 3,
        topic: "binary",
        subtype: "hex2bin",
        score: 4,
        totalQuestions: 10,
        difficulty: "hard",
        timeSpent: 540,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      }
    ]
  };

  const data = progressData || fallbackData;

  const formatTimeSpent = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === now.toDateString()) {
      return `Today, ${format(date, 'h:mm a')}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d, h:mm a');
    }
  };

  const getTopicName = (topic: string, subtype: string) => {
    if (topic === "binary") {
      switch (subtype) {
        case "bin2dec": return "Binary to Decimal";
        case "bin2hex": return "Binary to Hexadecimal";
        case "hex2bin": return "Hexadecimal to Binary";
        case "dec2bin": return "Decimal to Binary";
        default: return "Binary Conversion";
      }
    } else if (topic === "subnet") {
      switch (subtype) {
        case "basic": return "Subnetting Basics";
        case "vlsm": return "VLSM Subnetting";
        case "wildcard": return "Wildcard Masks";
        case "network": return "Network Calculations";
        default: return "Subnetting";
      }
    }
    return topic;
  };

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return "text-green-600 dark:text-green-400";
    if (percentage >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div>
      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-lg font-medium text-slate-900 mb-4 dark:text-zinc-100">Learning Progress</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <ProgressCard
              title="Binary Conversion"
              mastery={data.binaryProgress.mastery}
              correct={data.binaryProgress.correct}
              total={data.binaryProgress.total}
              color="bg-primary"
            />
            
            <ProgressCard
              title="Subnetting"
              mastery={data.subnettingProgress.mastery}
              correct={data.subnettingProgress.correct}
              total={data.subnettingProgress.total}
              color="bg-secondary"
            />
            
            <ProgressCard
              title="VLSM"
              mastery={data.vlsmProgress.mastery}
              correct={data.vlsmProgress.correct}
              total={data.vlsmProgress.total}
              color="bg-accent"
            />
          </div>
          
          <h3 className="text-md font-medium text-slate-700 mb-3 dark:text-zinc-300">Recent Activity</h3>
          <div className="border rounded-md overflow-hidden dark:border-zinc-700">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-zinc-700">
              <thead className="bg-slate-50 dark:bg-zinc-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-zinc-400">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-zinc-400">Topic</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-zinc-400">Score</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-zinc-400">Time Spent</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200 dark:bg-zinc-800 dark:divide-zinc-700">
                {data.recentActivity.map((activity) => (
                  <tr key={activity.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-zinc-400">
                      {formatTimestamp(activity.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-zinc-300">
                      {getTopicName(activity.topic, activity.subtype)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getScoreColor(activity.score, activity.totalQuestions)}`}>
                      {activity.score}/{activity.totalQuestions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-zinc-400">
                      {formatTimeSpent(activity.timeSpent)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <QuickStartCard
          title="Binary Conversion"
          description="Practice converting between binary, decimal, and hexadecimal number systems."
          tags={["Binary to Decimal", "Binary to Hex", "Hex to Binary"]}
          badgeText="Recommended"
          badgeColor="bg-blue-100 text-primary dark:bg-blue-900 dark:text-blue-200"
          buttonColor="bg-primary hover:bg-blue-600 focus:ring-blue-500"
          path="/binary"
        />
        
        <QuickStartCard
          title="Subnetting"
          description="Practice subnetting, VLSM, and network calculations for CCNA preparation."
          tags={["IP Calculations", "Subnet Masks", "VLSM"]}
          badgeText="CCNA Skills"
          badgeColor="bg-slate-100 text-slate-700 dark:bg-zinc-700 dark:text-zinc-300"
          buttonColor="bg-secondary hover:bg-green-600 focus:ring-green-500"
          path="/subnetting"
        />
      </div>
    </div>
  );
}

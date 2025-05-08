import { useState, useEffect } from "react";
import { CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { generateSubnettingQuestion } from "@/lib/subnetUtils";

interface SubnettingExerciseProps {
  subnetType: string;
  difficulty: string;
}

export default function SubnettingExerciseCard({ subnetType, difficulty }: SubnettingExerciseProps) {
  const { toast } = useToast();
  const [questionText, setQuestionText] = useState("");
  const [answerFields, setAnswerFields] = useState<{id: string, label: string, answer: string}[]>([]);
  const [userAnswers, setUserAnswers] = useState<{[key: string]: string}>({});
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [questionNumber, setQuestionNumber] = useState(1);
  const [score, setScore] = useState(0);
  const [totalQuestions] = useState(10);
  const [startTime, setStartTime] = useState<Date | null>(null);

  // Load a new question on mount or when subnet type/difficulty changes
  useEffect(() => {
    generateNewQuestion();
  }, [subnetType, difficulty]);

  const generateNewQuestion = async () => {
    try {
      const response = await apiRequest(
        "POST",
        "/api/subnetting/generate",
        { type: subnetType, difficulty }
      );
      
      const data = await response.json();
      setQuestionText(data.questionText);
      setAnswerFields(data.answerFields);
      setExplanation(data.explanation);
      setUserAnswers({});
      setIsCorrect(false);
      setIsAnswered(false);
      setStartTime(new Date());
    } catch (error) {
      console.error("Error generating question:", error);
      
      // Fallback to client-side generation if API fails
      const { questionText, answerFields, explanation } = generateSubnettingQuestion(subnetType, difficulty);
      setQuestionText(questionText);
      setAnswerFields(answerFields);
      setExplanation(explanation);
      setUserAnswers({});
      setIsCorrect(false);
      setIsAnswered(false);
      setStartTime(new Date());
    }
  };

  const handleInputChange = (id: string, value: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const checkAnswer = () => {
    // Check if all answer fields have been filled out
    const allFieldsFilled = answerFields.every(field => 
      userAnswers[field.id] && userAnswers[field.id].trim() !== ""
    );

    if (!allFieldsFilled) {
      toast({
        title: "Incomplete answer",
        description: "Please fill in all fields before checking your answer.",
        variant: "destructive",
      });
      return;
    }

    // Check if all answers are correct
    const allCorrect = answerFields.every(field => {
      const userAnswer = userAnswers[field.id].trim().toLowerCase();
      const correctAnswer = field.answer.toLowerCase();
      
      // For subnet masks, handle both forms (255.255.255.0 and /24)
      if (field.id.includes("mask")) {
        if (correctAnswer.startsWith("/") && !userAnswer.startsWith("/")) {
          // Convert dotted decimal to CIDR if needed
          const cidrMap: {[key: string]: string} = {
            "255.255.255.0": "/24",
            "255.255.255.128": "/25",
            "255.255.255.192": "/26",
            "255.255.255.224": "/27",
            "255.255.255.240": "/28",
            "255.255.255.248": "/29",
            "255.255.255.252": "/30",
            "255.255.0.0": "/16",
            "255.0.0.0": "/8"
          };
          return cidrMap[userAnswer] === correctAnswer;
        } else if (!correctAnswer.startsWith("/") && userAnswer.startsWith("/")) {
          // Convert CIDR to dotted decimal if needed
          const cidrMap: {[key: string]: string} = {
            "/24": "255.255.255.0",
            "/25": "255.255.255.128",
            "/26": "255.255.255.192",
            "/27": "255.255.255.224",
            "/28": "255.255.255.240",
            "/29": "255.255.255.248",
            "/30": "255.255.255.252",
            "/16": "255.255.0.0",
            "/8": "255.0.0.0"
          };
          return cidrMap[userAnswer] === correctAnswer;
        }
      }
      
      return userAnswer === correctAnswer;
    });

    setIsCorrect(allCorrect);
    setIsAnswered(true);
    
    if (allCorrect) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = async () => {
    if (questionNumber < totalQuestions) {
      setQuestionNumber(prev => prev + 1);
      generateNewQuestion();
    } else {
      // Submit session results if this was the last question
      if (startTime) {
        const timeSpent = Math.round((new Date().getTime() - startTime.getTime()) / 1000);
        try {
          await apiRequest("POST", "/api/practice-sessions", {
            topic: "subnet",
            subtype: subnetType,
            score,
            totalQuestions,
            difficulty,
            timeSpent,
          });
          
          // Invalidate progress data to refresh dashboard
          queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
          
          toast({
            title: "Practice session completed!",
            description: `You scored ${score} out of ${totalQuestions}`,
          });
        } catch (error) {
          console.error("Error saving practice session:", error);
        }
      }
      
      // Start a new session
      setQuestionNumber(1);
      setScore(0);
      generateNewQuestion();
    }
  };

  const handleSkip = () => {
    setIsCorrect(false);
    setIsAnswered(true);
  };

  const getSubnetTypeLabel = () => {
    switch(subnetType) {
      case "basic": return "Basic Subnetting";
      case "vlsm": return "VLSM Subnetting";
      case "wildcard": return "Wildcard Masks";
      case "network": return "Network Calculations";
      default: return "Subnetting";
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-6 dark:bg-zinc-800">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between mb-6">
          <div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              {getSubnetTypeLabel()}
            </span>
            <h3 className="mt-2 text-lg font-medium text-slate-900 dark:text-zinc-100">Calculate subnet information</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 dark:text-zinc-400">Question {questionNumber}/{totalQuestions}</span>
            <div className="bg-slate-100 h-2 w-24 rounded-full overflow-hidden dark:bg-zinc-700">
              <div 
                className="bg-secondary h-full rounded-full" 
                style={{width: `${(questionNumber / totalQuestions) * 100}%`}}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-slate-50 rounded-lg mb-6 dark:bg-zinc-900">
          <div className="text-slate-800 space-y-3 dark:text-zinc-100" dangerouslySetInnerHTML={{ __html: questionText }} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {answerFields.map(field => (
            <div key={field.id}>
              <label htmlFor={field.id} className="block text-sm font-medium text-slate-700 mb-2 dark:text-zinc-300">
                {field.label}
              </label>
              <Input
                id={field.id}
                value={userAnswers[field.id] || ""}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                placeholder={`e.g., ${field.id.includes("mask") ? "255.255.255.0 or /24" : "192.168.1.0"}`}
                className="shadow-sm focus:ring-secondary focus:border-secondary block w-full sm:text-sm border-slate-300"
              />
            </div>
          ))}
        </div>
        
        <Button 
          onClick={checkAnswer} 
          disabled={isAnswered}
          className="w-full md:w-auto"
        >
          Check Answer
        </Button>
        
        {/* Feedback section when answer is correct */}
        {isAnswered && isCorrect && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircle className="text-green-400 text-xl dark:text-green-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800 dark:text-green-400">Correct!</h3>
                <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                  <div dangerouslySetInnerHTML={{ __html: explanation }} />
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Feedback section when answer is incorrect */}
        {isAnswered && !isCorrect && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircle className="text-red-400 text-xl dark:text-red-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-400">Incorrect</h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  <p>The correct answers are:</p>
                  <ul className="list-disc pl-5 mt-2">
                    {answerFields.map(field => (
                      <li key={field.id}>
                        <strong>{field.label}:</strong> <span className="font-mono font-bold">{field.answer}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3" dangerouslySetInnerHTML={{ __html: explanation }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 dark:bg-zinc-900 dark:border-zinc-700">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div>
            <span className="text-sm text-slate-500 dark:text-zinc-400">
              Score: <span className="font-medium text-slate-700 dark:text-zinc-300">{score}</span>/{totalQuestions} correct
            </span>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleSkip}
              disabled={isAnswered}
            >
              Skip
            </Button>
            <Button 
              onClick={handleNextQuestion}
              disabled={!isAnswered}
              className={!isAnswered ? "opacity-50 cursor-not-allowed" : ""}
              variant="default"
            >
              {questionNumber === totalQuestions ? "Start New Practice" : "Next Question"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

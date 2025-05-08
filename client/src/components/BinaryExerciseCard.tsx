import { useState, useEffect } from "react";
import { CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { convertBinary, generateBinaryQuestion } from "@/lib/binaryUtils";

interface BinaryExerciseProps {
  conversionType: string;
  difficulty: string;
}

export default function BinaryExerciseCard({ conversionType, difficulty }: BinaryExerciseProps) {
  const { toast } = useToast();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [explanation, setExplanation] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [score, setScore] = useState(0);
  const [totalQuestions] = useState(10);
  const [startTime, setStartTime] = useState<Date | null>(null);

  // Load a new question on mount or when conversion type/difficulty changes
  useEffect(() => {
    generateNewQuestion();
  }, [conversionType, difficulty]);

  const generateNewQuestion = async () => {
    try {
      const response = await apiRequest(
        "POST",
        "/api/binary/generate",
        { type: conversionType, difficulty }
      );
      
      const data = await response.json();
      setQuestion(data.question);
      setAnswer(data.answer);
      setExplanation(data.explanation);
      setUserAnswer("");
      setIsCorrect(null);
      setIsAnswered(false);
      setStartTime(new Date());
    } catch (error) {
      console.error("Error generating question:", error);
      
      // Fallback to client-side generation if API fails
      const { question, answer, explanation } = generateBinaryQuestion(conversionType, difficulty);
      setQuestion(question);
      setAnswer(answer);
      setExplanation(explanation);
      setUserAnswer("");
      setIsCorrect(null);
      setIsAnswered(false);
      setStartTime(new Date());
    }
  };

  const checkAnswer = () => {
    if (!userAnswer.trim()) {
      toast({
        title: "Empty answer",
        description: "Please enter your answer before checking.",
        variant: "destructive",
      });
      return;
    }

    const isUserCorrect = userAnswer.trim().toLowerCase() === answer.toLowerCase();
    setIsCorrect(isUserCorrect);
    setIsAnswered(true);
    
    if (isUserCorrect) {
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
            topic: "binary",
            subtype: conversionType,
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
    setUserAnswer("");
  };

  const getConversionTypeLabel = () => {
    switch(conversionType) {
      case "bin2dec": return "Binary to Decimal";
      case "bin2hex": return "Binary to Hexadecimal";
      case "hex2bin": return "Hexadecimal to Binary";
      case "dec2bin": return "Decimal to Binary";
      default: return "Binary Conversion";
    }
  };

  const getConversionQuestion = () => {
    switch(conversionType) {
      case "bin2dec": return "Convert this binary number to decimal";
      case "bin2hex": return "Convert this binary number to hexadecimal";
      case "hex2bin": return "Convert this hexadecimal number to binary";
      case "dec2bin": return "Convert this decimal number to binary";
      default: return "Convert this number";
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-6 dark:bg-zinc-800">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between mb-6">
          <div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              {getConversionTypeLabel()}
            </span>
            <h3 className="mt-2 text-lg font-medium text-slate-900 dark:text-zinc-100">{getConversionQuestion()}</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 dark:text-zinc-400">Question {questionNumber}/{totalQuestions}</span>
            <div className="bg-slate-100 h-2 w-24 rounded-full overflow-hidden dark:bg-zinc-700">
              <div 
                className="bg-primary h-full rounded-full" 
                style={{width: `${(questionNumber / totalQuestions) * 100}%`}}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-slate-50 rounded-lg mb-6 text-center dark:bg-zinc-900">
          <p className="font-mono text-2xl tracking-wide font-bold text-slate-800 select-all dark:text-zinc-100">{question}</p>
        </div>
        
        <div className="mb-6">
          <label htmlFor="user-answer" className="block text-sm font-medium text-slate-700 mb-2 dark:text-zinc-300">
            Your Answer
          </label>
          <div className="flex">
            <Input 
              id="user-answer"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isAnswered) {
                  checkAnswer();
                }
              }}
              placeholder="Enter your answer"
              className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-slate-300"
            />
            <Button 
              onClick={checkAnswer} 
              disabled={isAnswered}
              className="ml-4"
            >
              Check
            </Button>
          </div>
        </div>
        
        {/* Feedback section when answer is correct */}
        {isAnswered && isCorrect && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
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
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircle className="text-red-400 text-xl dark:text-red-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-400">Incorrect</h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  <p>The correct answer is <span className="font-mono font-bold">{answer}</span>.</p>
                  <div dangerouslySetInnerHTML={{ __html: explanation }} />
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
            >
              {questionNumber === totalQuestions ? "Start New Practice" : "Next Question"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

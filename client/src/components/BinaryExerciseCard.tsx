import { useState, useEffect } from "react";
import { CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { generateBinaryQuestion } from "@/lib/binaryUtils";
import { useLanguage } from "@/lib/languageContext";

interface BinaryExerciseProps {
  conversionType: string;
  difficulty: string;
}

export default function BinaryExerciseCard({ conversionType, difficulty }: BinaryExerciseProps) {
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [explanation, setExplanation] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);
  
  // Separate the question (binary/hex/decimal number) from its context text
  const [questionValue, setQuestionValue] = useState("");
  const [questionContext, setQuestionContext] = useState("");
  
  // Load a new question on mount or when conversion type/difficulty/language changes
  useEffect(() => {
    generateNewQuestion();
  }, [conversionType, difficulty, language]);

  const generateNewQuestion = () => {
    // Generate question client-side with language preference
    const { question, answer, explanation } = generateBinaryQuestion(conversionType, difficulty, language);
    
    // Extract the actual value to convert from the explanation text
    const extractValue = () => {
      // Pattern matching based on conversion type to find the value in the explanation
      if (conversionType === 'bin2dec' || conversionType === 'bin2hex') {
        // Find the binary number in the explanation (first pattern between <span> tags)
        const binaryMatch = explanation.match(/<span class="font-mono font-bold">([01]+)<\/span>/);
        return binaryMatch ? binaryMatch[1] : "";
      } else if (conversionType === 'hex2bin') {
        // Find the hex number in the explanation
        const hexMatch = explanation.match(/<span class="font-mono font-bold">([0-9A-Fa-f]+)<\/span>/);
        return hexMatch ? hexMatch[1] : "";
      } else if (conversionType === 'dec2bin') {
        // Find the decimal number in the explanation
        const decimalMatch = explanation.match(/<span class="font-mono font-bold">(\d+)<\/span>/);
        return decimalMatch ? decimalMatch[1] : "";
      }
      return "";
    };
    
    // Get the value to convert
    let extractedValue = extractValue();
    
    // Format binary numbers in groups of 4 for better readability (medium and hard difficulty only)
    if ((conversionType === 'bin2dec' || conversionType === 'bin2hex') && difficulty !== 'easy' && extractedValue.length > 4) {
      // Add padding to make the length a multiple of 4
      const paddedLength = Math.ceil(extractedValue.length / 4) * 4;
      const paddedValue = extractedValue.padStart(paddedLength, '0');
      
      // Insert space every 4 characters
      let formattedValue = '';
      for (let i = 0; i < paddedValue.length; i += 4) {
        if (i > 0) formattedValue += ' ';
        formattedValue += paddedValue.substring(i, i + 4);
      }
      
      // Remove leading zeros if they were added
      if (paddedValue.length > extractedValue.length) {
        const leadingZeros = paddedValue.length - extractedValue.length;
        const firstGroup = formattedValue.substring(0, 4);
        if (firstGroup.startsWith('0'.repeat(leadingZeros))) {
          formattedValue = firstGroup.substring(leadingZeros) + formattedValue.substring(4);
        }
      }
      
      extractedValue = formattedValue;
    }
    
    // Store all states
    setQuestion(question);
    setQuestionValue(extractedValue);
    setQuestionContext(question);
    setAnswer(answer);
    setExplanation(explanation);
    setUserAnswer("");
    setIsCorrect(null);
    setIsAnswered(false);
  };

  const checkAnswer = () => {
    if (!userAnswer.trim()) {
      toast({
        title: t('binary.emptyAnswer'),
        description: t('binary.pleaseEnterAnswer'),
        variant: "destructive",
      });
      return;
    }

    // Remove all spaces from both user answer and the correct answer before comparing
    const cleanUserAnswer = userAnswer.trim().toLowerCase().replace(/\s+/g, '');
    const cleanCorrectAnswer = answer.toLowerCase().replace(/\s+/g, '');
    
    const isUserCorrect = cleanUserAnswer === cleanCorrectAnswer;
    setIsCorrect(isUserCorrect);
    setIsAnswered(true);
  };

  const handleNextQuestion = () => {
    generateNewQuestion();
  };

  const handleSkip = () => {
    setIsCorrect(false);
    setIsAnswered(true);
    setUserAnswer("");
  };

  const getConversionTypeLabel = () => {
    switch(conversionType) {
      case "bin2dec": return t('binary.type.bin2dec');
      case "bin2hex": return t('binary.type.bin2hex');
      case "hex2bin": return t('binary.type.hex2bin');
      case "dec2bin": return t('binary.type.dec2bin');
      default: return t('binary.title');
    }
  };

  const getConversionQuestion = () => {
    switch(conversionType) {
      case "bin2dec": return t('binary.questions.bin2dec');
      case "bin2hex": return t('binary.questions.bin2hex');
      case "hex2bin": return t('binary.questions.hex2bin');
      case "dec2bin": return t('binary.questions.dec2bin');
      default: return t('binary.questions.default');
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
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={generateNewQuestion}
              className="flex items-center gap-1 hover:bg-blue-100 dark:hover:bg-blue-900"
            >
              <RefreshCw className="h-4 w-4" />
              {t('binary.newQuestion')}
            </Button>
          </div>
        </div>
        
        {/* Question Card - Split into question context and the value to convert */}
        <div className="p-4 bg-slate-50 rounded-lg mb-6 dark:bg-zinc-900">
          <div className="mb-2 text-slate-700 dark:text-zinc-300">
            {questionContext}
          </div>
          <div className="py-4 px-6 bg-white rounded border-2 border-blue-100 shadow-sm dark:bg-zinc-800 dark:border-blue-900">
            <p className="font-mono text-3xl tracking-wider font-bold text-blue-700 select-all dark:text-blue-400 text-center">{questionValue}</p>
          </div>
        </div>
        
        <div className="mb-6">
          <label htmlFor="user-answer" className="block text-sm font-medium text-slate-700 mb-2 dark:text-zinc-300">
            {t('binary.yourAnswer')}
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
              placeholder={
                conversionType === 'bin2dec' 
                  ? (language === 'en' ? 'eg. ' : 'bv. ') + "42"
                  : conversionType === 'bin2hex'
                    ? (language === 'en' ? 'eg. ' : 'bv. ') + "2A"
                    : conversionType === 'hex2bin'
                      ? (language === 'en' ? 'eg. ' : 'bv. ') + "1010"
                      : conversionType === 'dec2bin'
                        ? (language === 'en' ? 'eg. ' : 'bv. ') + "1010"
                        : t('binary.yourAnswer')
              }
              className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-slate-300"
            />
            <Button 
              onClick={checkAnswer} 
              disabled={isAnswered}
              className="ml-4"
            >
              {t('binary.check')}
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
                <h3 className="text-sm font-medium text-green-800 dark:text-green-400">{t('binary.correct')}</h3>
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
                <h3 className="text-sm font-medium text-red-800 dark:text-red-400">{t('binary.incorrect')}</h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  <p>{t('binary.correctAnswerIs')} <span className="font-mono font-bold">{answer}</span>.</p>
                  <div dangerouslySetInnerHTML={{ __html: explanation }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 dark:bg-zinc-900 dark:border-zinc-700">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div></div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleSkip}
              disabled={isAnswered}
            >
              {t('binary.skip')}
            </Button>
            <Button 
              onClick={handleNextQuestion}
              disabled={!isAnswered}
              className={!isAnswered ? "opacity-50 cursor-not-allowed bg-primary hover:bg-blue-600" : "bg-primary hover:bg-blue-600"}
            >
              {t('binary.nextQuestion')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

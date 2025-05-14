import { useState, useEffect } from "react";
import { CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { generateSubnettingQuestion } from "@/lib/subnetUtils";
import { useLanguage } from "@/lib/languageContext";

interface SubnettingExerciseProps {
  subnetType: string;
  difficulty: string;
}

export default function SubnettingExerciseCard({ subnetType, difficulty }: SubnettingExerciseProps) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [questionText, setQuestionText] = useState("");
  const [answerFields, setAnswerFields] = useState<{id: string, label: string, answer: string}[]>([]);
  const [userAnswers, setUserAnswers] = useState<{[key: string]: string}>({});
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [explanation, setExplanation] = useState("");

  // Get the language from context at component level
  const { language } = useLanguage();
  
  // Load a new question on mount or when subnet type/difficulty/language changes
  useEffect(() => {
    // Generate question client-side with language preference
    const { questionText, answerFields, explanation } = generateSubnettingQuestion(subnetType, difficulty, language);
    setQuestionText(questionText);
    setAnswerFields(answerFields);
    setExplanation(explanation);
    setUserAnswers({});
    setIsCorrect(false);
    setIsAnswered(false);
  }, [subnetType, difficulty, language]);
  
  const generateNewQuestion = () => {
    // Generate question client-side with language preference
    const { questionText, answerFields, explanation } = generateSubnettingQuestion(subnetType, difficulty, language);
    setQuestionText(questionText);
    setAnswerFields(answerFields);
    setExplanation(explanation);
    setUserAnswers({});
    setIsCorrect(false);
    setIsAnswered(false);
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
        title: t('subnetting.incompleteAnswer'),
        description: t('subnetting.fillAllFields'),
        variant: "destructive",
      });
      return;
    }

    // Check if all answers are correct
    const allCorrect = answerFields.every(field => {
      const userAnswer = userAnswers[field.id].trim().toLowerCase();
      const correctAnswer = field.answer.toLowerCase();
      
      // For conversion questions between CIDR and decimal subnet mask notations
      if (field.id === 'subnet-mask') {
        // If we're asking about mask conversion, we need to be strict about the answer format
        // This means CIDR questions must be answered with CIDR and decimal questions with decimal
        
        // Check if the question asks for a specific format
        const questionAsksForCIDR = questionText.toLowerCase().includes('cidr') || 
                                   questionText.toLowerCase().includes('prefix');
        const questionAsksForDecimal = questionText.toLowerCase().includes('dotted decimal') || 
                                      questionText.toLowerCase().includes('decimal notation');
        
        if (questionAsksForCIDR && !userAnswer.startsWith('/')) {
          // The user didn't provide a CIDR notation answer when asked for one
          return false;
        }
        
        if (questionAsksForDecimal && userAnswer.startsWith('/')) {
          // The user didn't provide a decimal notation answer when asked for one
          return false;
        }
        
        // For exact format match cases, do strict comparison
        if (userAnswer.startsWith('/') && correctAnswer.startsWith('/')) {
          // Both are CIDR, compare the numbers
          return parseInt(userAnswer.substring(1)) === parseInt(correctAnswer.substring(1));
        }
        
        // For decimal format, do a more flexible comparison
        if (!userAnswer.startsWith('/') && !correctAnswer.startsWith('/')) {
          const userParts = userAnswer.split(".").map(part => parseInt(part));
          const correctParts = correctAnswer.split(".").map(part => parseInt(part));
          
          if (userParts.length === 4 && correctParts.length === 4) {
            return userParts.every((part, i) => part === correctParts[i]);
          }
        }
        
        // For other cases, exact match is required
        return userAnswer === correctAnswer;
      }
      
      // For IP address-like answers (non-subnet mask questions)
      if (field.id.includes('address') || field.id.includes('host')) {
        // More flexible matching for IP addresses
        const userParts = userAnswer.split(".").map(part => parseInt(part));
        const correctParts = correctAnswer.split(".").map(part => parseInt(part));
        
        if (userParts.length === 4 && correctParts.length === 4) {
          return userParts.every((part, i) => part === correctParts[i]);
        }
      }
      
      // For any other field, require exact match
      return userAnswer === correctAnswer;
    });

    setIsCorrect(allCorrect);
    setIsAnswered(true);
  };


  
  const handleNextQuestion = () => {
    generateNewQuestion();
  };

  const handleSkip = () => {
    setIsCorrect(false);
    setIsAnswered(true);
  };

  const getSubnetTypeLabel = () => {
    switch(subnetType) {
      case "basic": return t('subnetting.type.basic');
      case "vlsm": return t('subnetting.type.vlsm');
      case "wildcard": return t('subnetting.type.wildcard');
      case "network": return t('subnetting.type.network');
      case "ipv6": return t('subnetting.type.ipv6');
      default: return t('subnetting.title');
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
            <h3 className="mt-2 text-lg font-medium text-slate-900 dark:text-zinc-100">{t('subnetting.calculateInfo')}</h3>
          </div>
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={generateNewQuestion}
              className="flex items-center gap-1 hover:bg-gray-300 dark:hover:bg-zinc-700"
            >
              <RefreshCw className="h-4 w-4" />
              {t('subnetting.newQuestion')}
            </Button>
          </div>
        </div>
        
        <div className="p-4 bg-slate-50 rounded-lg mb-6 dark:bg-zinc-900">
          <div className="text-slate-800 space-y-3 dark:text-zinc-100" dangerouslySetInnerHTML={{ __html: questionText }} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {answerFields.map(field => (
            <div key={field.id}>
              <label htmlFor={field.id} className="block text-sm font-medium text-slate-700 mb-2 dark:text-zinc-300">
                {field.label === "Network Address" ? t('subnetting.fields.networkAddress') :
                 field.label === "Broadcast Address" ? t('subnetting.fields.broadcastAddress') :
                 field.label === "First Host" ? t('subnetting.fields.firstHost') :
                 field.label === "Last Host" ? t('subnetting.fields.lastHost') :
                 field.label === "Subnet Mask" ? t('subnetting.fields.subnetMask') :
                 field.label === "Number of Hosts" ? t('subnetting.fields.numberOfHosts') :
                 field.label === "Wildcard Mask" ? t('subnetting.fields.wildcardMask') : 
                 field.label === "Summary Network" ? t('subnetting.fields.summaryNetwork') :
                 field.label === "Summary Mask" ? t('subnetting.fields.summaryMask') :
                 field.label === "Required Prefix" ? t('subnetting.fields.requiredPrefix') :
                 field.label === "Prefix Length" ? t('subnetting.fields.prefixLength') :
                 field.label}
              </label>
              {field.id === 'comprehensive-answer' ? (
                <textarea
                  id={field.id}
                  value={userAnswers[field.id] || ""}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  placeholder={
                    (language === 'en' ? 'eg. ' : 'bv. ') + 
                    (language === 'en' 
                      ? "Subnet mask in decimal: 255.255.255.0\nHost bits: 8\nCIDR for subnets: /24\n..."
                      : "Subnetmask in decimalen: 255.255.255.0\nHost-bits: 8\nCIDR voor subnetten: /24\n...")
                  }
                  rows={10}
                  className="shadow-sm focus:ring-secondary focus:border-secondary block w-full sm:text-sm border-slate-300 dark:border-zinc-900 dark:bg-zinc-900 font-mono"
                />
              ) : (
                <Input
                  id={field.id}
                  value={userAnswers[field.id] || ""}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  placeholder={
                    field.id === 'expanded-ipv6'
                      ? (language === 'en' ? 'eg. ' : 'bv. ') + "2001:0db8:0000:0000:0000:0000:0000:0001"
                      : field.id === 'abbreviated-ipv6'
                        ? (language === 'en' ? 'eg. ' : 'bv. ') + "2001:db8::1"
                        : field.id === 'usable-hosts' || field.id === 'host-count' || field.id === 'subnet-count'
                          ? (language === 'en' ? 'eg. ' : 'bv. ') + "16777214"
                          : field.id.includes('host') || field.id.includes('network') || field.id.includes('broadcast')
                            ? (language === 'en' ? 'eg. ' : 'bv. ') + "192.0.2.1"
                            : (field.id === 'subnet-mask' && (questionText.toLowerCase().includes('cidr') || questionText.toLowerCase().includes('prefix')))
                              ? t('subnetting.placeholder.cidr')
                              : (field.id === 'subnet-mask' && questionText.toLowerCase().includes('decimal'))
                                ? t('subnetting.placeholder.decimal')
                                : field.id === 'subnet-mask'
                                  ? t('subnetting.placeholder.mask')
                                  : t('subnetting.placeholder.ip')
                  }
                  className="shadow-sm focus:ring-secondary focus:border-secondary block w-full sm:text-sm border-slate-300 dark:border-zinc-900 dark:bg-zinc-900"
                />
              )}
            </div>
          ))}
        </div>
        
        {/* Kladblok / Scratch space */}
        <div className="mb-6">
          <h4 className="block text-sm font-medium text-slate-700 mb-2 dark:text-zinc-300">
            {language === 'en' ? 'Scratch pad' : 'Kladblok'}
          </h4>
          <textarea 
            className="shadow-sm focus:ring-secondary focus:border-secondary block w-full h-24 p-3 border-slate-300 rounded-md font-mono text-sm resize-y dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-200"
            placeholder={language === 'en' ? 'Use this space for calculations...' : 'Gebruik deze ruimte voor berekeningen...'}
          ></textarea>
        </div>
        
        <Button 
          onClick={checkAnswer} 
          disabled={isAnswered}
          className="w-full md:w-auto"
        >
          {t('subnetting.checkAnswer')}
        </Button>
        
        {/* Feedback section when answer is correct */}
        {isAnswered && isCorrect && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircle className="text-green-400 text-xl dark:text-green-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800 dark:text-green-400">{t('subnetting.correct')}</h3>
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
                <h3 className="text-sm font-medium text-red-800 dark:text-red-400">{t('subnetting.incorrect')}</h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  <p>{t('subnetting.correctAnswersAre')}</p>
                  <ul className="list-disc pl-5 mt-2">
                    {answerFields.map(field => (
                      <li key={field.id}>
                        <strong>
                          {field.label === "Network Address" ? t('subnetting.fields.networkAddress') :
                           field.label === "Broadcast Address" ? t('subnetting.fields.broadcastAddress') :
                           field.label === "First Host" ? t('subnetting.fields.firstHost') :
                           field.label === "Last Host" ? t('subnetting.fields.lastHost') :
                           field.label === "Subnet Mask" ? t('subnetting.fields.subnetMask') :
                           field.label === "Number of Hosts" ? t('subnetting.fields.numberOfHosts') :
                           field.label === "Wildcard Mask" ? t('subnetting.fields.wildcardMask') : 
                           field.label === "Summary Network" ? t('subnetting.fields.summaryNetwork') :
                           field.label === "Summary Mask" ? t('subnetting.fields.summaryMask') :
                           field.label === "Required Prefix" ? t('subnetting.fields.requiredPrefix') :
                           field.label === "Prefix Length" ? t('subnetting.fields.prefixLength') :
                           field.label}
                        :</strong> <span className="font-mono font-bold">{field.answer}</span>
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
          <div></div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleSkip}
              disabled={isAnswered}
              className="hover:bg-gray-300 dark:hover:bg-zinc-700"
            >
              {t('subnetting.skip')}
            </Button>
            <Button 
              onClick={handleNextQuestion}
              disabled={!isAnswered}
              className={!isAnswered ? "opacity-50 cursor-not-allowed bg-primary hover:bg-blue-600" : "bg-primary hover:bg-blue-600"}
            >
              {t('subnetting.nextQuestion')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

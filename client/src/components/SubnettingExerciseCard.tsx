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
  const { t, language } = useLanguage();
  const [questionText, setQuestionText] = useState("");
  const [answerFields, setAnswerFields] = useState<{
    id: string, 
    label: string, 
    answer: string, 
    alternateAnswers?: string[]
  }[]>([]);
  const [userAnswers, setUserAnswers] = useState<{[key: string]: string}>({});
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [explanation, setExplanation] = useState("");
  
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
      
      // Create an array of all acceptable answers (main answer + alternates)
      const allAcceptableAnswers = [correctAnswer];
      if (field.alternateAnswers && field.alternateAnswers.length > 0) {
        field.alternateAnswers.forEach(alt => allAcceptableAnswers.push(alt.toLowerCase()));
      }
      
      // For conversion questions between CIDR and decimal subnet mask notations
      if (field.id === 'subnet-mask') {
        // If we're asking about mask conversion, we need to be strict about the answer format
        // This means CIDR questions must be answered with CIDR and decimal questions with decimal
        
        // Check if the question asks for a specific format
        const questionAsksForCIDR = questionText.toLowerCase().includes('cidr') || 
                                   questionText.toLowerCase().includes('prefix');
        const questionAsksForDecimal = questionText.toLowerCase().includes('dotted decimal') || 
                                      questionText.toLowerCase().includes('decimal notation') ||
                                      (field.label && field.label.toLowerCase().includes('decimal'));
        
        // Clean up user input by removing any spaces
        const cleanUserAnswer = userAnswer.replace(/\s+/g, '');
        
        if (questionAsksForCIDR && !cleanUserAnswer.startsWith('/')) {
          // The user didn't provide a CIDR notation answer when asked for one
          return false;
        }
        
        if (questionAsksForDecimal && cleanUserAnswer.startsWith('/')) {
          // The user didn't provide a decimal notation answer when asked for one
          return false;
        }
        
        // For exact format match cases, do strict comparison
        if (cleanUserAnswer.startsWith('/') && correctAnswer.startsWith('/')) {
          // Both are CIDR, compare the numbers
          return parseInt(cleanUserAnswer.substring(1)) === parseInt(correctAnswer.substring(1));
        }
        
        // For decimal format, do a more flexible comparison
        if (!cleanUserAnswer.startsWith('/') && !correctAnswer.startsWith('/')) {
          const userParts = cleanUserAnswer.split(".").map(part => parseInt(part));
          const correctParts = correctAnswer.split(".").map(part => parseInt(part));
          
          if (userParts.length === 4 && correctParts.length === 4) {
            return userParts.every((part, i) => part === correctParts[i]);
          }
        }
        
        // For other cases, do normalized comparison (remove spaces, standardize formatting)
        return cleanUserAnswer === correctAnswer.replace(/\s+/g, '');
      }
      
      // For IP address-like answers (non-subnet mask questions)
      if (field.id.includes('address') || field.id.includes('host') || field.id.includes('subnet')) {
        // First check if any alternate answers are a direct match (including CIDR notation)
        if (allAcceptableAnswers.some(acceptableAnswer => {
          // Clean up answer and user input by removing spaces
          const cleanAcceptableAnswer = acceptableAnswer.replace(/\s+/g, '');
          const cleanUserAnswer = userAnswer.replace(/\s+/g, '');
          return cleanUserAnswer === cleanAcceptableAnswer;
        })) {
          return true;
        }
        
        // If not a direct match, try more flexible IP matching
        // First extract the IP portion if the user entered CIDR notation
        let cleanUserAnswer = userAnswer.replace(/\s+/g, '');
        // Remove any CIDR prefix if present
        if (cleanUserAnswer.includes('/')) {
          cleanUserAnswer = cleanUserAnswer.split('/')[0];
        }
        
        // Process all acceptable answers
        return allAcceptableAnswers.some(acceptableAnswer => {
          // Extract just the IP part if it's a CIDR notation
          let acceptableIP = acceptableAnswer;
          if (acceptableIP.includes('/')) {
            acceptableIP = acceptableIP.split('/')[0];
          }
          
          // Compare the IP portions
          const userParts = cleanUserAnswer.split(".").map(part => parseInt(part));
          const correctParts = acceptableIP.split(".").map(part => parseInt(part));
          
          if (userParts.length === 4 && correctParts.length === 4) {
            return userParts.every((part, i) => part === correctParts[i]);
          }
          
          return false;
        });
      }
      
      // Special case for IPv6 addresses
      if (field.id === 'expanded-ipv6' || field.id === 'abbreviated-ipv6') {
        // Remove any spaces and standardize case
        const cleanUserAnswer = userAnswer.replace(/\s+/g, '');
        const cleanCorrectAnswer = correctAnswer.replace(/\s+/g, '');
        
        // For expanded IPv6, we need to normalize the case and format
        if (field.id === 'expanded-ipv6') {
          // Ensure every segment has 4 hexadecimal digits
          const userSegments = cleanUserAnswer.split(':');
          const correctSegments = cleanCorrectAnswer.split(':');
          
          // Check if we have 8 segments
          if (userSegments.length !== 8 || correctSegments.length !== 8) {
            return false;
          }
          
          // Compare each segment after conversion to normalized form
          return userSegments.every((segment, i) => {
            const normalizedUserSegment = parseInt(segment, 16).toString(16).padStart(4, '0');
            const normalizedCorrectSegment = parseInt(correctSegments[i], 16).toString(16).padStart(4, '0');
            return normalizedUserSegment === normalizedCorrectSegment;
          });
        }
        
        // For abbreviated IPv6, normalize and compare the expanded forms
        // This is more complex but ensures different valid abbreviated forms match
        if (field.id === 'abbreviated-ipv6') {
          // Define a simplified inline helper function for expanding IPv6 in this scope
          const expandIPv6Inline = (abbreviatedIP: string): string => {
            // Handle edge cases
            if (!abbreviatedIP) return '';
            
            // If there's no ::, just pad each segment
            if (!abbreviatedIP.includes('::')) {
              return abbreviatedIP.split(':')
                .map(segment => segment.padStart(4, '0'))
                .join(':');
            }
            
            // Split around ::
            const parts = abbreviatedIP.split('::');
            
            // Handle edge cases like :: or ::1
            if (parts.length !== 2) {
              return abbreviatedIP; // Invalid format, return as-is
            }
            
            const leftPart = parts[0] ? parts[0].split(':') : [];
            const rightPart = parts[1] ? parts[1].split(':') : [];
            
            // Determine missing segments
            const missingSegments = 8 - leftPart.length - rightPart.length;
            
            // Build expanded address
            const expandedSegments = [
              ...leftPart.map(segment => segment.padStart(4, '0')),
              ...Array(missingSegments).fill('0000'),
              ...rightPart.map(segment => segment.padStart(4, '0'))
            ];
            
            return expandedSegments.join(':');
          };
          
          // Expand both answers using the inline function
          try {
            const expandUserAnswer = expandIPv6Inline(cleanUserAnswer);
            const expandCorrectAnswer = expandIPv6Inline(cleanCorrectAnswer);
            return expandUserAnswer === expandCorrectAnswer;
          } catch (e) {
            // If there's any error in parsing, fall back to exact match
            return cleanUserAnswer === cleanCorrectAnswer;
          }
        }
        
        // If not a specific IPv6 field, do a direct comparison
        return cleanUserAnswer === cleanCorrectAnswer;
      }
      
      // For any other field, check against all acceptable answers
      if (allAcceptableAnswers.some(acceptableAns => userAnswer === acceptableAns)) {
        return true;
      }
      // If no match in alternate answers, do the standard exact match
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
                      ? (language === 'en' ? 'eg. 2001:0db8:0000:0000:0000:0000:0000:0001' : 'bv. 2001:0db8:0000:0000:0000:0000:0000:0001')
                      : field.id === 'abbreviated-ipv6'
                        ? (language === 'en' ? 'eg. 2001:db8::1' : 'bv. 2001:db8::1')
                        : field.id === 'usable-hosts' || field.id === 'host-count' || field.id === 'subnet-count'
                          ? (language === 'en' ? 'eg. 16777214' : 'bv. 16777214')
                        : field.id === 'host-bits'
                          ? (language === 'en' ? 'eg. 4' : 'bv. 4')
                        : field.id === 'subnet-mask'
                          ? (language === 'en' ? 'eg. 255.255.255.0' : 'bv. 255.255.255.0')
                        : field.id === 'subnet-prefix' || field.id === 'cidr-prefix' || field.id.includes('cidr')
                          ? (language === 'en' ? 'eg. /24' : 'bv. /24')
                        : field.id === 'subnet-1' || field.label === 'Subnet 1' || field.label === 'Eerste Subnet (CIDR)'
                          ? (language === 'en' ? 'eg. 192.168.1.0/24' : 'bv. 192.168.1.0/24')
                        : field.id === 'subnet-2' || field.label === 'Subnet 2' || field.label === 'Tweede Subnet (CIDR)'
                          ? (language === 'en' ? 'eg. 192.168.1.16/28' : 'bv. 192.168.1.16/28')
                        : field.id === 'subnet-3' || field.label === 'Subnet 3' || field.label === 'Derde Subnet (CIDR)'
                          ? (language === 'en' ? 'eg. 192.168.1.32/28' : 'bv. 192.168.1.32/28')  
                        : field.id === 'subnet-4' || field.label === 'Subnet 4' || field.label === 'Vierde Subnet (CIDR)'
                          ? (language === 'en' ? 'eg. 192.168.1.48/28' : 'bv. 192.168.1.48/28')
                        : (field.id.includes('subnet') || field.label.includes('Subnet') || field.label.toLowerCase().includes('subnet'))
                          ? (language === 'en' ? 'eg. 192.168.1.64/28' : 'bv. 192.168.1.64/28')
                        : field.id.includes('network')
                          ? (language === 'en' ? 'eg. 192.168.1.0' : 'bv. 192.168.1.0')
                        : field.id.includes('broadcast')
                          ? (language === 'en' ? 'eg. 192.168.1.255' : 'bv. 192.168.1.255')
                        : field.id.includes('host')
                          ? (language === 'en' ? 'eg. 192.168.1.1' : 'bv. 192.168.1.1')
                        : language === 'en' ? 'Enter answer here' : 'Voer antwoord hier in'
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
            placeholder={language === 'en' ? 'Use this space for calculations and notes...' : 'Gebruik deze ruimte voor berekeningen en notities...'}
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
                        :</strong> <span className="font-mono font-bold">{field.answer.replace(/\s+/g, '')}</span>
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

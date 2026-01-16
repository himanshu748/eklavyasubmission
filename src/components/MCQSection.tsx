import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import MathRenderer from './MathRenderer';

interface MCQProps {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  wrongAnswerExplanations: Record<string, string>;
}

const MCQSection = ({ question, options, correctAnswer, explanation, wrongAnswerExplanations }: MCQProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (option: string) => {
    if (showResult) return;
    const letter = option.charAt(0);
    setSelectedAnswer(letter);
    setShowResult(true);
  };

  const isCorrect = selectedAnswer === correctAnswer;

  const getOptionStyle = (option: string) => {
    const letter = option.charAt(0);
    if (!showResult) {
      return 'border-border hover:border-accent hover:bg-accent/5';
    }
    if (letter === correctAnswer) {
      return 'border-success bg-success/10';
    }
    if (letter === selectedAnswer && letter !== correctAnswer) {
      return 'border-destructive bg-destructive/10';
    }
    return 'border-border opacity-60';
  };

  const getIcon = (option: string) => {
    const letter = option.charAt(0);
    if (!showResult) return null;
    if (letter === correctAnswer) {
      return <CheckCircle2 className="w-5 h-5 text-success" />;
    }
    if (letter === selectedAnswer && letter !== correctAnswer) {
      return <XCircle className="w-5 h-5 text-destructive" />;
    }
    return null;
  };

  const handleReset = () => {
    setSelectedAnswer(null);
    setShowResult(false);
  };

  return (
    <div className="space-y-6">
      {/* Question */}
      <div className="p-4 rounded-lg bg-muted/50 border border-border">
        <div className="flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
          <MathRenderer content={question} className="text-foreground font-medium" />
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {options.map((option, index) => (
          <motion.button
            key={index}
            onClick={() => handleSelect(option)}
            disabled={showResult}
            whileHover={!showResult ? { scale: 1.01 } : {}}
            whileTap={!showResult ? { scale: 0.99 } : {}}
            className={`w-full p-4 rounded-lg border-2 text-left transition-all flex items-center justify-between ${getOptionStyle(option)} disabled:cursor-default`}
          >
            <MathRenderer content={option} className="text-foreground" />
            {getIcon(option)}
          </motion.button>
        ))}
      </div>

      {/* Result */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Correct/Incorrect Banner */}
            <div className={`p-4 rounded-lg ${isCorrect ? 'bg-success/10 border border-success/30' : 'bg-destructive/10 border border-destructive/30'}`}>
              <div className="flex items-center gap-2 mb-2">
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    <span className="font-semibold text-success">Correct!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-destructive" />
                    <span className="font-semibold text-destructive">Incorrect</span>
                  </>
                )}
              </div>
              <MathRenderer 
                content={isCorrect ? explanation : (wrongAnswerExplanations[selectedAnswer!] || explanation)} 
                className="text-foreground text-sm" 
              />
            </div>

            {/* Why correct answer is correct (if wrong) */}
            {!isCorrect && (
              <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                <p className="text-sm font-semibold text-accent mb-2">
                  Why {correctAnswer}) is correct:
                </p>
                <MathRenderer content={explanation} className="text-foreground text-sm" />
              </div>
            )}

            {/* Other wrong answers explanation */}
            {Object.entries(wrongAnswerExplanations).filter(([key]) => key !== selectedAnswer && key !== correctAnswer).length > 0 && (
              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <p className="text-sm font-semibold text-muted-foreground mb-3">Why other options are wrong:</p>
                <div className="space-y-2">
                  {Object.entries(wrongAnswerExplanations)
                    .filter(([key]) => key !== selectedAnswer && key !== correctAnswer)
                    .map(([key, value]) => (
                      <div key={key} className="text-sm">
                        <span className="font-medium text-foreground">{key})</span>{' '}
                        <MathRenderer content={value} className="inline text-muted-foreground" />
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Try Again Button */}
            <button
              onClick={handleReset}
              className="w-full py-3 rounded-lg border-2 border-border hover:border-accent hover:bg-accent/5 text-foreground font-medium transition-all"
            >
              Try Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MCQSection;

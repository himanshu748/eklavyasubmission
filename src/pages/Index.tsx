import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen, Calculator, HelpCircle, Lightbulb, ListChecks } from 'lucide-react';
import TopicInput from '@/components/TopicInput';
import LoadingState from '@/components/LoadingState';
import ExplanationCard from '@/components/ExplanationCard';
import StepBreakdown from '@/components/StepBreakdown';
import WorkedExample from '@/components/WorkedExample';
import MCQSection from '@/components/MCQSection';
import KeyTakeaways from '@/components/KeyTakeaways';
import MathRenderer from '@/components/MathRenderer';
import { useToast } from '@/hooks/use-toast';

interface ExplanationData {
  title: string;
  overview: string;
  steps: Array<{
    stepNumber: number;
    title: string;
    content: string;
  }>;
  workedExample: {
    problem: string;
    given: string[];
    toFind: string;
    solution: Array<{
      step: number;
      explanation: string;
      calculation: string;
    }>;
    answer: string;
  };
  mcq: {
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
    wrongAnswerExplanations: Record<string, string>;
  };
  keyTakeaways: string[];
}

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState<ExplanationData | null>(null);
  const [currentTopic, setCurrentTopic] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (topic: string) => {
    setIsLoading(true);
    setExplanation(null);
    setCurrentTopic(topic);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/explain-topic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 429) {
          toast({
            title: "Rate limit exceeded",
            description: "Please wait a moment and try again.",
            variant: "destructive",
          });
        } else if (response.status === 402) {
          toast({
            title: "Usage limit reached",
            description: "Please add credits to continue using the AI.",
            variant: "destructive",
          });
        } else {
          throw new Error(errorData.error || 'Failed to generate explanation');
        }
        return;
      }

      const data = await response.json();
      
      if (data.rawContent) {
        // Handle case where JSON parsing failed on backend
        toast({
          title: "Parsing error",
          description: "The AI response couldn't be properly formatted. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setExplanation(data);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setExplanation(null);
    setCurrentTopic('');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-xl font-serif text-foreground">Concept Explainer</span>
          </div>
          {explanation && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              New Topic
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {!explanation && !isLoading && (
            <motion.div
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <TopicInput onSubmit={handleSubmit} isLoading={isLoading} />
            </motion.div>
          )}

          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoadingState />
            </motion.div>
          )}

          {explanation && !isLoading && (
            <motion.div
              key="explanation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              {/* Title & Overview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <h1 className="text-3xl md:text-4xl font-serif text-foreground mb-4">
                  {explanation.title}
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  <MathRenderer content={explanation.overview} />
                </p>
              </motion.div>

              {/* Step Breakdown */}
              <ExplanationCard
                title="Concept Breakdown"
                icon={<ListChecks className="w-5 h-5" />}
                delay={0.1}
              >
                <StepBreakdown steps={explanation.steps} />
              </ExplanationCard>

              {/* Worked Example */}
              <ExplanationCard
                title="Worked Example"
                icon={<Calculator className="w-5 h-5" />}
                delay={0.2}
              >
                <WorkedExample {...explanation.workedExample} />
              </ExplanationCard>

              {/* MCQ */}
              <ExplanationCard
                title="Practice Question"
                icon={<HelpCircle className="w-5 h-5" />}
                delay={0.3}
              >
                <MCQSection {...explanation.mcq} />
              </ExplanationCard>

              {/* Key Takeaways */}
              <ExplanationCard
                title="Key Takeaways"
                icon={<Lightbulb className="w-5 h-5" />}
                delay={0.4}
              >
                <KeyTakeaways takeaways={explanation.keyTakeaways} />
              </ExplanationCard>

              {/* Try Another Topic */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-center pt-8"
              >
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-all shadow-md hover:shadow-lg"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Explore Another Topic
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>AI-powered concept explanations for JEE & NEET preparation</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

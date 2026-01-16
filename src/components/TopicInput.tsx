import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles, BookOpen, Atom, Calculator, FlaskConical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TopicInputProps {
  onSubmit: (topic: string) => void;
  isLoading: boolean;
}

const suggestedTopics = [
  { label: "Newton's Laws", icon: Atom },
  { label: "Machine Learning Basics", icon: Calculator },
  { label: "World War II", icon: BookOpen },
  { label: "Photosynthesis", icon: FlaskConical },
];

const TopicInput = ({ onSubmit, isLoading }: TopicInputProps) => {
  const [topic, setTopic] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      onSubmit(topic.trim());
    }
  };

  const handleSuggestionClick = (suggestedTopic: string) => {
    setTopic(suggestedTopic);
    onSubmit(suggestedTopic);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent mb-6"
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">AI-Powered Learning</span>
        </motion.div>
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-foreground mb-4">
          Concept Explainer
        </h1>
        <p className="text-lg text-muted-foreground max-w-lg mx-auto">
          Enter any topic and get a crystal-clear explanation with worked examples and practice questions.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Search className="w-5 h-5" />
          </div>
          <Input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Newton's Laws, Machine Learning, World History, Photosynthesis..."
            className="w-full pl-12 pr-32 py-6 text-lg rounded-xl border-2 border-border bg-card shadow-sm focus:border-accent focus:ring-accent transition-all"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={!topic.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Generating
              </span>
            ) : (
              'Explain'
            )}
          </Button>
        </div>
      </form>

      <div className="space-y-3">
        <p className="text-sm text-muted-foreground text-center">Try these topics:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {suggestedTopics.map(({ label, icon: Icon }) => (
            <motion.button
              key={label}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSuggestionClick(label)}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border hover:border-accent hover:bg-accent/5 text-foreground text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon className="w-4 h-4 text-accent" />
              {label}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default TopicInput;

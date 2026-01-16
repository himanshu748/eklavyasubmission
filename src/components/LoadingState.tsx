import { motion } from 'framer-motion';
import { Brain, BookOpen, Calculator, Sparkles } from 'lucide-react';

const loadingSteps = [
  { icon: Brain, text: 'Analyzing topic...' },
  { icon: BookOpen, text: 'Building concept breakdown...' },
  { icon: Calculator, text: 'Creating worked example...' },
  { icon: Sparkles, text: 'Generating practice question...' },
];

const LoadingState = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-2xl mx-auto py-16"
    >
      <div className="text-center mb-12">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-6"
        >
          <Brain className="w-8 h-8 text-accent" />
        </motion.div>
        <h2 className="text-2xl font-serif text-foreground mb-2">Generating Explanation</h2>
        <p className="text-muted-foreground">This may take a few moments...</p>
      </div>

      <div className="space-y-4">
        {loadingSteps.map(({ icon: Icon, text }, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.5, duration: 0.4 }}
            className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border"
          >
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ delay: index * 0.5, duration: 1.5, repeat: Infinity }}
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent/10"
            >
              <Icon className="w-5 h-5 text-accent" />
            </motion.div>
            <span className="text-foreground font-medium">{text}</span>
            <motion.div
              animate={{ opacity: [0, 1, 0] }}
              transition={{ delay: index * 0.5 + 0.5, duration: 1, repeat: Infinity }}
              className="ml-auto flex gap-1"
            >
              <span className="w-2 h-2 rounded-full bg-accent" />
              <span className="w-2 h-2 rounded-full bg-accent" />
              <span className="w-2 h-2 rounded-full bg-accent" />
            </motion.div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default LoadingState;

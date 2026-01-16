import { motion } from 'framer-motion';
import MathRenderer from './MathRenderer';

interface SolutionStep {
  step: number;
  explanation: string;
  calculation: string;
}

interface WorkedExampleProps {
  problem: string;
  given: string[];
  toFind: string;
  solution: SolutionStep[];
  answer: string;
}

const WorkedExample = ({ problem, given, toFind, solution, answer }: WorkedExampleProps) => {
  return (
    <div className="space-y-6">
      {/* Problem Statement */}
      <div className="p-4 rounded-lg bg-muted/50 border border-border">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Problem</h4>
        <MathRenderer content={problem} className="text-foreground font-medium" />
      </div>

      {/* Given & To Find */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
          <h4 className="text-sm font-semibold text-accent uppercase tracking-wide mb-2">Given</h4>
          <ul className="space-y-1">
            {given.map((item, index) => (
              <li key={index} className="text-foreground">
                <MathRenderer content={`• ${item}`} />
              </li>
            ))}
          </ul>
        </div>
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
          <h4 className="text-sm font-semibold text-primary uppercase tracking-wide mb-2">To Find</h4>
          <MathRenderer content={toFind} className="text-foreground" />
        </div>
      </div>

      {/* Solution Steps */}
      <div>
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Solution</h4>
        <div className="space-y-4">
          {solution.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className="pl-4 border-l-2 border-accent/30"
            >
              <p className="text-sm text-muted-foreground mb-1">Step {step.step}: {step.explanation}</p>
              <MathRenderer content={step.calculation} className="text-foreground" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Answer */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        className="p-4 rounded-lg bg-success/10 border border-success/30"
      >
        <h4 className="text-sm font-semibold text-success uppercase tracking-wide mb-2">Answer</h4>
        <MathRenderer content={answer} className="text-foreground font-semibold text-lg" />
      </motion.div>
    </div>
  );
};

export default WorkedExample;

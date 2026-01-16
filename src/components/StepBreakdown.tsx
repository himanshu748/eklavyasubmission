import { motion } from 'framer-motion';
import MathRenderer from './MathRenderer';

interface Step {
  stepNumber: number;
  title: string;
  content: string;
}

interface StepBreakdownProps {
  steps: Step[];
}

const StepBreakdown = ({ steps }: StepBreakdownProps) => {
  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <motion.div
          key={step.stepNumber}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1, duration: 0.4 }}
          className="flex gap-4"
        >
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
              {step.stepNumber}
            </div>
          </div>
          <div className="flex-1 pb-4 border-b border-border last:border-0 last:pb-0">
            <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
            <MathRenderer 
              content={step.content} 
              className="text-muted-foreground"
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default StepBreakdown;

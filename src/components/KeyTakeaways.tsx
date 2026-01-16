import { motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';
import MathRenderer from './MathRenderer';

interface KeyTakeawaysProps {
  takeaways: string[];
}

const KeyTakeaways = ({ takeaways }: KeyTakeawaysProps) => {
  return (
    <div className="space-y-3">
      {takeaways.map((takeaway, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1, duration: 0.3 }}
          className="flex items-start gap-3 p-3 rounded-lg bg-accent/5 border border-accent/20"
        >
          <Lightbulb className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
          <MathRenderer content={takeaway} className="text-foreground" />
        </motion.div>
      ))}
    </div>
  );
};

export default KeyTakeaways;

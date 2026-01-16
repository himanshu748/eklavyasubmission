import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ExplanationCardProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  delay?: number;
}

const ExplanationCard = ({ title, icon, children, delay = 0 }: ExplanationCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="bg-card rounded-xl border border-border shadow-sm overflow-hidden"
    >
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-muted/30">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/10 text-accent">
          {icon}
        </div>
        <h2 className="text-xl font-serif text-foreground">{title}</h2>
      </div>
      <div className="p-6">
        {children}
      </div>
    </motion.div>
  );
};

export default ExplanationCard;

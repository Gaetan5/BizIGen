'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Lightbulb, 
  Target, 
  TrendingUp, 
  Users, 
  DollarSign, 
  BarChart3,
  Rocket,
  FileText,
  HelpCircle
} from 'lucide-react';

// Default suggestions for entrepreneurs
const DEFAULT_SUGGESTIONS = [
  {
    text: 'Comment structurer mon business plan ?',
    icon: FileText,
    category: 'Plan',
  },
  {
    text: 'Quels sont les éléments clés d\'un Business Model Canvas ?',
    icon: BarChart3,
    category: 'BMC',
  },
  {
    text: 'Comment identifier mes segments de clients ?',
    icon: Users,
    category: 'Clients',
  },
  {
    text: 'Comment définir ma proposition de valeur unique ?',
    icon: Target,
    category: 'Valeur',
  },
  {
    text: 'Quelles sont les sources de revenus possibles ?',
    icon: DollarSign,
    category: 'Revenus',
  },
  {
    text: 'Comment analyser mes concurrents ?',
    icon: TrendingUp,
    category: 'Analyse',
  },
  {
    text: 'Comment estimer mes coûts de démarrage ?',
    icon: DollarSign,
    category: 'Finances',
  },
  {
    text: 'Quelles sont les étapes pour lancer mon projet ?',
    icon: Rocket,
    category: 'Lancement',
  },
];

interface Suggestion {
  text: string;
  icon?: typeof Lightbulb;
  category?: string;
}

interface ChatSuggestionsProps {
  suggestions?: string[];
  onSelect: (suggestion: string) => void;
  isLoading?: boolean;
  className?: string;
}

export function ChatSuggestions({
  suggestions,
  onSelect,
  isLoading = false,
  className,
}: ChatSuggestionsProps) {
  // Convert string suggestions to object format or use defaults
  const displaySuggestions: Suggestion[] = suggestions && suggestions.length > 0
    ? suggestions.map((text, index) => ({
        text,
        icon: DEFAULT_SUGGESTIONS[index % DEFAULT_SUGGESTIONS.length].icon,
        category: DEFAULT_SUGGESTIONS[index % DEFAULT_SUGGESTIONS.length].category,
      }))
    : DEFAULT_SUGGESTIONS;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24,
      },
    },
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <Lightbulb className="h-4 w-4 text-amber-500" />
        <span className="text-sm font-medium text-muted-foreground">
          Suggestions
        </span>
      </div>

      {/* Suggestions grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-wrap gap-2"
      >
        {displaySuggestions.map((suggestion, index) => {
          const Icon = suggestion.icon || Lightbulb;
          
          return (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <button
                onClick={() => onSelect(suggestion.text)}
                disabled={isLoading}
                className={cn(
                  'group relative flex items-center gap-2 px-3 py-2 rounded-xl',
                  'bg-gradient-to-br from-background to-muted/50',
                  'border border-border/50 hover:border-violet-500/30',
                  'shadow-sm hover:shadow-md transition-all duration-300',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'cursor-pointer text-left'
                )}
              >
                {/* Glassmorphism overlay */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                
                {/* Icon */}
                <div className="relative flex-shrink-0 w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center">
                  <Icon className="h-3 w-3 text-violet-600 dark:text-violet-400" />
                </div>
                
                {/* Text */}
                <span className="relative text-sm text-foreground/80 group-hover:text-foreground transition-colors line-clamp-1">
                  {suggestion.text}
                </span>

                {/* Category badge */}
                {suggestion.category && (
                  <Badge 
                    variant="secondary" 
                    className="relative text-[10px] px-1.5 py-0 h-4 bg-violet-500/10 text-violet-600 dark:text-violet-400 border-0"
                  >
                    {suggestion.category}
                  </Badge>
                )}
              </button>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Help text */}
      <div className="flex items-center gap-1.5 mt-4 px-1">
        <HelpCircle className="h-3 w-3 text-muted-foreground/50" />
        <span className="text-xs text-muted-foreground/50">
          Cliquez sur une suggestion ou posez votre propre question
        </span>
      </div>
    </div>
  );
}

export default ChatSuggestions;

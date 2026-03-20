'use client';

import { useState, useRef, useEffect, KeyboardEvent, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Send, Loader2, Paperclip, Mic, Sparkles } from 'lucide-react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  isLoading?: boolean;
  avatar?: string;
}

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function ChatInput({
  onSend,
  isLoading = false,
  disabled = false,
  placeholder = 'Posez votre question sur votre projet business...',
  className,
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [message]);

  // Focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    if (message.trim() && !isLoading && !disabled) {
      onSend(message.trim());
      setMessage('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isSendDisabled = !message.trim() || isLoading || disabled;

  return (
    <div className={cn('relative', className)}>
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-fuchsia-500/5 to-violet-500/5 rounded-2xl pointer-events-none" />
      
      <form
        onSubmit={handleSubmit}
        className="relative flex items-end gap-2 p-3 rounded-2xl border border-border/50 bg-background/80 backdrop-blur-xl shadow-lg"
      >
        {/* Attachment button (visual only for now) */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="flex-shrink-0 h-9 w-9 text-muted-foreground hover:text-foreground"
          disabled={disabled}
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        {/* Textarea */}
        <div className="relative flex-1 min-w-0">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            rows={1}
            className={cn(
              'w-full min-h-[40px] max-h-[200px] resize-none border-0 bg-transparent',
              'focus-visible:ring-0 focus-visible:ring-offset-0',
              'placeholder:text-muted-foreground/60',
              'text-sm leading-relaxed'
            )}
            style={{ overflow: 'hidden' }}
          />
          
          {/* Typing indicator sparkles */}
          <AnimatePresence>
            {message.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
              >
                <Sparkles className="h-3 w-3 text-violet-400/50" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Voice button (visual only for now) */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="flex-shrink-0 h-9 w-9 text-muted-foreground hover:text-foreground hidden sm:flex"
          disabled={disabled}
        >
          <Mic className="h-4 w-4" />
        </Button>

        {/* Send button */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            type="submit"
            size="icon"
            disabled={isSendDisabled}
            className={cn(
              'flex-shrink-0 h-9 w-9 rounded-xl transition-all duration-300',
              'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500',
              'disabled:from-muted disabled:to-muted disabled:opacity-50',
              'shadow-md hover:shadow-lg'
            )}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </motion.div>
      </form>

      {/* Keyboard shortcut hint */}
      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground/50 whitespace-nowrap">
        <span className="hidden sm:inline">Entrée pour envoyer • </span>
        <span>Shift+Entrée pour nouvelle ligne</span>
      </div>
    </div>
  );
}

export default ChatInput;

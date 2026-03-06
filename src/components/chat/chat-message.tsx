'use client';

import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Bot, User, Sparkles } from 'lucide-react';
import type { Message } from './chat-input';

interface ChatMessageProps {
  message: Message;
  isLatest?: boolean;
}

export function ChatMessage({ message, isLatest = false }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const timestamp = message.timestamp 
    ? new Date(message.timestamp).toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.3, 
        ease: 'easeOut',
        delay: isLatest ? 0.1 : 0
      }}
      className={cn(
        'group flex gap-3 px-4 py-3',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
        className="flex-shrink-0"
      >
        <Avatar className={cn(
          'h-8 w-8 transition-shadow duration-300',
          isUser 
            ? 'bg-primary/10 ring-2 ring-primary/20' 
            : 'bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 ring-2 ring-violet-500/30'
        )}>
          {isUser ? (
            <>
              <AvatarImage src={message.avatar} />
              <AvatarFallback className="bg-transparent">
                <User className="h-4 w-4 text-primary" />
              </AvatarFallback>
            </>
          ) : (
            <AvatarFallback className="bg-transparent">
              <div className="relative">
                <Bot className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                <Sparkles className="h-2.5 w-2.5 text-fuchsia-500 absolute -top-1 -right-1" />
              </div>
            </AvatarFallback>
          )}
        </Avatar>
      </motion.div>

      {/* Message Content */}
      <div className={cn(
        'flex flex-col gap-1 max-w-[80%] md:max-w-[70%]',
        isUser ? 'items-end' : 'items-start'
      )}>
        <motion.div
          initial={{ opacity: 0, x: isUser ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className={cn(
            'relative rounded-2xl px-4 py-3 shadow-sm',
            'backdrop-blur-sm transition-all duration-300',
            isUser 
              ? 'bg-primary text-primary-foreground rounded-tr-sm' 
              : 'bg-muted/80 dark:bg-muted/50 border border-border/50 rounded-tl-sm'
          )}
        >
          {/* Glassmorphism overlay for assistant messages */}
          {!isUser && (
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          )}
          
          {/* Message text/markdown */}
          <div className={cn(
            'relative z-10 text-sm leading-relaxed',
            isUser ? 'text-primary-foreground' : 'text-foreground'
          )}>
            {isUser ? (
              <p className="whitespace-pre-wrap">{message.content}</p>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-headings:text-foreground prose-strong:text-foreground prose-li:my-0.5">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            )}
          </div>

          {/* Typing indicator for loading state */}
          {message.isLoading && (
            <div className="flex items-center gap-1 mt-1">
              <motion.span
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
                className="w-1.5 h-1.5 bg-violet-500 rounded-full"
              />
              <motion.span
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                className="w-1.5 h-1.5 bg-violet-500 rounded-full"
              />
              <motion.span
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
                className="w-1.5 h-1.5 bg-violet-500 rounded-full"
              />
            </div>
          )}
        </motion.div>

        {/* Timestamp */}
        {timestamp && !message.isLoading && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className={cn(
              'text-[10px] text-muted-foreground px-1 opacity-0 group-hover:opacity-100 transition-opacity',
              isUser ? 'text-right' : 'text-left'
            )}
          >
            {timestamp}
          </motion.span>
        )}
      </div>
    </motion.div>
  );
}

export default ChatMessage;

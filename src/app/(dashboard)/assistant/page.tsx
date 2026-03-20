'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { chatApi } from '@/lib/fastapi-client';
import { ChatMessage } from '@/components/chat/chat-message';
import { ChatInput, Message } from '@/components/chat/chat-input';
import { ChatSuggestions } from '@/components/chat/suggestions';
import {
  Bot,
  Sparkles,
  MessageSquare,
  Plus,
  Trash2,
  History,
  Menu,
  Zap,
  Shield,
  Clock,
  Rocket,
  Target,
  Lightbulb,
  TrendingUp,
  FileText,
  Send,
} from 'lucide-react';

// Types
interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// Welcome message
const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: `# Bienvenue dans BizGen AI Assistant ! 👋

Je suis votre assistant IA spécialisé dans l'accompagnement des entrepreneurs africains. Je peux vous aider à :

- **📊 Structurer votre business plan** et définir vos objectifs
- **🎨 Créer votre Business Model Canvas** étape par étape
- **🔍 Analyser votre marché** et identifier vos opportunités
- **💰 Optimiser votre stratégie** commerciale et financière

Comment puis-je vous aider aujourd'hui ?`,
  timestamp: new Date(),
};

// Quick action cards
const QUICK_ACTIONS = [
  { icon: Lightbulb, title: 'Idée business', desc: 'Valider mon idée', color: 'from-amber-500 to-orange-500' },
  { icon: Target, title: 'BMC', desc: 'Créer mon canvas', color: 'from-emerald-500 to-teal-500' },
  { icon: FileText, title: 'Business Plan', desc: 'Rédiger mon BP', color: 'from-blue-500 to-cyan-500' },
  { icon: TrendingUp, title: 'Stratégie', desc: 'Définir ma stratégie', color: 'from-purple-500 to-pink-500' },
];

// Feature cards data
const FEATURES = [
  { icon: Zap, title: 'Rapide', description: 'Réponses instantanées' },
  { icon: Shield, title: 'Sécurisé', description: 'Données protégées' },
  { icon: Clock, title: '24/7', description: 'Toujours disponible' },
];

export default function AssistantPage() {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load conversations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('bizgen_conversations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConversations(parsed.map((c: Conversation) => ({
          ...c,
          createdAt: new Date(c.createdAt),
          updatedAt: new Date(c.updatedAt),
        })));
      } catch (e) {
        console.error('Failed to load conversations:', e);
      }
    }
  }, []);

  // Save conversations to localStorage
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('bizgen_conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  // Create new conversation
  const createNewConversation = useCallback(() => {
    const newConversation: Conversation = {
      id: generateId(),
      title: 'Nouvelle conversation',
      messages: [WELCOME_MESSAGE],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversationId(newConversation.id);
    setMessages([WELCOME_MESSAGE]);
    setShowSidebar(false);
  }, []);

  // Select conversation
  const selectConversation = useCallback((conversation: Conversation) => {
    setCurrentConversationId(conversation.id);
    setMessages(conversation.messages);
    setShowSidebar(false);
  }, []);

  // Delete conversation
  const deleteConversation = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversations(prev => prev.filter(c => c.id !== id));
    if (currentConversationId === id) {
      setCurrentConversationId(null);
      setMessages([WELCOME_MESSAGE]);
    }
  }, [currentConversationId]);

  // Send message
  const handleSend = async (content: string) => {
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    const loadingMessage: Message = {
      id: 'loading',
      role: 'assistant',
      content: '',
      isLoading: true,
    };

    // Add user message and loading indicator
    setMessages(prev => [...prev, userMessage, loadingMessage]);

    setIsLoading(true);

    try {
      const response = await chatApi.send(content, currentConversationId);

      if (response.success && response.data) {
        const assistantMessage: Message = {
          id: generateId(),
          role: 'assistant',
          content: response.data.response,
          timestamp: new Date(),
        };

        // Remove loading and add assistant response
        setMessages(prev => [...prev.slice(0, -1), assistantMessage]);

        // Update suggestions
        if (response.data.suggestions) {
          setSuggestions(response.data.suggestions);
        }

        // Update conversation
        if (currentConversationId) {
          setConversations(prev => prev.map(c => {
            if (c.id === currentConversationId) {
              const updatedMessages = [...c.messages, userMessage, assistantMessage];
              return {
                ...c,
                messages: updatedMessages,
                title: c.messages.length === 1 ? content.substring(0, 50) + '...' : c.title,
                updatedAt: new Date(),
              };
            }
            return c;
          }));
        } else {
          // Create new conversation with these messages
          const newConversation: Conversation = {
            id: generateId(),
            title: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
            messages: [WELCOME_MESSAGE, userMessage, assistantMessage],
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          setConversations(prev => [newConversation, ...prev]);
          setCurrentConversationId(newConversation.id);
        }
      } else {
        // Error handling
        const errorMessage: Message = {
          id: generateId(),
          role: 'assistant',
          content: `Désolé, une erreur s'est produite. Veuillez réessayer.\n\n${response.error || 'Erreur inconnue'}`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev.slice(0, -1), errorMessage]);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: 'Désolé, je n\'ai pas pu traiter votre demande. Vérifiez votre connexion et réessayez.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev.slice(0, -1), errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    handleSend(suggestion);
  };

  // Handle quick action click
  const handleQuickAction = (action: typeof QUICK_ACTIONS[0]) => {
    const prompts: Record<string, string> = {
      'Idée business': 'J\'ai une idée business que je souhaite valider. Pouvez-vous m\'aider à l\'analyser ?',
      'BMC': 'Aidez-moi à créer mon Business Model Canvas étape par étape.',
      'Business Plan': 'Je souhaite rédiger un business plan professionnel. Par où dois-je commencer ?',
      'Stratégie': 'Aidez-moi à définir une stratégie commerciale efficace pour mon business.',
    };
    handleSend(prompts[action.title] || `Aidez-moi avec : ${action.title}`);
  };

  // Sidebar content
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border/50">
        <Button
          onClick={createNewConversation}
          className="w-full gap-2 btn-gradient shadow-lg shadow-primary/25"
        >
          <Plus className="h-4 w-4" />
          Nouvelle conversation
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Aucune conversation</p>
              <p className="text-xs mt-1">Commencez à discuter !</p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <motion.button
                key={conversation.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => selectConversation(conversation)}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all group',
                  'hover:bg-muted/50',
                  currentConversationId === conversation.id && 'bg-primary/10 border border-primary/20'
                )}
              >
                <MessageSquare className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{conversation.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {conversation.messages.length - 1} messages
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                  onClick={(e) => deleteConversation(conversation.id, e)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </motion.button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 border-r border-border/50 bg-muted/20 flex-col">
        <SidebarContent />
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-background">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-background/80 backdrop-blur-lg">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <Sheet open={showSidebar} onOpenChange={setShowSidebar}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden hover:bg-primary/10">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-80">
                <SidebarContent />
              </SheetContent>
            </Sheet>

            {/* Assistant info */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg shadow-primary/25">
                  <Bot className="h-5 w-5 text-primary-foreground" />
                </div>
                {/* Online indicator */}
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background animate-pulse" />
              </div>
              <div>
                <h1 className="font-semibold">BizGen AI Assistant</h1>
                <p className="text-xs text-muted-foreground">Toujours disponible pour vous aider</p>
              </div>
            </div>
          </div>

          {/* Feature badges */}
          <div className="hidden lg:flex items-center gap-4">
            {FEATURES.map((feature, i) => (
              <div key={i} className="flex items-center gap-1.5 text-muted-foreground">
                <feature.icon className="h-4 w-4" />
                <span className="text-xs">{feature.title}</span>
              </div>
            ))}
          </div>

          {/* Status badge */}
          <Badge variant="outline" className="hidden sm:flex gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            En ligne
          </Badge>
        </header>

        {/* Messages Area */}
        <ScrollArea className="flex-1" ref={scrollRef}>
          <div className="max-w-4xl mx-auto">
            {/* Messages */}
            <div className="space-y-1 py-4">
              <AnimatePresence mode="popLayout">
                {messages.map((message, index) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    isLatest={index === messages.length - 1}
                  />
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions - show at welcome */}
            {!isLoading && messages.length === 1 && (
              <div className="px-4 pb-4 animate-fade-in-up">
                <p className="text-sm text-muted-foreground mb-3 text-center">Choisissez une action rapide :</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {QUICK_ACTIONS.map((action, i) => (
                    <motion.button
                      key={action.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      onClick={() => handleQuickAction(action)}
                      className="group p-4 rounded-xl border border-border/50 bg-card/50 hover:bg-card hover:border-primary/30 transition-all text-left"
                    >
                      <div className={`
                        w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} 
                        flex items-center justify-center mb-3 shadow-lg
                        group-hover:scale-110 transition-transform
                      `}>
                        <action.icon className="w-5 h-5 text-white" />
                      </div>
                      <p className="font-medium text-sm">{action.title}</p>
                      <p className="text-xs text-muted-foreground">{action.desc}</p>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {!isLoading && messages.length <= 2 && suggestions.length > 0 && (
              <div className="px-4 pb-4">
                <ChatSuggestions
                  suggestions={suggestions}
                  onSelect={handleSuggestionClick}
                  isLoading={isLoading}
                />
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-border/50 bg-background/80 backdrop-blur-xl p-4">
          <div className="max-w-4xl mx-auto pb-2">
            <ChatInput
              onSend={handleSend}
              isLoading={isLoading}
              placeholder="Posez votre question sur votre projet business..."
            />
            <p className="text-xs text-center text-muted-foreground mt-3">
              BizGen AI peut faire des erreurs. Vérifiez les informations importantes.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

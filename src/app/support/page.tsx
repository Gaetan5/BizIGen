'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function SupportPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Bonjour ! Je suis l\'assistant IA de Biz-IGen. Comment puis-je vous aider avec vos business plans ou l\'utilisation de la plateforme ?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/support/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          context: 'Support Biz-IGen - Aide utilisateurs pour business plans, BMC, Lean Canvas'
        }),
      });

      const data = await response.json();
      const assistantMessage: Message = { role: 'assistant', content: data.response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Désolé, une erreur s\'est produite. Veuillez réessayer.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>Support Biz-IGen</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96 w-full border rounded-md p-4 mb-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-100 ml-12'
                      : 'bg-gray-100 mr-12'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              ))}
              {loading && (
                <div className="bg-gray-100 mr-12 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">L'assistant tape...</p>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tapez votre question..."
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              disabled={loading}
            />
            <Button onClick={sendMessage} disabled={loading}>
              Envoyer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

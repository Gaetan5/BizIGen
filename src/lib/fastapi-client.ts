/**
 * FastAPI Client - Unified API Client
 * This client was originally intended for a separate FastAPI backend.
 * To simplify architecture and stabilize the backend, it now routes calls 
 * to the Next.js internal API.
 */

export const chatApi = {
  /**
   * Send a message to the AI assistant
   */
  async send(message: string, projectId?: string | null, context?: string) {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          projectId,
          context,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Erreur lors de la communication avec l\'assistant',
        };
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      console.error('Chat API Error:', error);
      return {
        success: false,
        error: 'Impossible de contacter le service assistant',
      };
    }
  },

  /**
   * Stream a response from the AI assistant in real-time
   */
  async stream(
    message: string,
    projectId?: string | null,
    context?: string,
    onChunk?: (chunk: string) => void,
    onDone?: (fullText: string, suggestions: string[]) => void,
    onError?: (error: string) => void
  ) {
    try {
      const response = await fetch('/api/chat?stream=true', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          projectId,
          context,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errMsg = errorData.error || 'Erreur lors du streaming de la réponse';
        onError?.(errMsg);
        return { success: false, error: errMsg };
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      let done = false;

      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;
        if (value) {
          const chunkStr = decoder.decode(value, { stream: !done });
          const lines = chunkStr.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6).trim();
              if (dataStr === '[DONE]') {
                done = true;
                break;
              }
              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.text) {
                  fullText += parsed.text;
                  onChunk?.(parsed.text);
                }
              } catch {
                // Raw text chunk fallback
                if (dataStr) {
                  fullText += dataStr;
                  onChunk?.(dataStr);
                }
              }
            }
          }
        }
      }

      onDone?.(fullText, ['Comment valider ce modèle ?', 'Quels indicateurs suivre ?', 'Prochaine étape']);
      return { success: true, fullText };
    } catch (error: any) {
      console.error('Chat stream error:', error);
      onError?.(error.message || 'Erreur de flux');
      return { success: false, error: error.message };
    }
  },

  /**
   * Get suggested questions based on project status
   */
  async getSuggestions(projectId: string) {
    try {
      const response = await fetch(`/api/chat/suggestions?projectId=${projectId}`);
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Erreur lors de la récupération des suggestions',
        };
      }

      return {
        success: true,
        data: data.suggestions,
      };
    } catch (error) {
      console.error('Suggestions API Error:', error);
      return {
        success: false,
        error: 'Impossible de récupérer les suggestions',
      };
    }
  },
};

export const paymentApi = {
  async createStripeCheckout(plan: string, successUrl: string, cancelUrl: string) {
    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, provider: 'stripe', successUrl, cancelUrl }),
      });
      const data = await response.json();
      return { success: response.ok, data, error: data.error };
    } catch (error) {
      return { success: false, error: 'Payment error' };
    }
  },
  
  async createFlutterwavePayment(plan: string, redirectUrl: string, phone?: string) {
    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, provider: 'flutterwave', redirectUrl, phone }),
      });
      const data = await response.json();
      return { success: response.ok, data, error: data.error };
    } catch (error) {
      return { success: false, error: 'Payment error' };
    }
  },
  
  async verifyFlutterwavePayment(transactionId: string) {
    try {
      const response = await fetch(`/api/subscriptions?transactionId=${transactionId}`);
      const data = await response.json();
      return { success: response.ok, data, error: data.error };
    } catch (error) {
      return { success: false, error: 'Payment verification error' };
    }
  }
};

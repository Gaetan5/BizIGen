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

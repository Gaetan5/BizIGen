/**
 * BizGen AI - FastAPI Client
 * Service for communicating with the Python FastAPI backend
 */

const FASTAPI_PORT = process.env.NEXT_PUBLIC_FASTAPI_PORT || '3001';

interface ApiResponse<T = unknown> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
  detail?: string;
}

interface RequestOptions extends RequestInit {
  token?: string;
}

/**
 * Get the FastAPI URL with port transformation for gateway
 */
function getFastApiUrl(endpoint: string): string {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${cleanEndpoint}?XTransformPort=${FASTAPI_PORT}`;
}

/**
 * Make an API request to the FastAPI backend
 */
async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { token, ...fetchOptions } = options;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const url = getFastApiUrl(endpoint);
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      credentials: 'include',
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.detail || data.error || 'An error occurred',
      };
    }
    
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('API request error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * Get token from localStorage (client-side only)
 */
function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('bizgen_token');
}

/**
 * Store token in localStorage
 */
function setStoredToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('bizgen_token', token);
}

/**
 * Remove token from localStorage
 */
function removeStoredToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('bizgen_token');
}

// ============================================
// AUTH API
// ============================================

export const authApi = {
  register: async (email: string, password: string, name: string) => {
    const result = await apiRequest<{ access_token: string; user: { id: string; email: string; name: string; role: string } }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      }
    );
    
    if (result.success && result.data?.access_token) {
      setStoredToken(result.data.access_token);
    }
    
    return result;
  },
  
  login: async (email: string, password: string) => {
    const result = await apiRequest<{ access_token: string; user: { id: string; email: string; name: string; role: string } }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
    
    if (result.success && result.data?.access_token) {
      setStoredToken(result.data.access_token);
    }
    
    return result;
  },
  
  me: async () => {
    const token = getStoredToken();
    if (!token) return { success: false, error: 'No token found' };
    
    return apiRequest<{ id: string; email: string; name: string; role: string }>(
      '/auth/me',
      { token }
    );
  },
  
  refresh: async () => {
    const token = getStoredToken();
    if (!token) return { success: false, error: 'No token found' };
    
    const result = await apiRequest<{ access_token: string }>(
      '/auth/refresh',
      {
        method: 'POST',
        token,
      }
    );
    
    if (result.success && result.data?.access_token) {
      setStoredToken(result.data.access_token);
    }
    
    return result;
  },
  
  logout: () => {
    removeStoredToken();
  },
  
  getToken: () => getStoredToken(),
  isAuthenticated: () => !!getStoredToken(),
};

// ============================================
// PROJECTS API
// ============================================

export const projectsApi = {
  list: async () => {
    const token = getStoredToken();
    if (!token) return { success: false, error: 'Not authenticated', data: { projects: [] } };
    
    return apiRequest<{
      projects: Array<{
        id: string;
        userId: string;
        name: string;
        sector: string;
        subSector: string | null;
        country: string;
        status: string;
        createdAt: string;
        updatedAt: string;
      }>;
      totalDocs: number;
      exportsUsed: number;
    }>(
      '/projects',
      { token }
    );
  },
  
  get: async (projectId: string) => {
    const token = getStoredToken();
    if (!token) return { success: false, error: 'Not authenticated' };
    
    return apiRequest<{
      project: {
        id: string;
        name: string;
        sector: string;
        status: string;
        createdAt: string;
      };
      formInputs: Array<{
        questionKey: string;
        answerValue: string;
        stepNumber: number;
      }>;
      generatedDoc: {
        status: string;
        version: number;
        canvases: Array<{
          canvasType: string;
          blocks: Record<string, unknown>;
        }>;
        rawContent: string | null;
      } | null;
    }>(
      `/projects/${projectId}`,
      { token }
    );
  },
  
  create: async (data: { name: string; sector: string; country: string; subSector?: string }) => {
    const token = getStoredToken();
    if (!token) return { success: false, error: 'Not authenticated' };
    
    return apiRequest<{ id: string; name: string }>(
      '/projects',
      {
        method: 'POST',
        body: JSON.stringify(data),
        token,
      }
    );
  },
  
  update: async (projectId: string, data: { name?: string; status?: string }) => {
    const token = getStoredToken();
    if (!token) return { success: false, error: 'Not authenticated' };
    
    return apiRequest<{ id: string; name: string }>(
      `/projects/${projectId}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
        token,
      }
    );
  },
  
  delete: async (projectId: string) => {
    const token = getStoredToken();
    if (!token) return { success: false, error: 'Not authenticated' };
    
    return apiRequest<{ success: boolean }>(
      `/projects/${projectId}`,
      {
        method: 'DELETE',
        token,
      }
    );
  },
  
  saveInputs: async (projectId: string, answers: Record<string, string>) => {
    const token = getStoredToken();
    if (!token) return { success: false, error: 'Not authenticated' };
    
    return apiRequest<{ success: boolean }>(
      `/projects/${projectId}/inputs`,
      {
        method: 'POST',
        body: JSON.stringify({ answers }),
        token,
      }
    );
  },
  
  getInputs: async (projectId: string) => {
    const token = getStoredToken();
    if (!token) return { success: false, error: 'Not authenticated' };
    
    return apiRequest<Array<{
      id: string;
      questionKey: string;
      answerValue: string;
      stepNumber: number;
    }>>(
      `/projects/${projectId}/inputs`,
      { token }
    );
  },
};

// ============================================
// GENERATE API
// ============================================

export const generateApi = {
  generate: async (projectId: string, type: 'bmc' | 'lean' | 'bp' | 'all' = 'all') => {
    const token = getStoredToken();
    if (!token) return { success: false, error: 'Not authenticated' };
    
    return apiRequest<{
      success: boolean;
      documentId: string;
      status: string;
      results?: {
        bmc?: Record<string, unknown>;
        lean?: Record<string, unknown>;
        bp?: Record<string, unknown>;
      };
    }>(
      '/generate',
      {
        method: 'POST',
        body: JSON.stringify({ projectId, type }),
        token,
      }
    );
  },
  
  status: async (projectId: string) => {
    const token = getStoredToken();
    if (!token) return { success: false, error: 'Not authenticated' };
    
    return apiRequest<{
      projectStatus: string;
      documentStatus: string;
      version: number;
      completedAt: string | null;
    }>(
      `/generate/status/${projectId}`,
      { token }
    );
  },
};

// ============================================
// EXPORT API
// ============================================

export const exportApi = {
  export: async (projectId: string, docType: 'bmc' | 'lean' | 'bp', format: 'pdf' | 'docx' | 'png') => {
    const token = getStoredToken();
    if (!token) return { success: false, error: 'Not authenticated' };
    
    return apiRequest<{
      success: boolean;
      exportId: string;
      fileName: string;
      format: string;
      fileUrl: string;
      fileSize: number;
    }>(
      '/export',
      {
        method: 'POST',
        body: JSON.stringify({
          projectId,
          docType,
          format,
        }),
        token,
      }
    );
  },
  
  download: async (exportId: string) => {
    const token = getStoredToken();
    if (!token) return null;
    
    const url = getFastApiUrl(`/export/download/${exportId}`);
    
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) return null;
      
      return await response.blob();
    } catch {
      return null;
    }
  },
  
  history: async () => {
    const token = getStoredToken();
    if (!token) return { success: false, error: 'Not authenticated', data: [] };
    
    return apiRequest<Array<{
      id: string;
      format: string;
      fileSize: number;
      downloadedAt: string | null;
      createdAt: string;
    }>>(
      '/export/history',
      { token }
    );
  },
};

// ============================================
// CHAT API
// ============================================

export const chatApi = {
  send: async (message: string, projectId: string | null = null) => {
    const token = getStoredToken();
    if (!token) return { success: false, error: 'Not authenticated' };
    
    return apiRequest<{
      success: boolean;
      response: string;
      suggestions: string[];
    }>(
      '/chat',
      {
        method: 'POST',
        body: JSON.stringify({
          message,
          projectId,
        }),
        token,
      }
    );
  },
  
  getSuggestions: async (projectId: string) => {
    const token = getStoredToken();
    if (!token) return { success: false, error: 'Not authenticated', data: [] };
    
    return apiRequest<{
      success: boolean;
      suggestions: string[];
    }>(
      `/chat/suggest-questions/${projectId}`,
      { token }
    );
  },
};

// ============================================
// PAYMENT API
// ============================================

export const paymentApi = {
  createStripeCheckout: async (plan: 'BASIC' | 'PRO', successUrl: string, cancelUrl: string) => {
    const token = getStoredToken();
    if (!token) return { success: false, error: 'Not authenticated' };
    
    return apiRequest<{
      session_id: string;
      checkout_url: string;
    }>(
      '/subscriptions/checkout',
      {
        method: 'POST',
        body: JSON.stringify({
          plan,
          provider: 'stripe',
          success_url: successUrl,
          cancel_url: cancelUrl,
        }),
        token,
      }
    );
  },
  
  createFlutterwavePayment: async (plan: 'BASIC' | 'PRO', redirectUrl: string, phone?: string) => {
    const token = getStoredToken();
    if (!token) return { success: false, error: 'Not authenticated' };
    
    return apiRequest<{
      payment_url: string;
      tx_ref: string;
    }>(
      '/subscriptions/flutterwave',
      {
        method: 'POST',
        body: JSON.stringify({
          plan,
          redirect_url: redirectUrl,
          phone,
        }),
        token,
      }
    );
  },
  
  verifyFlutterwavePayment: async (transactionId: string) => {
    const token = getStoredToken();
    if (!token) return { success: false, error: 'Not authenticated' };
    
    return apiRequest<{
      status: string;
      plan: string;
      tx_ref: string;
    }>(
      `/subscriptions/flutterwave/verify/${transactionId}`,
      { token }
    );
  },
  
  getSubscriptionStatus: async () => {
    const token = getStoredToken();
    if (!token) return { success: false, error: 'Not authenticated' };
    
    return apiRequest<{
      plan: string;
      status: string;
      currentPeriodEnd: string | null;
      projectsUsed: number;
      exportsUsed: number;
    }>(
      '/subscriptions/status',
      { token }
    );
  },
  
  cancelSubscription: async () => {
    const token = getStoredToken();
    if (!token) return { success: false, error: 'Not authenticated' };
    
    return apiRequest<{ success: boolean }>(
      '/subscriptions/cancel',
      {
        method: 'POST',
        token,
      }
    );
  },
};

// Export all APIs
const api = {
  auth: authApi,
  projects: projectsApi,
  generate: generateApi,
  export: exportApi,
  chat: chatApi,
  payment: paymentApi,
};

export default api;

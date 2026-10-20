import crypto from 'crypto';

export type BizGenEventType =
  | 'PROJECT_CREATED'
  | 'GENERATION_REQUESTED'
  | 'GENERATION_COMPLETED'
  | 'PROJECT_UPDATED';

export interface BizGenEventPayload {
  eventType: BizGenEventType;
  timestamp: string;
  projectId: string;
  projectName: string;
  sector: string;
  country: string;
  userId: string;
  userEmail?: string;
  userPlan?: string;
  data?: Record<string, unknown>;
}

/**
 * Dispatcher d'événements asynchrone et résilient vers le hub n8n.
 * Conçu selon le principe de 'Fire-and-Forget' avec timeout strict de 3s
 * pour ne jamais impacter la latence ni la disponibilité de l'application.
 */
export async function dispatchN8nEvent(
  eventType: BizGenEventType,
  payload: Omit<BizGenEventPayload, 'eventType' | 'timestamp'>
): Promise<void> {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  if (!webhookUrl) {
    // n8n n'est pas encore configuré ou URL non renseignée : mode silencieux
    return;
  }

  const secret = process.env.N8N_WEBHOOK_SECRET || process.env.INTERNAL_API_KEY || 'bizgen-secret-token';
  const fullPayload: BizGenEventPayload = {
    ...payload,
    eventType,
    timestamp: new Date().toISOString(),
  };

  const bodyStr = JSON.stringify(fullPayload);
  const signature = crypto.createHmac('sha256', secret).update(bodyStr).digest('hex');

  // Exécution asynchrone non-bloquante avec timeout de sécurité
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  try {
    fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-BizGen-Event': eventType,
        'X-BizGen-Signature': signature,
        'User-Agent': 'BizGen-AI-Dispatcher/2.0',
      },
      body: bodyStr,
      signal: controller.signal,
    })
      .then((res) => {
        clearTimeout(timeoutId);
        if (!res.ok) {
          console.warn(`[n8n-dispatcher] Webhook renvoyé statut ${res.status} pour événement ${eventType}`);
        }
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        // Log prudent sans lever d'exception
        console.warn(`[n8n-dispatcher] Non-distribué vers n8n (${eventType}) :`, err.message || err);
      });
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn(`[n8n-dispatcher] Échec initialisation appel webhook:`, error);
  }
}

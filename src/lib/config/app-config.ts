/**
 * Configuration centralisée de l'application BizGen AI.
 * 
 * Toute URL, prix, limite ou constante métier doit être définie ici
 * et importée par les composants/routes au lieu d'être hardcodée.
 * 
 * Les valeurs sensibles (clés API, secrets) restent EXCLUSIVEMENT dans .env
 */

import { PLAN_LIMITS } from '@/types';

// ============================================
// BACKEND / API URLS
// ============================================

/** URL du backend Python (FastAPI) — résolu depuis l'env ou fallback Docker */
export const PYTHON_BACKEND_URL =
  process.env.PYTHON_BACKEND_URL || 'http://localhost:3001';

/** URL publique de l'application (pour les liens de partage, emails, etc.) */
export const APP_PUBLIC_URL =
  process.env.NEXTAUTH_URL || 'http://localhost:3000';

// ============================================
// PRICING & PLANS (Source de vérité unique)
// ============================================

export const PLAN_PRICING = {
  FREE: { price: PLAN_LIMITS.FREE.price, currency: 'EUR', label: 'Gratuit' },
  BASIC: { price: PLAN_LIMITS.BASIC.price, currency: 'EUR', label: `${PLAN_LIMITS.BASIC.price}€/mois` },
  PRO: { price: PLAN_LIMITS.PRO.price, currency: 'EUR', label: `${PLAN_LIMITS.PRO.price}€/mois` },
} as const;

/** Calcule le MRR estimé à partir d'un nombre d'abonnés par plan */
export function estimateMRR(counts: { BASIC: number; PRO: number }): number {
  return (
    counts.BASIC * PLAN_PRICING.BASIC.price +
    counts.PRO * PLAN_PRICING.PRO.price
  );
}

// ============================================
// EXPORT FORMATS
// ============================================

export const SUPPORTED_EXPORT_FORMATS = ['PDF', 'DOCX', 'PNG', 'JSON'] as const;

// ============================================
// SHARE DEFAULTS
// ============================================

export const SHARE_DEFAULTS = {
  defaultExpiryDays: 7,
  maxExpiryDays: 90,
} as const;

// ============================================
// PAGINATION
// ============================================

export const PAGINATION = {
  defaultPageSize: 10,
  adminPageSize: 15,
  maxPageSize: 50,
} as const;

// ============================================
// APP METADATA
// ============================================

export const APP_META = {
  name: 'BizGen AI',
  description: "Générateur de Business Model Canvas & Business Plan propulsé par l'intelligence artificielle",
  version: '1.0.0',
} as const;

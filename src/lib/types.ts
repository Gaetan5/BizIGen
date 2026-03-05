export type User = {
  id: string;
  email: string;
  name: string;
  role: 'entrepreneur' | 'consultant';
  subscription_id?: string;
  created_at: string;
  preferences: {
    lang: 'fr' | 'en';
    secteur: string;
  };
};

export type Project = {
  id: string;
  user_id: string;
  name: string;
  sector: string;
  status: 'draft' | 'generated';
  created_at: string;
  form_data: Record<string, unknown>;
};

export type FormInput = {
  id: string;
  project_id: string;
  question_id: string;
  answer: string;
  conditional_logic: Record<string, unknown>;
  uploaded_files: string[];
};

export type GeneratedDocument = {
  id: string;
  project_id: string;
  type: 'bmc' | 'lc' | 'bp';
  content: Record<string, unknown>;
  ai_metadata: {
    prompt_used: string;
    tokens: number;
  };
  exported_at?: string;
};

export type Subscription = {
  id: string;
  user_id: string;
  plan: 'basic' | 'pro';
  stripe_id?: string;
  flutterwave_ref?: string;
  quota_used: number;
  renewal_date: string;
};

export type SupportTicket = {
  id: string;
  user_id: string;
  issue: string;
  status: 'open' | 'closed';
  chatbot_responses: string[];
};

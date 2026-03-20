"""
BizGen AI - AI Generation Service
Handles all AI-powered document generation
"""
import json
import httpx
from typing import Dict, Any, Optional, List
from app.config import settings


class AIService:
    """Service for AI-powered content generation using OpenAI API"""
    
    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.model = settings.AI_MODEL
        self.base_url = "https://api.openai.com/v1"
    
    async def _call_openai(
        self, 
        system_prompt: str, 
        user_prompt: str,
        temperature: float = 0.7,
        max_tokens: int = 4000
    ) -> str:
        """Make API call to OpenAI"""
        if not self.api_key:
            raise ValueError("OpenAI API key not configured")
        
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": self.model,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    "temperature": temperature,
                    "max_tokens": max_tokens
                }
            )
            
            if response.status_code != 200:
                raise Exception(f"OpenAI API error: {response.text}")
            
            data = response.json()
            return data["choices"][0]["message"]["content"]
    
    def _parse_json_response(self, content: str) -> Dict[str, Any]:
        """Extract and parse JSON from AI response"""
        # Try to find JSON in the response
        json_start = content.find("{")
        json_end = content.rfind("}") + 1
        
        if json_start == -1:
            raise ValueError("No JSON found in response")
        
        json_str = content[json_start:json_end]
        return json.loads(json_str)
    
    async def generate_bmc(
        self, 
        form_data: Dict[str, str], 
        sector: str, 
        country: str
    ) -> Dict[str, Any]:
        """Generate Business Model Canvas"""
        
        system_prompt = """Tu es un consultant business senior spécialisé dans la création de Business Model Canvas pour des entreprises en Afrique francophone. Tu as 15 ans d'expérience en stratégie d'entreprise.

Ton rôle : Générer un Business Model Canvas complet, cohérent et actionnable basé sur les informations fournies par l'entrepreneur.

RÈGLES STRICTES:
1. Chaque bloc doit contenir 3-5 éléments concrets et spécifiques
2. Les éléments doivent être cohérents entre eux
3. Utilise le contexte local (méthodes paiement, réglementations, acteurs locaux)
4. Évite les généralités - sois spécifique au projet et au marché
5. Les montants doivent être réalistes pour la taille et le secteur

Tu DOIS répondre UNIQUEMENT avec un JSON valide, sans texte avant ou après."""
        
        user_prompt = f"""
INFORMATIONS PROJET:
- Nom: {form_data.get('company_name', 'Projet')}
- Secteur: {sector}
- Pays: {country}
- Description: {form_data.get('description', 'Non spécifié')}
- Problème résolu: {form_data.get('problem_solved', 'Non spécifié')}
- Solution proposée: {form_data.get('solution', 'Non spécifié')}
- Cible: {form_data.get('target_market', 'Non spécifié')}
- Modèle revenus: {form_data.get('revenue_model', 'Non spécifié')}
- Concurrents: {form_data.get('competitors', 'Non spécifié')}
- Taille équipe: {form_data.get('team_size', 'Non spécifié')}
- Budget mensuel: {form_data.get('monthly_costs', 'Non spécifié')}
- Financement recherché: {form_data.get('required_funding', 'Non spécifié')}

GÉNÈRE UN BUSINESS MODEL CANVAS COMPLET AU FORMAT JSON SUIVANT:
{{
  "key_partners": ["partenaire 1", "partenaire 2", "partenaire 3"],
  "key_activities": ["activité 1", "activité 2", "activité 3"],
  "key_resources": ["ressource 1", "ressource 2", "ressource 3"],
  "value_propositions": ["proposition 1", "proposition 2", "proposition 3"],
  "customer_relationships": ["relation 1", "relation 2", "relation 3"],
  "channels": ["canal 1", "canal 2", "canal 3"],
  "customer_segments": ["segment 1", "segment 2", "segment 3"],
  "cost_structure": {{
    "fixed_costs": [{{"item": "...", "amount": "...", "currency": "XAF"}}],
    "variable_costs": [{{"item": "...", "percentage": "..."}}],
    "total_monthly_estimate": "Montant en XAF"
  }},
  "revenue_streams": [{{"source": "...", "model": "...", "pricing": "..."}}]
}}
"""
        
        content = await self._call_openai(system_prompt, user_prompt)
        return self._parse_json_response(content)
    
    async def generate_lean_canvas(
        self, 
        form_data: Dict[str, str], 
        sector: str
    ) -> Dict[str, Any]:
        """Generate Lean Canvas"""
        
        system_prompt = """Tu es un expert Lean Startup spécialisé dans les marchés émergents africains.
Tu génères des Lean Canvas pour startups innovantes avec focus sur:
- Validation rapide d'hypothèses
- Identification early adopters
- Métriques actionnables
- Avantage déloyal durable

RÈGLES:
1. Problem → 3 problèmes top maximum
2. Existing Alternatives → Solutions actuelles des clients
3. Solution → Fonctionnalités minimales pour MVP
4. Key Metrics → 3 métriques max, mesurables
5. Unique Value Proposition → 1 phrase claire
6. Unfair Advantage → Ce qui ne peut pas être copié facilement

Tu DOIS répondre UNIQUEMENT avec un JSON valide."""
        
        user_prompt = f"""
INFORMATIONS PROJET:
- Nom: {form_data.get('company_name', 'Projet')}
- Secteur: {sector}
- Description: {form_data.get('description', 'Non spécifié')}
- Problème résolu: {form_data.get('problem_solved', 'Non spécifié')}
- Solution proposée: {form_data.get('solution', 'Non spécifié')}
- Unicité: {form_data.get('unique_value', 'Non spécifié')}
- Cible: {form_data.get('target_market', 'Non spécifié')}
- Modèle revenus: {form_data.get('revenue_model', 'Non spécifié')}
- Coûts mensuels: {form_data.get('monthly_costs', 'Non spécifié')}

GÉNÈRE UN LEAN CANVAS COMPLET AU FORMAT JSON SUIVANT:
{{
  "problem": ["problème 1", "problème 2", "problème 3"],
  "existing_alternatives": ["alternative 1", "alternative 2"],
  "solution": ["fonctionnalité 1", "fonctionnalité 2", "fonctionnalité 3"],
  "key_metrics": ["métrique 1", "métrique 2", "métrique 3"],
  "unique_value_proposition": "Une phrase claire et percutante",
  "high_level_concept": "Analogie ou métaphore",
  "unfair_advantage": ["avantage 1", "avantage 2"],
  "channels": ["canal 1", "canal 2"],
  "customer_segments": {{
    "target": "Description du segment principal",
    "early_adopters": "Qui sont les premiers clients"
  }},
  "cost_structure": {{
    "fixed": "Montant et description",
    "variable": "Description des coûts variables"
  }},
  "revenue_streams": {{
    "model": "Modèle de revenus",
    "pricing": "Prix et fréquence",
    "break_even": "Hypothèse break-even"
  }}
}}
"""
        
        content = await self._call_openai(system_prompt, user_prompt)
        return self._parse_json_response(content)
    
    async def generate_business_plan(
        self, 
        form_data: Dict[str, str], 
        sector: str, 
        country: str
    ) -> Dict[str, Any]:
        """Generate complete Business Plan"""
        
        system_prompt = """Tu es un consultant senior spécialisé dans la rédaction de Business Plans pour entreprises africaines. Tu as 20 ans d'expérience en financement et stratégie d'entreprise.

Ton rôle: Générer un Business Plan professionnel et complet adapté aux réalités du marché africain.

RÈGLES STRICTES:
1. Le plan doit être réaliste et adapté au contexte local (Mobile Money, réglementations, infrastructures)
2. Les montants doivent être cohérents avec la zone géographique
3. Identifier les risques spécifiques au marché africain
4. Proposer des stratégies adaptées aux canaux de distribution locaux
5. Inclure des métriques pertinentes pour le secteur

Tu DOIS répondre UNIQUEMENT avec un JSON valide, sans texte avant ou après."""
        
        user_prompt = f"""
INFORMATIONS PROJET:
- Nom: {form_data.get('company_name', 'Projet')}
- Secteur: {sector}
- Pays: {country}
- Description: {form_data.get('description', 'Non spécifié')}
- Problème résolu: {form_data.get('problem_solved', 'Non spécifié')}
- Solution proposée: {form_data.get('solution', 'Non spécifié')}
- Unicité: {form_data.get('unique_value', 'Non spécifié')}
- Cible: {form_data.get('target_market', 'Non spécifié')}
- Taille marché: {form_data.get('market_size', 'Non spécifié')}
- Modèle revenus: {form_data.get('revenue_model', 'Non spécifié')}
- Prix: {form_data.get('pricing', 'Non spécifié')}
- Canaux: {form_data.get('sales_channels', 'Non spécifié')}
- Concurrents: {form_data.get('competitors', 'Non spécifié')}
- Ressources: {form_data.get('key_resources', 'Non spécifié')}
- Activités: {form_data.get('key_activities', 'Non spécifié')}
- Partenaires: {form_data.get('key_partners', 'Non spécifié')}
- Coûts mensuels: {form_data.get('monthly_costs', 'Non spécifié')}
- Revenus projetés: {form_data.get('projected_revenue_m6', 'Non spécifié')}
- Financement recherché: {form_data.get('required_funding', 'Non spécifié')}
- Taille équipe: {form_data.get('team_size', 'Non spécifié')}

GÉNÈRE UN BUSINESS PLAN COMPLET AU FORMAT JSON:
{{
  "executiveSummary": "Résumé exécutif de 150-200 mots",
  "companyOverview": {{
    "mission": "Mission de l'entreprise",
    "vision": "Vision à 5 ans",
    "values": ["valeur 1", "valeur 2", "valeur 3"],
    "legalStructure": "Structure juridique recommandée",
    "location": "Localisation recommandée"
  }},
  "marketAnalysis": {{
    "industryOverview": "Aperçu du secteur dans le pays",
    "targetMarket": "Description détaillée du marché cible",
    "marketSize": "Taille du marché en devise locale",
    "trends": ["tendance 1", "tendance 2", "tendance 3"]
  }},
  "competitiveAnalysis": {{
    "directCompetitors": ["concurrent 1", "concurrent 2"],
    "indirectCompetitors": ["concurrent indirect 1", "concurrent indirect 2"],
    "competitiveAdvantage": "Avantage concurrentiel principal"
  }},
  "swot": {{
    "strengths": ["force 1", "force 2", "force 3"],
    "weaknesses": ["faiblesse 1", "faiblesse 2"],
    "opportunities": ["opportunité 1", "opportunité 2", "opportunité 3"],
    "threats": ["menace 1", "menace 2"]
  }},
  "marketingStrategy": {{
    "positioning": "Positionnement sur le marché",
    "channels": ["canal 1", "canal 2", "canal 3"],
    "pricingStrategy": "Stratégie de prix",
    "salesApproach": "Approche commerciale"
  }},
  "operationsPlan": {{
    "keyActivities": ["activité 1", "activité 2", "activité 3"],
    "keyResources": ["ressource 1", "ressource 2", "ressource 3"],
    "keyPartners": ["partenaire 1", "partenaire 2"],
    "milestones": ["Jalon 1: ...", "Jalon 2: ...", "Jalon 3: ..."]
  }},
  "financialProjections": {{
    "year1Revenue": "Revenu année 1 en devise locale",
    "year2Revenue": "Revenu année 2",
    "year3Revenue": "Revenu année 3",
    "breakEvenMonth": 12,
    "fundingRequired": "Montant nécessaire",
    "useOfFunds": ["Usage 1: %", "Usage 2: %", "Usage 3: %"]
  }},
  "team": {{
    "founders": ["Profil fondateur 1", "Profil fondateur 2"],
    "keyHires": ["Recrutement clé 1", "Recrutement clé 2"],
    "advisors": ["Conseiller 1", "Conseiller 2"]
  }},
  "riskAnalysis": {{
    "risks": ["Risque 1", "Risque 2", "Risque 3"],
    "mitigations": ["Mitigation 1", "Mitigation 2", "Mitigation 3"]
  }}
}}
"""
        
        content = await self._call_openai(system_prompt, user_prompt, max_tokens=6000)
        return self._parse_json_response(content)
    
    async def chat(
        self, 
        message: str, 
        context: Optional[str] = None,
        project_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """AI Chat for project assistance"""
        
        system_prompt = """Tu es BizGen AI, un assistant expert en création d'entreprises et stratégie business en Afrique francophone.

Tu aides les entrepreneurs à:
- Structurer leur projet business
- Comprendre les concepts du Business Model Canvas et Lean Canvas
- Identifier les risques et opportunités de leur marché
- Préparer leur business plan
- Répondre aux questions sur l'entrepreneuriat en Afrique

Sois concis, pratique et encourageant. Réponds en français.
Propose TOUJOURS 3 suggestions de questions suivantes à la fin de ta réponse."""
        
        user_prompt = message
        if context:
            user_prompt = f"Contexte: {context}\n\nQuestion: {message}"
        if project_data:
            user_prompt = f"Données projet: {json.dumps(project_data, ensure_ascii=False)[:1000]}\n\n{user_prompt}"
        
        content = await self._call_openai(system_prompt, user_prompt)
        
        # Extract suggestions from response (look for numbered list at end)
        suggestions = []
        lines = content.split("\n")
        for line in lines[-5:]:
            if line.strip().startswith(("1.", "2.", "3.", "-")):
                suggestions.append(line.strip().lstrip("123.- ").strip())
        
        return {
            "response": content,
            "suggestions": suggestions[:3]
        }


# Singleton instance
ai_service = AIService()

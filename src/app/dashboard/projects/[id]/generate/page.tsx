'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase';
import { Project, GeneratedDocument } from '@/lib/types';

const generateDocument = async (type: 'bmc' | 'lc' | 'bp', formData: Record<string, unknown>) => {
  let prompt = '';
  if (type === 'bmc') {
    prompt = `Génère un Business Model Canvas en JSON basé sur ces données: ${JSON.stringify(formData)}.
    Structure: {
      "segments_clients": "description",
      "proposition_valeur": "description",
      "canaux": "description",
      "relations_clients": "description",
      "flux_revenus": "description",
      "ressources_cles": "description",
      "activites_cles": "description",
      "partenaires_cles": "description",
      "structure_couts": "description"
    }
    Assure cohérence et complétude.`;
  } else if (type === 'lc') {
    prompt = `Génère un Lean Canvas en JSON pour startup basé sur ces données: ${JSON.stringify(formData)}.
    Structure: {
      "probleme": "description",
      "solution": "description",
      "canaux": "description",
      "proposition_valeur": "description",
      "avantage_concurrentiel": "description",
      "segments_clients": "description",
      "cout_client": "description",
      "revenus": "description",
      "mesures_cles": "description"
    }
    Assure cohérence et complétude.`;
  } else if (type === 'bp') {
    prompt = `Génère un Business Plan complet en JSON avec sections détaillées basé sur ces données: ${JSON.stringify(formData)}.
    Structure: {
      "executive_summary": "Résumé exécutif complet",
      "description_entreprise": "Description de l'entreprise",
      "analyse_marche": "Analyse de marché détaillée",
      "analyse_concurrentielle": "Analyse concurrentielle",
      "strategie_marketing": "Stratégie marketing et vente",
      "plan_operationnel": "Plan opérationnel",
      "equipe_management": "Équipe et management",
      "finances": {
        "previsions_revenus": "Prévisions de revenus",
        "analyse_couts": "Analyse des coûts",
        "besoin_fonds": "Besoin en fonds",
        "plan_financement": "Plan de financement"
      },
      "swot": "Analyse SWOT",
      "risques": "Analyse des risques"
    }
    Assure cohérence, complétude et format professionnel.`;
  }

  const response = await fetch(`/api/generate/${type}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) throw new Error(`Failed to generate ${type.toUpperCase()}`);

  return response.json();
};

export default function GeneratePage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<'bmc' | 'lc' | 'bp'>('bmc');
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', params.id)
        .single();

      if (projectError || !projectData) {
        router.push('/dashboard');
        return;
      }

      setProject(projectData);

      const { data: docsData } = await supabase
        .from('generated_documents')
        .select('*')
        .eq('project_id', params.id);

      setDocuments(docsData || []);
    };

    fetchData();
  }, [params.id, router, supabase]);

  const handleExport = async (type: string, content: Record<string, unknown>) => {
    try {
      const response = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, type }),
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-export.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting:', error);
      alert('Erreur lors de l\'export');
    }
  };

  if (!project) return <div>Loading...</div>;

  const bmcDoc = documents.find(d => d.type === 'bmc');
  const lcDoc = documents.find(d => d.type === 'lc');
  const bpDoc = documents.find(d => d.type === 'bp');

  return (
    <div className="max-w-6xl mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>Génération IA - {project.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Type de document</label>
            <select
              id="document-type"
              aria-label="Type de document"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as 'bmc' | 'lc' | 'bp')}
              className="w-full p-2 border rounded-md"
            >
              <option value="bmc">Business Model Canvas</option>
              <option value="lc">Lean Canvas</option>
              <option value="bp">Business Plan Complet</option>
            </select>
          </div>

          <Button onClick={handleGenerate} disabled={loading} size="lg">
            {loading ? 'Génération en cours...' : `Générer ${selectedType.toUpperCase()}`}
          </Button>

          {(bmcDoc || lcDoc || bpDoc) && (
            <div className="space-y-4">
              {bmcDoc && (
                <Card>
                  <CardHeader>
                    <CardTitle>Business Model Canvas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      {Object.entries(bmcDoc.content).map(([key, value]) => (
                        <div key={key} className="border p-3 rounded">
                          <h4 className="font-semibold capitalize">{key.replace('_', ' ')}</h4>
                          <p className="text-sm mt-1">{String(value)}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {lcDoc && (
                <Card>
                  <CardHeader>
                    <CardTitle>Lean Canvas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      {Object.entries(lcDoc.content).map(([key, value]) => (
                        <div key={key} className="border p-3 rounded">
                          <h4 className="font-semibold capitalize">{key.replace('_', ' ')}</h4>
                          <p className="text-sm mt-1">{String(value)}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {bpDoc && bpDoc.content && typeof bpDoc.content === 'object' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Business Plan Complet</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(bpDoc.content).map(([key, value]) => (
                        <div key={key}>
                          <h4 className="font-semibold capitalize text-lg">{key.replace('_', ' ')}</h4>
                          {typeof value === 'object' && value !== null ? (
                            <div className="ml-4 space-y-2">
                              {Object.entries(value).map(([subKey, subValue]) => (
                                <div key={subKey}>
                                  <h5 className="font-medium capitalize">{subKey.replace('_', ' ')}</h5>
                                  <p className="text-sm text-muted-foreground">{String(subValue)}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm">{String(value)}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-4">
                <Button onClick={() => router.push(`/dashboard/projects/${project.id}/edit`)}>
                  Éditer
                </Button>
                {bmcDoc && (
                  <Button
                    variant="outline"
                    onClick={() => handleExport('bmc', bmcDoc.content)}
                  >
                    Exporter BMC PDF
                  </Button>
                )}
                {lcDoc && (
                  <Button
                    variant="outline"
                    onClick={() => handleExport('lc', lcDoc.content)}
                  >
                    Exporter LC PDF
                  </Button>
                )}
                {bpDoc && (
                  <Button
                    variant="outline"
                    onClick={() => handleExport('bp', bpDoc.content)}
                  >
                    Exporter BP PDF
                  </Button>
                )}
                <Button variant="outline" onClick={() => router.push('/dashboard')}>
                  Retour au dashboard
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

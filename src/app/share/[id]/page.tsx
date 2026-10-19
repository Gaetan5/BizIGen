'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BusinessModelCanvas } from '@/components/canvas/business-model-canvas';
import { LeanCanvas } from '@/components/canvas/lean-canvas';
import { BusinessPlanViewer } from '@/components/canvas/business-plan-viewer';
import { 
  Sparkles, 
  Lock, 
  Download, 
  Calendar, 
  Globe, 
  Tag, 
  AlertCircle, 
  Loader2,
  FileCheck,
  ShieldCheck
} from 'lucide-react';

interface SharedData {
  document: {
    projectName: string;
    sector: string;
    country: string;
    canvases: Array<{
      type: 'BMC' | 'LEAN';
      blocks: any;
    }>;
    businessPlan?: any;
  };
  shareSettings: {
    allowDownload: boolean;
    expiresAt: string | null;
  };
}

export default function SharedDocumentPage() {
  const params = useParams();
  const shareId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProtected, setIsProtected] = useState(false);
  const [password, setPassword] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [data, setData] = useState<SharedData | null>(null);

  useEffect(() => {
    if (!shareId) return;

    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch(`/api/share?shareId=${shareId}`);
        const json = await res.json();

        if (cancelled) return;

        if (!res.ok) {
          if (res.status === 410) {
            setError('Ce lien de partage a expiré.');
          } else if (res.status === 404) {
            setError('Document introuvable ou le lien est invalide.');
          } else {
            setError(json.error || 'Erreur lors du chargement du document');
          }
          setLoading(false);
          return;
        }

        if (json.requiresPassword) {
          setIsProtected(true);
          setLoading(false);
          return;
        }

        setData(json);
        setIsProtected(false);
      } catch {
        if (!cancelled) setError('Impossible de se connecter au serveur.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => { cancelled = true; };
  }, [shareId]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    try {
      setVerifying(true);
      setError(null);
      const res = await fetch('/api/share', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shareId, password }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Mot de passe incorrect');
        setVerifying(false);
        return;
      }

      setData(json);
      setIsProtected(false);
    } catch {
      setError('Erreur de validation du mot de passe');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/20">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium">Chargement du document sécurisé...</p>
      </div>
    );
  }

  if (isProtected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
        <Card className="w-full max-w-md shadow-xl border-primary/20">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
              <Lock className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl font-bold">Document Protégé</CardTitle>
            <CardDescription>
              Ce document est sécurisé par son créateur. Veuillez saisir le mot de passe pour y accéder.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Mot de passe d'accès"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <Button type="submit" className="w-full gap-2" disabled={verifying}>
                {verifying && <Loader2 className="w-4 h-4 animate-spin" />}
                Déverrouiller le document
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
        <Card className="w-full max-w-md text-center p-6 space-y-4 shadow-lg">
          <div className="mx-auto w-12 h-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <CardTitle className="text-xl">Accès Impossible</CardTitle>
          <p className="text-muted-foreground text-sm">{error || 'Document introuvable'}</p>
        </Card>
      </div>
    );
  }

  const { document: doc, shareSettings } = data;
  const bmcCanvas = doc.canvases?.find((c) => c.type === 'BMC');
  const leanCanvas = doc.canvases?.find((c) => c.type === 'LEAN');
  const hasBP = Boolean(doc.businessPlan);

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col">
      {/* Top Banner Navigation */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b px-4 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base leading-none">BizGen AI</span>
              <Badge variant="outline" className="text-xs text-muted-foreground py-0">
                Vue Publique
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Document partagé en lecture seule</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {shareSettings.allowDownload && (
            <Button 
              size="sm" 
              variant="outline" 
              className="gap-2"
              onClick={() => window.print()}
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimer / PDF</span>
            </Button>
          )}
          <Badge variant="secondary" className="gap-1 hidden sm:flex">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            Certifié BizGen
          </Badge>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Project Header Info */}
        <div className="bg-card rounded-xl border p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">{doc.projectName}</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Modèle d'affaires et plan stratégique généré par BizGen AI.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {doc.sector && (
                <Badge variant="outline" className="gap-1 py-1 px-3">
                  <Tag className="w-3.5 h-3.5" />
                  {doc.sector}
                </Badge>
              )}
              {doc.country && (
                <Badge variant="outline" className="gap-1 py-1 px-3">
                  <Globe className="w-3.5 h-3.5" />
                  {doc.country}
                </Badge>
              )}
              {shareSettings.expiresAt && (
                <Badge variant="secondary" className="gap-1 py-1 px-3 text-xs">
                  <Calendar className="w-3.5 h-3.5" />
                  Expire le {new Date(shareSettings.expiresAt).toLocaleDateString()}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue={bmcCanvas ? 'bmc' : leanCanvas ? 'lean' : 'bp'} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            {bmcCanvas && <TabsTrigger value="bmc">BMC</TabsTrigger>}
            {leanCanvas && <TabsTrigger value="lean">Lean Canvas</TabsTrigger>}
            {hasBP && <TabsTrigger value="bp">Business Plan</TabsTrigger>}
          </TabsList>

          {bmcCanvas && (
            <TabsContent value="bmc" className="space-y-4">
              <BusinessModelCanvas blocks={bmcCanvas.blocks} editable={false} />
            </TabsContent>
          )}

          {leanCanvas && (
            <TabsContent value="lean" className="space-y-4">
              <LeanCanvas blocks={leanCanvas.blocks} editable={false} />
            </TabsContent>
          )}

          {hasBP && (
            <TabsContent value="bp" className="space-y-4">
              <BusinessPlanViewer data={doc.businessPlan} projectName={doc.projectName} />
            </TabsContent>
          )}
        </Tabs>
      </main>

      <footer className="border-t py-6 text-center text-xs text-muted-foreground bg-background">
        Propulsé par <span className="font-semibold text-foreground">BizGen AI</span> — L'intelligence artificielle au service des entrepreneurs.
      </footer>
    </div>
  );
}

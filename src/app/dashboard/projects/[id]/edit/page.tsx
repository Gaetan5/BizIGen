'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/lib/supabase';
import { Project, GeneratedDocument } from '@/lib/types';

export default function EditPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
  const [editedContent, setEditedContent] = useState<Record<string, string>>({});
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: projectData } = await supabase
        .from('projects')
        .select('*')
        .eq('id', params.id)
        .single();

      if (!projectData) {
        router.push('/dashboard');
        return;
      }

      setProject(projectData);

      const { data: docsData } = await supabase
        .from('generated_documents')
        .select('*')
        .eq('project_id', params.id);

      setDocuments(docsData || []);

      // Initialize edited content
      const initialContent: Record<string, string> = {};
      docsData?.forEach(doc => {
        Object.entries(doc.content).forEach(([key, value]) => {
          initialContent[`${doc.type}_${key}`] = String(value);
        });
      });
      setEditedContent(initialContent);
    };

    fetchData();
  }, [params.id, router, supabase]);

  const handleSave = async () => {
    // Update documents with edited content
    for (const doc of documents) {
      const updatedContent: Record<string, unknown> = {};
      Object.keys(doc.content).forEach(key => {
        updatedContent[key] = editedContent[`${doc.type}_${key}`] || doc.content[key];
      });

      await supabase
        .from('generated_documents')
        .update({ content: updatedContent })
        .eq('id', doc.id);
    }

    alert('Modifications sauvegardées');
    router.push(`/dashboard/projects/${project?.id}/generate`);
  };

  if (!project) return <div>Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>Édition - {project.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {documents.map(doc => (
            <div key={doc.id}>
              <h3 className="text-xl font-semibold mb-4 capitalize">{doc.type}</h3>
              <div className="space-y-4">
                {Object.keys(doc.content).map(key => (
                  <div key={key}>
                    <label className="block text-sm font-medium mb-2 capitalize">
                      {key.replace('_', ' ')}
                    </label>
                    <Textarea
                      value={editedContent[`${doc.type}_${key}`] || ''}
                      onChange={(e) => setEditedContent(prev => ({
                        ...prev,
                        [`${doc.type}_${key}`]: e.target.value
                      }))}
                      rows={3}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex gap-4">
            <Button onClick={handleSave}>Sauvegarder</Button>
            <Button variant="outline" onClick={() => router.back()}>
              Annuler
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

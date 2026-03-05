'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase';
import { Project } from '@/lib/types';

const sectors = [
  { value: 'tech', label: 'Technologie' },
  { value: 'agro', label: 'Agro-alimentaire' },
  { value: 'commerce', label: 'Commerce' },
  { value: 'services', label: 'Services' },
];

export default function NewProject() {
  const [name, setName] = useState('');
  const [sector, setSector] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sector) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name,
          sector,
          status: 'draft',
          form_data: {},
        })
        .select()
        .single();

      if (error) throw error;

      router.push(`/dashboard/projects/${data.id}/form`);
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Erreur lors de la création du projet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>Nouveau Projet</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Nom du projet</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Mon super projet"
                required
              />
            </div>

            <div>
              <Label htmlFor="sector">Secteur d'activité</Label>
              <select
                id="sector"
                aria-label="Secteur d'activité"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="">Sélectionnez un secteur</option>
                {sectors.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Création...' : 'Commencer le formulaire'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

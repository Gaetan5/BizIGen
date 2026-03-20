'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  Sparkles, 
  ArrowRight
} from 'lucide-react';
import type { ProjectTemplate } from '@/lib/templates';

interface TemplateSelectorProps {
  templates: ProjectTemplate[];
  onSelect: (template: ProjectTemplate) => void;
  selectedId: string | null;
}

export function TemplateSelector({ templates, onSelect, selectedId }: TemplateSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Choisissez un template</h2>
        <p className="text-muted-foreground">
          Partez d'un template pré-rempli pour accélérer la création de votre projet
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card 
            key={template.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedId === template.id 
                ? 'border-primary ring-2 ring-primary/20' 
                : 'hover:border-primary/50'
            }`}
            onClick={() => onSelect(template)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{template.icon}</span>
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {template.description}
                    </CardDescription>
                  </div>
                </div>
                {selectedId === template.id && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="pb-3">
              <p className="text-sm text-muted-foreground mb-3">
                {template.preview}
              </p>
              
              <div className="flex flex-wrap gap-1">
                {template.highlights.map((highlight, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {highlight}
                  </Badge>
                ))}
              </div>
            </CardContent>

            <CardFooter className="pt-0">
              <Button 
                variant={selectedId === template.id ? 'default' : 'outline'}
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(template);
                }}
              >
                {selectedId === template.id ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Sélectionné
                  </>
                ) : (
                  <>
                    Utiliser ce template
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Custom option */}
      <Card 
        className={`cursor-pointer transition-all hover:shadow-md border-dashed ${
          selectedId === 'custom' 
            ? 'border-primary ring-2 ring-primary/20' 
            : 'hover:border-primary/50'
        }`}
        onClick={() => onSelect({
          id: 'custom',
          name: 'Projet personnalisé',
          sector: 'AUTRE',
          description: 'Créez votre projet de zéro sans template',
          icon: '✨',
          preview: 'Définissez vous-même tous les aspects de votre projet',
          defaultAnswers: {},
          highlights: ['Flexibilité totale', 'Adapté à votre vision'],
        })}
      >
        <CardContent className="py-6 text-center">
          <Sparkles className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-semibold mb-1">Projet personnalisé</h3>
          <p className="text-sm text-muted-foreground">
            Créez votre projet de zéro sans utiliser de template
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

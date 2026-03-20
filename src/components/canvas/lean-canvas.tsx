'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  X, 
  Pencil, 
  Check,
  AlertTriangle,
  Lightbulb,
  Target,
  Shield,
  Users,
  TrendingUp,
  Coins,
  DollarSign,
  BarChart3
} from 'lucide-react';
import type { LeanCanvasBlocks } from '@/types';

interface LeanCanvasProps {
  blocks: LeanCanvasBlocks;
  editable?: boolean;
  onUpdate?: (blocks: LeanCanvasBlocks) => void;
}

const blockConfig: Record<string, { 
  label: string; 
  color: string; 
  icon: React.ElementType;
}> = {
  problem: { label: 'Problème', color: 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800', icon: AlertTriangle },
  solution: { label: 'Solution', color: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800', icon: Lightbulb },
  unique_value_proposition: { label: 'Proposition de Valeur Unique', color: 'bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800', icon: Target },
  unfair_advantage: { label: 'Avantage Déloyal', color: 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800', icon: Shield },
  customer_segments: { label: 'Segments Clients', color: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800', icon: Users },
  existing_alternatives: { label: 'Alternatives Existantes', color: 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700', icon: BarChart3 },
  key_metrics: { label: 'Métriques Clés', color: 'bg-cyan-50 dark:bg-cyan-950 border-cyan-200 dark:border-cyan-800', icon: TrendingUp },
  channels: { label: 'Canaux', color: 'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800', icon: TrendingUp },
  cost_structure: { label: 'Structure des Coûts', color: 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700', icon: Coins },
  revenue_streams: { label: 'Sources de Revenus', color: 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800', icon: DollarSign },
};

export function LeanCanvas({ blocks, editable = false, onUpdate }: LeanCanvasProps) {
  const [editingBlock, setEditingBlock] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleEdit = (blockKey: string, index: number, value: string) => {
    setEditingBlock(blockKey);
    setEditingIndex(index);
    setEditValue(value);
  };

  const handleSave = (blockKey: string, index: number) => {
    if (!onUpdate) return;
    
    const newBlocks = { ...blocks };
    if (Array.isArray(newBlocks[blockKey as keyof LeanCanvasBlocks])) {
      (newBlocks[blockKey as keyof LeanCanvasBlocks] as string[])[index] = editValue;
    }
    onUpdate(newBlocks);
    setEditingBlock(null);
    setEditingIndex(null);
  };

  const handleAdd = (blockKey: string) => {
    if (!onUpdate) return;
    
    const newBlocks = { ...blocks };
    if (Array.isArray(newBlocks[blockKey as keyof LeanCanvasBlocks])) {
      (newBlocks[blockKey as keyof LeanCanvasBlocks] as string[]).push('Nouvel élément...');
    }
    onUpdate(newBlocks);
  };

  const handleRemove = (blockKey: string, index: number) => {
    if (!onUpdate) return;
    
    const newBlocks = { ...blocks };
    if (Array.isArray(newBlocks[blockKey as keyof LeanCanvasBlocks])) {
      (newBlocks[blockKey as keyof LeanCanvasBlocks] as string[]).splice(index, 1);
    }
    onUpdate(newBlocks);
  };

  const renderListBlock = (blockKey: string, items: string[]) => {
    const config = blockConfig[blockKey];
    const Icon = config.icon;

    return (
      <Card className={`${config.color} border h-full`}>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Icon className="w-4 h-4" />
            {config.label}
          </CardTitle>
        </CardHeader>
        <CardContent className="py-2 px-4 space-y-2">
          {items.map((item, index) => (
            <div key={index} className="group flex items-start gap-1">
              {editable && (
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleEdit(blockKey, index, item)}
                    className="p-1 hover:bg-background rounded"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleRemove(blockKey, index)}
                    className="p-1 hover:bg-destructive/10 rounded text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              
              {editingBlock === blockKey && editingIndex === index ? (
                <div className="flex-1 flex gap-1">
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="h-7 text-sm"
                  />
                  <Button
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => handleSave(blockKey, index)}
                  >
                    <Check className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex-1 text-sm bg-background/50 rounded px-2 py-1">
                  {item}
                </div>
              )}
            </div>
          ))}
          
          {editable && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-7 text-xs opacity-50 hover:opacity-100"
              onClick={() => handleAdd(blockKey)}
            >
              <Plus className="w-3 h-3 mr-1" />
              Ajouter
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderUVPBlock = () => {
    const config = blockConfig.unique_value_proposition;
    const Icon = config.icon;

    return (
      <Card className={`${config.color} border h-full`}>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Icon className="w-4 h-4" />
            {config.label}
          </CardTitle>
        </CardHeader>
        <CardContent className="py-2 px-4">
          <div className="text-lg font-bold text-center py-4 bg-background/50 rounded">
            "{blocks.unique_value_proposition}"
          </div>
          {blocks.high_level_concept && (
            <div className="mt-2 text-sm text-center text-muted-foreground">
              <span className="font-medium">Concept:</span> {blocks.high_level_concept}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderCustomerSegmentsBlock = () => {
    const config = blockConfig.customer_segments;
    const Icon = config.icon;

    return (
      <Card className={`${config.color} border h-full`}>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Icon className="w-4 h-4" />
            {config.label}
          </CardTitle>
        </CardHeader>
        <CardContent className="py-2 px-4 space-y-3">
          <div>
            <h4 className="text-xs font-medium mb-1 text-muted-foreground">Cible principale</h4>
            <div className="text-sm bg-background/50 rounded px-2 py-1.5">
              {blocks.customer_segments?.target}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-medium mb-1 text-muted-foreground">Early Adopters</h4>
            <div className="text-sm bg-background/50 rounded px-2 py-1.5">
              {blocks.customer_segments?.early_adopters}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderCostBlock = () => {
    const config = blockConfig.cost_structure;
    const Icon = config.icon;

    return (
      <Card className={`${config.color} border h-full`}>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Icon className="w-4 h-4" />
            {config.label}
          </CardTitle>
        </CardHeader>
        <CardContent className="py-2 px-4">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <h4 className="text-xs font-medium mb-1 text-muted-foreground">Coûts Fixes</h4>
              <div className="text-sm bg-background/50 rounded px-2 py-1.5">
                {blocks.cost_structure?.fixed}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-medium mb-1 text-muted-foreground">Coûts Variables</h4>
              <div className="text-sm bg-background/50 rounded px-2 py-1.5">
                {blocks.cost_structure?.variable}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderRevenueBlock = () => {
    const config = blockConfig.revenue_streams;
    const Icon = config.icon;

    return (
      <Card className={`${config.color} border h-full`}>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Icon className="w-4 h-4" />
            {config.label}
          </CardTitle>
        </CardHeader>
        <CardContent className="py-2 px-4">
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <h4 className="text-xs font-medium mb-1 text-muted-foreground">Modèle</h4>
              <div className="text-sm bg-background/50 rounded px-2 py-1.5">
                {blocks.revenue_streams?.model}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-medium mb-1 text-muted-foreground">Prix</h4>
              <div className="text-sm bg-background/50 rounded px-2 py-1.5">
                {blocks.revenue_streams?.pricing}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-medium mb-1 text-muted-foreground">Break-even</h4>
              <div className="text-sm bg-background/50 rounded px-2 py-1.5">
                {blocks.revenue_streams?.break_even}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Lean Canvas</h2>
          {editable && (
            <Badge variant="outline">Mode édition activé</Badge>
          )}
        </div>

        {/* Canvas Grid */}
        <div className="grid grid-cols-5 gap-2" style={{ minHeight: '500px' }}>
          {/* Row 1 */}
          {renderListBlock('problem', blocks.problem || [])}
          <div className="row-span-2">
            {renderUVPBlock()}
          </div>
          {renderListBlock('unfair_advantage', blocks.unfair_advantage || [])}
          <div className="row-span-2">
            {renderCustomerSegmentsBlock()}
          </div>

          {/* Existing Alternatives (sub-block under Problem) */}
          <div className="-mt-2 pt-2">
            {renderListBlock('existing_alternatives', blocks.existing_alternatives || [])}
          </div>

          {/* Solution */}
          {renderListBlock('solution', blocks.solution || [])}

          {/* Channels (sub-block) */}
          <div className="-mt-2 pt-2">
            {renderListBlock('channels', blocks.channels || [])}
          </div>

          {/* Key Metrics (sub-block) */}
          <div className="-mt-2 pt-2">
            {renderListBlock('key_metrics', blocks.key_metrics || [])}
          </div>

          {/* Row 3 - Costs and Revenue */}
          <div className="col-span-2 mt-2">
            {renderCostBlock()}
          </div>
          <div className="col-span-3 mt-2">
            {renderRevenueBlock()}
          </div>
        </div>
      </div>
    </div>
  );
}

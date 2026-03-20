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
  GripVertical, 
  Pencil, 
  Check,
  Users,
  Briefcase,
  Box,
  Target,
  Handshake,
  Truck,
  DollarSign,
  Coins
} from 'lucide-react';
import type { BMCBlocks } from '@/types';

interface BusinessModelCanvasProps {
  blocks: BMCBlocks;
  editable?: boolean;
  onUpdate?: (blocks: BMCBlocks) => void;
}

const blockConfig: Record<string, { 
  label: string; 
  color: string; 
  icon: React.ElementType;
}> = {
  key_partners: { label: 'Partenaires Clés', color: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800', icon: Handshake },
  key_activities: { label: 'Activités Clés', color: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800', icon: Briefcase },
  key_resources: { label: 'Ressources Clés', color: 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800', icon: Box },
  value_propositions: { label: 'Propositions de Valeur', color: 'bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800', icon: Target },
  customer_relationships: { label: 'Relations Clients', color: 'bg-pink-50 dark:bg-pink-950 border-pink-200 dark:border-pink-800', icon: Handshake },
  channels: { label: 'Canaux', color: 'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800', icon: Truck },
  customer_segments: { label: 'Segments Clients', color: 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800', icon: Users },
  cost_structure: { label: 'Structure des Coûts', color: 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700', icon: Coins },
  revenue_streams: { label: 'Sources de Revenus', color: 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800', icon: DollarSign },
};

export function BusinessModelCanvas({ blocks, editable = false, onUpdate }: BusinessModelCanvasProps) {
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
    if (Array.isArray(newBlocks[blockKey as keyof BMCBlocks])) {
      (newBlocks[blockKey as keyof BMCBlocks] as string[])[index] = editValue;
    }
    onUpdate(newBlocks);
    setEditingBlock(null);
    setEditingIndex(null);
  };

  const handleAdd = (blockKey: string) => {
    if (!onUpdate) return;
    
    const newBlocks = { ...blocks };
    if (Array.isArray(newBlocks[blockKey as keyof BMCBlocks])) {
      (newBlocks[blockKey as keyof BMCBlocks] as string[]).push('Nouvel élément...');
    }
    onUpdate(newBlocks);
  };

  const handleRemove = (blockKey: string, index: number) => {
    if (!onUpdate) return;
    
    const newBlocks = { ...blocks };
    if (Array.isArray(newBlocks[blockKey as keyof BMCBlocks])) {
      (newBlocks[blockKey as keyof BMCBlocks] as string[]).splice(index, 1);
    }
    onUpdate(newBlocks);
  };

  const renderBlock = (blockKey: string, items: string[] | unknown, rowSpan = 1) => {
    const config = blockConfig[blockKey];
    const Icon = config.icon;
    const itemsList = Array.isArray(items) ? items : [];

    return (
      <Card className={`${config.color} border h-full`} style={{ gridRow: `span ${rowSpan}` }}>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Icon className="w-4 h-4" />
            {config.label}
          </CardTitle>
        </CardHeader>
        <CardContent className="py-2 px-4 space-y-2">
          {itemsList.map((item, index) => (
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

  const renderCostBlock = () => {
    const config = blockConfig.cost_structure;
    const Icon = config.icon;
    const costData = blocks.cost_structure;

    return (
      <Card className={`${config.color} border h-full`}>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Icon className="w-4 h-4" />
            {config.label}
          </CardTitle>
        </CardHeader>
        <CardContent className="py-2 px-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-medium mb-2">Coûts Fixes</h4>
              <div className="space-y-1">
                {costData.fixed_costs?.map((cost, i) => (
                  <div key={i} className="flex justify-between text-sm bg-background/50 rounded px-2 py-1">
                    <span>{cost.item}</span>
                    <span className="font-medium">{cost.amount} {cost.currency}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-medium mb-2">Coûts Variables</h4>
              <div className="space-y-1">
                {costData.variable_costs?.map((cost, i) => (
                  <div key={i} className="flex justify-between text-sm bg-background/50 rounded px-2 py-1">
                    <span>{cost.item}</span>
                    <span className="font-medium">{cost.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t flex justify-between font-medium">
            <span>Estimation mensuelle totale</span>
            <span className="text-primary">{costData.total_monthly_estimate}</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderRevenueBlock = () => {
    const config = blockConfig.revenue_streams;
    const Icon = config.icon;
    const revenueData = blocks.revenue_streams;

    return (
      <Card className={`${config.color} border h-full`}>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Icon className="w-4 h-4" />
            {config.label}
          </CardTitle>
        </CardHeader>
        <CardContent className="py-2 px-4">
          <div className="space-y-2">
            {revenueData?.map((stream, i) => (
              <div key={i} className="bg-background/50 rounded px-2 py-1.5">
                <div className="font-medium text-sm">{stream.source}</div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{stream.model}</span>
                  <span>{stream.pricing}</span>
                </div>
              </div>
            ))}
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
          <h2 className="text-xl font-bold">Business Model Canvas</h2>
          {editable && (
            <Badge variant="outline">Mode édition activé</Badge>
          )}
        </div>

        {/* Canvas Grid */}
        <div className="grid grid-cols-5 gap-2 auto-rows-fr" style={{ minHeight: '500px' }}>
          {/* Row 1 */}
          {renderBlock('key_partners', blocks.key_partners)}
          {renderBlock('key_activities', blocks.key_activities)}
          {renderBlock('value_propositions', blocks.value_propositions, 2)}
          {renderBlock('customer_relationships', blocks.customer_relationships)}
          {renderBlock('customer_segments', blocks.customer_segments, 2)}

          {/* Row 2 */}
          {renderBlock('key_resources', blocks.key_resources)}
          {renderBlock('channels', blocks.channels)}

          {/* Row 3 - Costs and Revenue */}
          <div className="col-span-2">
            {renderCostBlock()}
          </div>
          <div className="col-span-3">
            {renderRevenueBlock()}
          </div>
        </div>
      </div>
    </div>
  );
}

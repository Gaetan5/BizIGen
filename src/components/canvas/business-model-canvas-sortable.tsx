'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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

interface SortableItemProps {
  id: string;
  item: string;
  blockKey: string;
  editable: boolean;
  onEdit: (blockKey: string, index: number, value: string) => void;
  onRemove: (blockKey: string, index: number) => void;
  isEditing: boolean;
  editValue: string;
  onEditChange: (value: string) => void;
  onSave: (blockKey: string, index: number) => void;
}

function SortableItem({ 
  id, 
  item, 
  blockKey, 
  editable, 
  onEdit, 
  onRemove, 
  isEditing, 
  editValue, 
  onEditChange, 
  onSave 
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="group flex items-start gap-1 mb-2">
      {editable && (
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            {...attributes}
            {...listeners}
            className="p-1 hover:bg-background rounded cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-3 h-3 text-muted-foreground" />
          </button>
          <button
            onClick={() => onEdit(blockKey, parseInt(id.split('-')[1]), item)}
            className="p-1 hover:bg-background rounded"
          >
            <Pencil className="w-3 h-3" />
          </button>
          <button
            onClick={() => onRemove(blockKey, parseInt(id.split('-')[1]))}
            className="p-1 hover:bg-destructive/10 rounded text-destructive"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
      
      {isEditing ? (
        <div className="flex-1 flex gap-1">
          <Input
            value={editValue}
            onChange={(e) => onEditChange(e.target.value)}
            className="h-7 text-sm"
            autoFocus
          />
          <Button
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => onSave(blockKey, parseInt(id.split('-')[1]))}
          >
            <Check className="w-3 h-3" />
          </Button>
        </div>
      ) : (
        <div className="flex-1 text-sm bg-background/50 rounded px-2 py-1.5 cursor-text hover:bg-background/70 transition-colors">
          {item}
        </div>
      )}
    </div>
  );
}

interface CanvasBlockProps {
  blockKey: string;
  items: string[];
  config: { label: string; color: string; icon: React.ElementType };
  editable: boolean;
  rowSpan?: number;
  onReorder: (blockKey: string, newItems: string[]) => void;
  onEdit: (blockKey: string, index: number, value: string) => void;
  onRemove: (blockKey: string, index: number) => void;
  onAdd: (blockKey: string) => void;
  editingBlock: string | null;
  editingIndex: number | null;
  editValue: string;
  onEditChange: (value: string) => void;
  onSave: (blockKey: string, index: number) => void;
}

function CanvasBlock({
  blockKey,
  items,
  config,
  editable,
  rowSpan = 1,
  onReorder,
  onEdit,
  onRemove,
  onAdd,
  editingBlock,
  editingIndex,
  editValue,
  onEditChange,
  onSave,
}: CanvasBlockProps) {
  const Icon = config.icon;
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((_, i) => `${blockKey}-${i}` === active.id);
      const newIndex = items.findIndex((_, i) => `${blockKey}-${i}` === over.id);
      const newItems = arrayMove(items, oldIndex, newIndex);
      onReorder(blockKey, newItems);
    }
  }, [items, blockKey, onReorder]);

  return (
    <Card className={`${config.color} border h-full`} style={{ gridRow: `span ${rowSpan}` }}>
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Icon className="w-4 h-4" />
          {config.label}
        </CardTitle>
      </CardHeader>
      <CardContent className="py-2 px-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((_, i) => `${blockKey}-${i}`)}
            strategy={verticalListSortingStrategy}
          >
            {items.map((item, index) => (
              <SortableItem
                key={`${blockKey}-${index}`}
                id={`${blockKey}-${index}`}
                item={item}
                blockKey={blockKey}
                editable={editable}
                onEdit={onEdit}
                onRemove={onRemove}
                isEditing={editingBlock === blockKey && editingIndex === index}
                editValue={editValue}
                onEditChange={onEditChange}
                onSave={onSave}
              />
            ))}
          </SortableContext>
        </DndContext>
        
        {editable && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-7 text-xs opacity-50 hover:opacity-100"
            onClick={() => onAdd(blockKey)}
          >
            <Plus className="w-3 h-3 mr-1" />
            Ajouter
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function BusinessModelCanvasSortable({ blocks, editable = false, onUpdate }: BusinessModelCanvasProps) {
  const [editingBlock, setEditingBlock] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleReorder = (blockKey: string, newItems: string[]) => {
    if (!onUpdate) return;
    const newBlocks = { ...blocks, [blockKey]: newItems };
    onUpdate(newBlocks);
  };

  const handleEdit = (blockKey: string, index: number, value: string) => {
    setEditingBlock(blockKey);
    setEditingIndex(index);
    setEditValue(value);
  };

  const handleSave = (blockKey: string, index: number) => {
    if (!onUpdate) return;
    const newBlocks = { ...blocks };
    (newBlocks[blockKey as keyof BMCBlocks] as string[])[index] = editValue;
    onUpdate(newBlocks);
    setEditingBlock(null);
    setEditingIndex(null);
  };

  const handleAdd = (blockKey: string) => {
    if (!onUpdate) return;
    const newBlocks = { ...blocks };
    (newBlocks[blockKey as keyof BMCBlocks] as string[]).push('Nouvel élément...');
    onUpdate(newBlocks);
  };

  const handleRemove = (blockKey: string, index: number) => {
    if (!onUpdate) return;
    const newBlocks = { ...blocks };
    (newBlocks[blockKey as keyof BMCBlocks] as string[]).splice(index, 1);
    onUpdate(newBlocks);
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
            <Badge variant="outline" className="gap-1">
              <GripVertical className="w-3 h-3" />
              Glisser pour réorganiser
            </Badge>
          )}
        </div>

        {/* Canvas Grid */}
        <div className="grid grid-cols-5 gap-2 auto-rows-fr" style={{ minHeight: '500px' }}>
          {/* Row 1 */}
          <CanvasBlock
            blockKey="key_partners"
            items={blocks.key_partners}
            config={blockConfig.key_partners}
            editable={editable}
            onReorder={handleReorder}
            onEdit={handleEdit}
            onRemove={handleRemove}
            onAdd={handleAdd}
            editingBlock={editingBlock}
            editingIndex={editingIndex}
            editValue={editValue}
            onEditChange={setEditValue}
            onSave={handleSave}
          />
          <CanvasBlock
            blockKey="key_activities"
            items={blocks.key_activities}
            config={blockConfig.key_activities}
            editable={editable}
            onReorder={handleReorder}
            onEdit={handleEdit}
            onRemove={handleRemove}
            onAdd={handleAdd}
            editingBlock={editingBlock}
            editingIndex={editingIndex}
            editValue={editValue}
            onEditChange={setEditValue}
            onSave={handleSave}
          />
          <CanvasBlock
            blockKey="value_propositions"
            items={blocks.value_propositions}
            config={blockConfig.value_propositions}
            editable={editable}
            rowSpan={2}
            onReorder={handleReorder}
            onEdit={handleEdit}
            onRemove={handleRemove}
            onAdd={handleAdd}
            editingBlock={editingBlock}
            editingIndex={editingIndex}
            editValue={editValue}
            onEditChange={setEditValue}
            onSave={handleSave}
          />
          <CanvasBlock
            blockKey="customer_relationships"
            items={blocks.customer_relationships}
            config={blockConfig.customer_relationships}
            editable={editable}
            onReorder={handleReorder}
            onEdit={handleEdit}
            onRemove={handleRemove}
            onAdd={handleAdd}
            editingBlock={editingBlock}
            editingIndex={editingIndex}
            editValue={editValue}
            onEditChange={setEditValue}
            onSave={handleSave}
          />
          <CanvasBlock
            blockKey="customer_segments"
            items={blocks.customer_segments}
            config={blockConfig.customer_segments}
            editable={editable}
            rowSpan={2}
            onReorder={handleReorder}
            onEdit={handleEdit}
            onRemove={handleRemove}
            onAdd={handleAdd}
            editingBlock={editingBlock}
            editingIndex={editingIndex}
            editValue={editValue}
            onEditChange={setEditValue}
            onSave={handleSave}
          />

          {/* Row 2 */}
          <CanvasBlock
            blockKey="key_resources"
            items={blocks.key_resources}
            config={blockConfig.key_resources}
            editable={editable}
            onReorder={handleReorder}
            onEdit={handleEdit}
            onRemove={handleRemove}
            onAdd={handleAdd}
            editingBlock={editingBlock}
            editingIndex={editingIndex}
            editValue={editValue}
            onEditChange={setEditValue}
            onSave={handleSave}
          />
          <CanvasBlock
            blockKey="channels"
            items={blocks.channels}
            config={blockConfig.channels}
            editable={editable}
            onReorder={handleReorder}
            onEdit={handleEdit}
            onRemove={handleRemove}
            onAdd={handleAdd}
            editingBlock={editingBlock}
            editingIndex={editingIndex}
            editValue={editValue}
            onEditChange={setEditValue}
            onSave={handleSave}
          />

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

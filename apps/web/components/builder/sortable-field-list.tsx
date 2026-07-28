"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { trpc } from "~/trpc/client";

interface Field {
  id: string;
  formId: string | null;
  label: string;
  description: string | null;
  type: string;
  isRequired: boolean;
  index: string;
  [key: string]: unknown;
}

interface SortableFieldListProps {
  fields: Field[];
  formId: string;
  selectedFieldId: string | null;
  onSelectField: (fieldId: string) => void;
  onDeleteField: (fieldId: string) => void;
}

export function SortableFieldList({
  fields,
  formId,
  selectedFieldId,
  onSelectField,
  onDeleteField,
}: SortableFieldListProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [optimisticFields, setOptimisticFields] = useState<Field[] | null>(null);

  const reorderFieldsMutation = trpc.form.reorderFields.useMutation();
  const utils = trpc.useUtils();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const displayFields = optimisticFields ?? fields;
  const activeField = displayFields.find((f) => f.id === activeId);

  const saveReorderedFields = async (reordered: Field[]) => {
    setOptimisticFields(reordered);
    try {
      await reorderFieldsMutation.mutateAsync({
        fieldIds: reordered.map((f) => f.id),
      });
    } catch (err) {
      console.error("Failed to persist field order:", err);
    } finally {
      utils.form.getFields.invalidate({ formId });
      setOptimisticFields(null);
    }
  };

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const oldIndex = displayFields.findIndex((f) => f.id === active.id);
    const newIndex = displayFields.findIndex((f) => f.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(displayFields, oldIndex, newIndex);
    saveReorderedFields(reordered);
  }

  function handleDragCancel() {
    setActiveId(null);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext
        items={displayFields.map((f) => f.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3 max-w-2xl mx-auto">
          {displayFields.map((field, idx) => (
            <SortableFieldCard
              key={field.id}
              field={field}
              index={idx}
              isSelected={selectedFieldId === field.id}
              isDragging={activeId === field.id}
              onSelect={() => onSelectField(field.id)}
              onDelete={() => onDeleteField(field.id)}
            />
          ))}
        </div>
      </SortableContext>

      <DragOverlay dropAnimation={{ duration: 200, easing: "ease" }}>
        {activeField ? (
          <FieldCardOverlay field={activeField} index={displayFields.indexOf(activeField)} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

// ─── Sortable Field Card ─────────────────────────────────────────────────────

interface SortableFieldCardProps {
  field: Field;
  index: number;
  isSelected: boolean;
  isDragging: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

function SortableFieldCard({
  field,
  index,
  isSelected,
  isDragging,
  onSelect,
  onDelete,
}: SortableFieldCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isSorting,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`bg-white border rounded-xl p-4 cursor-pointer transition-all group ${
        isSelected
          ? "border-orange-500 shadow-[0_0_0_2px_rgba(249,115,22,0.2)]"
          : "border-border hover:border-orange-500 hover:shadow-sm"
      } ${isSorting ? "transition-transform" : ""}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {/* Drag handle */}
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-orange-500 transition-colors p-0.5 -ml-1 touch-none"
            onClick={(e) => e.stopPropagation()}
            title="Drag to reorder"
          >
            <span className="material-symbols-outlined text-[18px]">drag_indicator</span>
          </button>
          
          <span
            className="text-[11px] text-muted-foreground bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-medium"
            style={{ fontFamily: "var(--font-geist-mono)" }}
          >
            {index + 1}
          </span>
          
          <span
            className="text-[12px] text-orange-500 uppercase font-medium"
            style={{ fontFamily: "var(--font-geist-mono)" }}
          >
            {field.type?.replace("_", " ")}
          </span>
          
          {field.isRequired && (
            <span className="text-[10px] text-red-500">*required</span>
          )}
        </div>

        {/* Delete Action */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-slate-400 hover:text-red-500 transition-colors p-1 opacity-80 sm:opacity-0 group-hover:opacity-100 rounded hover:bg-red-50"
          title="Delete field"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>
      
      <p className="text-[14px] text-foreground font-medium">{field.label}</p>
      {field.description && (
        <p className="text-[12px] text-muted-foreground mt-1">{field.description}</p>
      )}
    </div>
  );
}

// ─── Drag Overlay ─────────────────────────────────────────────────────────────

function FieldCardOverlay({ field, index }: { field: Field; index: number }) {
  return (
    <div
      className="bg-white border border-orange-500 rounded-xl p-4 shadow-2xl shadow-orange-500/10 rotate-[1.5deg] scale-[1.02]"
      style={{ width: "100%", maxWidth: "672px" }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-orange-500 p-0.5 -ml-1">
            <span className="material-symbols-outlined text-[18px]">drag_indicator</span>
          </span>
          <span
            className="text-[11px] text-muted-foreground bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-medium"
            style={{ fontFamily: "var(--font-geist-mono)" }}
          >
            {index + 1}
          </span>
          <span
            className="text-[12px] text-orange-500 uppercase font-medium"
            style={{ fontFamily: "var(--font-geist-mono)" }}
          >
            {field.type?.replace("_", " ")}
          </span>
          {field.isRequired && (
            <span className="text-[10px] text-red-500">*required</span>
          )}
        </div>
      </div>
      <p className="text-[14px] text-foreground font-medium">{field.label}</p>
      {field.description && (
        <p className="text-[12px] text-muted-foreground mt-1">{field.description}</p>
      )}
    </div>
  );
}
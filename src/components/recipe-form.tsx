"use client";

import { useState } from "react";
import { Input, Textarea } from "./ui/input";
import { Button } from "./ui/button";

interface RecipeFormProps {
  initialData?: {
    temperature?: number;
    time?: number;
    instructions?: string;
  };
  onSubmit: (data: { temperature: number; time: number; instructions: string }) => Promise<void>;
}

export function RecipeForm({ initialData, onSubmit }: RecipeFormProps) {
  const [temperature, setTemperature] = useState(initialData?.temperature?.toString() || "");
  const [time, setTime] = useState(initialData?.time?.toString() || "");
  const [instructions, setInstructions] = useState(initialData?.instructions || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!temperature || !time || !instructions) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        temperature: parseInt(temperature, 10),
        time: parseFloat(time),
        instructions,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isOverLimit = instructions.length > 200;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 shadow-2xl backdrop-blur-xl md:p-8"
    >
      <div className="grid grid-cols-2 gap-6">
        <label className="flex flex-col space-y-2">
          <span className="text-sm font-semibold text-zinc-300">Temperature (°F)</span>
          <Input
            type="number"
            placeholder="350"
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
            required
            aria-label="Temperature"
            min={0}
            max={1000}
          />
        </label>

        <label className="flex flex-col space-y-2">
          <span className="text-sm font-semibold text-zinc-300">Time (min)</span>
          <Input
            type="number"
            placeholder="15"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
            aria-label="Time"
            min={0}
            step="0.5"
          />
        </label>
      </div>

      <label className="flex flex-col space-y-2">
        <div className="flex items-end justify-between">
          <span className="text-sm font-semibold text-zinc-300">Instructions</span>
          <span
            className={`text-xs font-medium ${isOverLimit ? "text-rose-500" : "text-zinc-500"}`}
          >
            {instructions.length} / 200
          </span>
        </div>
        <Textarea
          placeholder="e.g. Bake for 15 minutes until golden brown."
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          required
          aria-label="Instructions"
          maxLength={200}
        />
        {isOverLimit && (
          <p className="text-xs text-rose-500">Instructions must be under 200 characters.</p>
        )}
      </label>

      <Button type="submit" className="h-14 w-full" disabled={isSubmitting || isOverLimit}>
        {isSubmitting ? "Saving..." : initialData ? "Update Recipe" : "Add Recipe"}
      </Button>
    </form>
  );
}

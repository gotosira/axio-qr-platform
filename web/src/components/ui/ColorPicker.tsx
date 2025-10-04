"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from './Button';
import { ChevronDown } from 'lucide-react';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#dc2626', '#ea580c', '#d97706'
];

const GRADIENT_PRESETS = [
  'linear-gradient(45deg, #ff6b6b, #feca57)',
  'linear-gradient(45deg, #48cae4, #023e8a)',
  'linear-gradient(45deg, #f093fb, #f5576c)',
  'linear-gradient(45deg, #4facfe, #00f2fe)',
  'linear-gradient(45deg, #43e97b, #38f9d7)',
  'linear-gradient(45deg, #fa709a, #fee140)',
  'linear-gradient(45deg, #a8edea, #fed6e3)',
  'linear-gradient(45deg, #ff9a9e, #fecfef)',
  'linear-gradient(45deg, #667eea, #764ba2)',
  'linear-gradient(45deg, #f093fb, #f5576c)',
  'linear-gradient(45deg, #4facfe, #00f2fe)',
  'linear-gradient(45deg, #667eea, #764ba2)',
  'linear-gradient(45deg, #ff6b6b, #ffd93d)',
  'linear-gradient(45deg, #74b9ff, #0984e3)',
  'linear-gradient(45deg, #fd79a8, #e84393)'
];

export default function ColorPicker({ value, onChange, className = '' }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'solid' | 'gradient'>('solid');
  const [customColor, setCustomColor] = useState('#3b82f6');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDisplayColor = () => {
    if (value.startsWith('linear-gradient')) {
      return value;
    }
    return value || '#3b82f6';
  };

  const isGradient = value.startsWith('linear-gradient');

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 px-3 flex items-center gap-2"
      >
        <div 
          className="w-6 h-6 rounded border border-border flex-shrink-0"
          style={{ background: getDisplayColor() }}
        />
        <span className="text-sm truncate max-w-20">
          {isGradient ? 'Gradient' : 'Color'}
        </span>
        <ChevronDown size={16} className="flex-shrink-0" />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50 p-4 min-w-80">
          {/* Tabs */}
          <div className="flex mb-4 bg-muted rounded-md p-1">
            <button
              onClick={() => setActiveTab('solid')}
              className={`flex-1 px-3 py-1 text-sm rounded transition-colors ${
                activeTab === 'solid' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Solid Colors
            </button>
            <button
              onClick={() => setActiveTab('gradient')}
              className={`flex-1 px-3 py-1 text-sm rounded transition-colors ${
                activeTab === 'gradient' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Gradients
            </button>
          </div>

          {activeTab === 'solid' && (
            <div className="space-y-4">
              {/* Custom Color Input */}
              <div>
                <label className="block text-sm font-medium mb-2">Custom Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    className="w-12 h-10 rounded border border-border cursor-pointer"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onChange(customColor)}
                    className="flex-1"
                  >
                    Apply Color
                  </Button>
                </div>
              </div>

              {/* Preset Colors */}
              <div>
                <label className="block text-sm font-medium mb-2">Preset Colors</label>
                <div className="grid grid-cols-5 gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => onChange(color)}
                      className={`w-12 h-10 rounded border-2 transition-all hover:scale-105 ${
                        value === color ? 'border-primary' : 'border-border'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'gradient' && (
            <div className="space-y-4">
              <label className="block text-sm font-medium mb-2">Gradient Presets</label>
              <div className="grid grid-cols-3 gap-2">
                {GRADIENT_PRESETS.map((gradient, index) => (
                  <button
                    key={index}
                    onClick={() => onChange(gradient)}
                    className={`w-full h-12 rounded border-2 transition-all hover:scale-105 ${
                      value === gradient ? 'border-primary' : 'border-border'
                    }`}
                    style={{ background: gradient }}
                    title={gradient}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Current Selection */}
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Current:</span>
              <div 
                className="w-8 h-8 rounded border border-border"
                style={{ background: getDisplayColor() }}
              />
              <span className="text-xs text-muted-foreground truncate flex-1">
                {value}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
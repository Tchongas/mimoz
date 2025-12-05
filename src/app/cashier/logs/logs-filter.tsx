'use client';

// ============================================
// MIMOZ - Logs Filter Component
// ============================================

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input, Label } from '@/components/ui';
import { Filter, X, Calendar } from 'lucide-react';

interface LogsFilterProps {
  startDate?: string;
  endDate?: string;
}

export function LogsFilter({ startDate, endDate }: LogsFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [start, setStart] = useState(startDate || '');
  const [end, setEnd] = useState(endDate || '');

  const handleFilter = () => {
    const params = new URLSearchParams();
    if (start) params.set('startDate', start);
    if (end) params.set('endDate', end);
    router.push(`/cashier/logs?${params.toString()}`);
  };

  const handleClear = () => {
    setStart('');
    setEnd('');
    router.push('/cashier/logs');
  };

  const hasFilters = startDate || endDate;

  // Quick filters
  const setToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setStart(today);
    setEnd(today);
  };

  const setThisWeek = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    setStart(startOfWeek.toISOString().split('T')[0]);
    setEnd(today.toISOString().split('T')[0]);
  };

  const setThisMonth = () => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    setStart(startOfMonth.toISOString().split('T')[0]);
    setEnd(today.toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-4">
      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={setToday}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors"
        >
          Hoje
        </button>
        <button
          type="button"
          onClick={setThisWeek}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors"
        >
          Esta Semana
        </button>
        <button
          type="button"
          onClick={setThisMonth}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors"
        >
          Este Mês
        </button>
      </div>

      {/* Date Range */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 space-y-1">
          <Label htmlFor="startDate" className="text-sm">Data Inicial</Label>
          <Input
            id="startDate"
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </div>
        <div className="flex-1 space-y-1">
          <Label htmlFor="endDate" className="text-sm">Data Final</Label>
          <Input
            id="endDate"
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </div>
        <div className="flex items-end gap-2">
          <Button onClick={handleFilter} className="flex-shrink-0">
            <Filter className="w-4 h-4 mr-2" />
            Filtrar
          </Button>
          {hasFilters && (
            <Button 
              onClick={handleClear} 
              variant="outline"
              className="flex-shrink-0"
            >
              <X className="w-4 h-4 mr-2" />
              Limpar
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters */}
      {hasFilters && (
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Calendar className="w-4 h-4" />
          <span>
            Filtrando: {startDate && `de ${new Date(startDate + 'T00:00:00').toLocaleDateString('pt-BR')}`}
            {endDate && ` até ${new Date(endDate + 'T00:00:00').toLocaleDateString('pt-BR')}`}
          </span>
        </div>
      )}
    </div>
  );
}

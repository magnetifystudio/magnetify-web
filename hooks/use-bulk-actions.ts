// hooks/use-bulk-actions.ts
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export function useBulkActions(fetchAll: () => void) {
  const [bulkLoading, setBulkLoading] = useState(false);
  const supabase = createClient();

  const bulkDelete = async (selectedIds: Set<string>) => {
    if (!confirm(`DANGER: ${selectedIds.size} products delete ho jayenge. Proceed?`)) return;
    setBulkLoading(true);
    try {
      for (const id of selectedIds) {
        await supabase.from('magnetify_products').delete().eq('id', id);
      }
      await fetchAll();
    } finally {
      setBulkLoading(false);
    }
  };

  const bulkStatusUpdate = async (selectedIds: Set<string>, status: 'Active' | 'Draft' | 'Featured') => {
    setBulkLoading(true);
    try {
      for (const id of selectedIds) {
        await supabase.from('magnetify_products').update({ status }).eq('id', id);
      }
      await fetchAll();
    } finally {
      setBulkLoading(false);
    }
  };

  const bulkShowInPack = async (selectedIds: Set<string>, show: boolean) => {
    setBulkLoading(true);
    try {
      for (const id of selectedIds) {
        await supabase.from('magnetify_products').update({ show_in_pack: show }).eq('id', id);
      }
      await fetchAll();
    } finally {
      setBulkLoading(false);
    }
  };

  return { bulkLoading, bulkDelete, bulkStatusUpdate, bulkShowInPack };
}
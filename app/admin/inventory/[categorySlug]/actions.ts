"use server";

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addSubCategoryAction(categoryId: string, formData: FormData) {
  const supabase = await createClient();
  const name = formData.get('name') as string;

  const { error } = await supabase
    .from('sub_categories')
    .insert([{ 
      name, 
      category_id: categoryId 
    }]);

  if (error) throw new Error(error.message);

  revalidatePath(`/admin/inventory/${categoryId}`);
}

export async function deleteSubCategoryAction(id: string, categoryId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('sub_categories')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);

  revalidatePath(`/admin/inventory/${categoryId}`);
}

export async function moveSubCategoryAction(
  id1: string, order1: number,
  id2: string, order2: number,
  categoryId: string
) {
  const supabase = await createClient();

  // Pehle temporary value set karo taaki conflict na ho
  await supabase.from('sub_categories').update({ display_order: 99999 }).eq('id', id1);
  await supabase.from('sub_categories').update({ display_order: order1 }).eq('id', id2);
  await supabase.from('sub_categories').update({ display_order: order2 }).eq('id', id1);

  revalidatePath(`/admin/inventory/${categoryId}`);
}
"use server";

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export type Category = {
  id: string;
  name: string;
  description?: string;
  image_url: string | null;
  display_order: number;
};

// 1. Image Upload Action
export async function uploadImageAction(formData: FormData) {
  const supabase = await createClient();
  const file = formData.get('file') as File;

  if (!file) return { error: "No file provided" };

  // Unique filename taaki cache issue na ho
  const fileName = `${Date.now()}-${file.name}`;
  
  const { data, error } = await supabase.storage
    .from('category-images') // FIXED: Correct bucket name
    .upload(fileName, file);

  if (error) return { error: error.message };

  const { data: { publicUrl } } = supabase.storage
    .from('category-images')
    .getPublicUrl(data.path);

  return { success: true, url: publicUrl };
}

// 2. Add Category Action
export async function addCategoryAction(data: { name: string; description: string; image_url: string }) {
  const supabase = await createClient();

  // maybeSingle use kiya hai taaki empty table par crash na ho
  const { data: lastCat } = await supabase
    .from('categories')
    .select('display_order')
    .order('display_order', { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrder = (lastCat?.display_order || 0) + 1;

  const { error } = await supabase
    .from('categories')
    .insert([
      { 
        name: data.name, 
        description: data.description, 
        image_url: data.image_url, 
        display_order: nextOrder 
      }
    ]);

  if (error) {
    console.error("Insert Error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/inventory');
  return { success: true };
}

// 3. Move Category (Fixed Swap Logic)
export async function moveCategoryAction(id1: string, order1: number, id2: string, order2: number) {
  const supabase = await createClient();

  // id1 ko order1 (target order) assign karna
  const { error: err1 } = await supabase
    .from('categories')
    .update({ display_order: order1 })
    .eq('id', id1);

  // id2 ko order2 (current order) assign karna
  const { error: err2 } = await supabase
    .from('categories')
    .update({ display_order: order2 })
    .eq('id', id2);

  revalidatePath('/admin/inventory', 'page');
  return { error: err1 || err2 };
}

// 4. Delete Category Action
export async function deleteCategoryAction(id: string, imageUrl: string) {
  const supabase = await createClient();

  const { error: dbError } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (dbError) return { error: dbError.message };

  // FIX: Sahi bucket se storage clean-up
  if (imageUrl && imageUrl.includes('category-images')) {
    const fileName = imageUrl.split('/').pop();
    if (fileName) {
      await supabase.storage
        .from('category-images')
        .remove([fileName]);
    }
  }

  revalidatePath('/admin/inventory');
  return { success: true };
}
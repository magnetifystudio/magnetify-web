"use server";

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

type ProductStatus = 'Active' | 'Draft' | 'Featured';

type ProductEditUpdate = {
  id: string;
  price: number;
  stock: number;
};

export async function moveProductAction(
  id1: string, order1: number,
  id2: string, order2: number,
  categorySlug: string,
  subCategoryId: string
) {
  const supabase = await createClient();

  // Step 1: Fetch CURRENT display_order values fresh from DB
  // (don't trust the values passed from client — they may be stale)
  const { data: p1 } = await supabase
    .from('magnetify_products')
    .select('id, display_order, sub_category_id')
    .eq('id', id1)
    .single();

  const { data: p2 } = await supabase
    .from('magnetify_products')
    .select('id, display_order')
    .eq('id', id2)
    .single();

  if (!p1 || !p2) return;

  // Step 2: If orders are same (0,0 or duplicate), normalize ALL products first
  if (p1.display_order === p2.display_order) {
    const { data: allProds } = await supabase
      .from('magnetify_products')
      .select('id')
      .eq('sub_category_id', p1.sub_category_id)
      .order('created_at', { ascending: true });

    if (allProds) {
      for (let i = 0; i < allProds.length; i++) {
        await supabase
          .from('magnetify_products')
          .update({ display_order: (i + 1) * 10 }) // gaps for easier future reordering
          .eq('id', allProds[i].id);
      }
    }

    // Re-fetch fresh orders after normalization
    const { data: fresh1 } = await supabase
      .from('magnetify_products').select('display_order').eq('id', id1).single();
    const { data: fresh2 } = await supabase
      .from('magnetify_products').select('display_order').eq('id', id2).single();

    if (!fresh1 || !fresh2) return;
    p1.display_order = fresh1.display_order;
    p2.display_order = fresh2.display_order;
  }

  // Step 3: Swap using temp value to avoid unique constraint issues
  const TEMP = -1;
  await supabase.from('magnetify_products').update({ display_order: TEMP }).eq('id', id1);
  await supabase.from('magnetify_products').update({ display_order: p1.display_order }).eq('id', id2);
  await supabase.from('magnetify_products').update({ display_order: p2.display_order }).eq('id', id1);

  // Revalidate AFTER all updates are done
  revalidatePath(`/admin/inventory/${categorySlug}/${subCategoryId}`);
}

export async function deleteProductAction(
  productId: string,
  categorySlug: string,
  subCategoryId: string
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('magnetify_products')
    .delete()
    .eq('id', productId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/inventory/${categorySlug}/${subCategoryId}`);
}

export async function updateProductFieldsAction(
  productId: string,
  price: number,
  stock: number,
  categorySlug: string,
  subCategoryId: string
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('magnetify_products')
    .update({ price, stock })
    .eq('id', productId);

  if (error) throw new Error(error.message);
  revalidatePath(`/admin/inventory/${categorySlug}/${subCategoryId}`);
}

export async function updateProductStatusAction(
  productId: string,
  status: ProductStatus,
  categorySlug: string,
  subCategoryId: string
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('magnetify_products')
    .update({ status })
    .eq('id', productId);

  if (error) throw new Error(error.message);
  revalidatePath(`/admin/inventory/${categorySlug}/${subCategoryId}`);
}

export async function bulkSaveProductEditsAction(
  updates: ProductEditUpdate[],
  categorySlug: string,
  subCategoryId: string
) {
  if (updates.length === 0) return;

  const supabase = await createClient();

  for (const update of updates) {
    const { error } = await supabase
      .from('magnetify_products')
      .update({ price: update.price, stock: update.stock })
      .eq('id', update.id);

    if (error) throw new Error(error.message);
  }

  revalidatePath(`/admin/inventory/${categorySlug}/${subCategoryId}`);
}

export async function bulkDeleteProductsAction(
  productIds: string[],
  categorySlug: string,
  subCategoryId: string
) {
  if (productIds.length === 0) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from('magnetify_products')
    .delete()
    .in('id', productIds);

  if (error) throw new Error(error.message);
  revalidatePath(`/admin/inventory/${categorySlug}/${subCategoryId}`);
}

export async function bulkUpdateProductStatusAction(
  productIds: string[],
  status: ProductStatus,
  categorySlug: string,
  subCategoryId: string
) {
  if (productIds.length === 0) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from('magnetify_products')
    .update({ status })
    .in('id', productIds);

  if (error) throw new Error(error.message);
  revalidatePath(`/admin/inventory/${categorySlug}/${subCategoryId}`);
}

export async function bulkToggleShowInPackAction(
  productIds: string[],
  showInPack: boolean,
  categorySlug: string,
  subCategoryId: string
) {
  if (productIds.length === 0) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from('magnetify_products')
    .update({ show_in_pack: showInPack })
    .in('id', productIds);

  if (error) throw new Error(error.message);
  revalidatePath(`/admin/inventory/${categorySlug}/${subCategoryId}`);
}

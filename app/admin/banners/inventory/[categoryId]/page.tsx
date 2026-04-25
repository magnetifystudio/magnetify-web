import { createPublicSupabaseClient } from "@/lib/supabase/server";
import Link from 'next/link';
import { ArrowLeft, Plus, FolderTree } from 'lucide-react';

export default async function Page({
  params,
}: {
  params: Promise<{ categoryId: string }>; // Type ko Promise banaya
}) {
  // 1. Params ko await karo (Iske bina categoryId undefined aayegi)
  const resolvedParams = await params;
  const categoryId = resolvedParams?.categoryId;

  console.log("RESOLVED PARAMS:", resolvedParams);

  if (!categoryId) {
    return <div className="p-10 text-red-500 font-bold">Category ID missing from URL</div>;
  }

  const supabase = createPublicSupabaseClient();

  // 2. Data fetch karo
  const { data, error } = await supabase
    .from("sub_categories")
    .select("*")
    .eq("category_id", categoryId)
    .order('display_order', { ascending: true });

  if (error) {
    console.error(error);
    return <div className="p-10 text-red-500">Error loading subcategories: {error.message}</div>;
  }

  return (
    <div className="p-8">
      {/* Header Section - Isse flow maintain rahega */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/inventory" className="p-2 hover:bg-gray-100 rounded-full transition">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Sub-Categories</h1>
            <p className="text-sm text-gray-500 font-mono">ID: {categoryId}</p>
          </div>
        </div>
        
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm transition">
          <Plus size={20} />
          New Sub-Category
        </button>
      </div>

      {/* Grid of Subcategories */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {data?.length === 0 ? (
           <div className="col-span-full text-center py-20 border-2 border-dashed rounded-2xl bg-gray-50">
             <p className="text-gray-400">No sub-categories found. Please add one.</p>
           </div>
        ) : (
          data?.map((item: any) => (
            <Link 
              key={item.id} 
              href={`/admin/inventory/${categoryId}/${item.id}`} // Agle page ka path (Product Table)
              className="group p-6 border rounded-xl bg-white shadow-sm hover:shadow-md hover:border-blue-500 transition-all cursor-pointer"
            >
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <FolderTree size={24} />
              </div>
              <h2 className="font-semibold text-gray-800 text-lg">{item.name}</h2>
              <p className="text-xs text-gray-400 mt-1 uppercase font-mono">{item.slug}</p>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
import { redirect } from "next/navigation";

type SubCategoryAliasPageProps = {
  params: Promise<{ categorySlug: string; subCategorySlug: string }>;
};

export default async function SubCategoryAliasPage({
  params,
}: SubCategoryAliasPageProps) {
  const { categorySlug, subCategorySlug } = await params;

  redirect(`/${categorySlug}/${subCategorySlug}`);
}

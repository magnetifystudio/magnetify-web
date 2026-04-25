import { redirect } from "next/navigation";

type CategoryAliasPageProps = {
  params: Promise<{ categorySlug: string }>;
};

export default async function CategoryAliasPage({
  params,
}: CategoryAliasPageProps) {
  const { categorySlug } = await params;

  redirect(`/${categorySlug}`);
}

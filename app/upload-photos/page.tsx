import { UploadPhotosClient } from "./UploadPhotosClient";

type UploadPhotosPageProps = {
  searchParams: Promise<{
    id?: string;
    title?: string;
    price?: string;
    priceLabel?: string;
    set?: string;
    image?: string;
    label?: string;
    slug?: string;
    replacing?: string;
  }>;
};

export default async function UploadPhotosPage({
  searchParams,
}: UploadPhotosPageProps) {
  const params = await searchParams;
  const price = Number(params.price ?? 0);

  return (
    <UploadPhotosClient
      productId={params.id ?? ""}
      productTitle={params.title ?? ""}
      price={price}
      priceLabel={params.priceLabel ?? `Rs. ${price}`}
      setSize={Number(params.set ?? 1)}
      imageSrc={params.image ?? ""}
      variantLabel={params.label ?? ""}
      productSlug={params.slug ?? ""}
      replacingId={params.replacing ?? ""}
    />
  );
}

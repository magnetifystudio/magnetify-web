export type ProductSet = {
  size: string;
  price: number;
  compare_price?: number;
  label?: string;
  stock?: number;
};

export type Variation = {
  label: string;
  price: number;
  compare_price?: number;
  stock?: number;
};

export type WhyBuyPoint = {
  title: string;
  description: string;
};

export type ProductDetail = {
  label: string;
  value: string;
};

export type SpecialStoryPoint = {
  title: string;
  desc: string;
};

export type SpecialStory = {
  title: string;
  description: string;
  points?: SpecialStoryPoint[];
};

export type Product = {
  id: string;
  slug: string;
  title_name: string;
  short_description: string;
  main_image: string;
  extra_images: string[];
  photo_count?: number; // Added photo_count field

  // Pricing
  price: number;
  compare_price?: number;

  // Listing type
  listing_type: "single" | "variation";
  variation_type?: string;

  // Relations
  category_id: string;
  sub_category_id: string;

  // Data
  product_sets: ProductSet[];
  variations: Variation[];
  why_buy_points: WhyBuyPoint[];
  product_details: ProductDetail[];
  special_story: SpecialStory;

  // Meta
  status: string;
  display_order: number;
  created_at: string;
};
export type ShopItem = {
  id: string;
  title: string;
  size: string;
  price: string;
  detail: string;
  href: string;
  premium?: boolean;
};

export type ShopMainCategory = {
  slug: string;
  navLabel: string;
  eyebrow: string;
  title: string;
  description: string;
  accentClass: string;
  panelClass: string;
  buttonClass: string;
  previewImage: string;
  previewAlt: string;
  previewKicker: string;
  items: ShopItem[];
};

export const shopMainCategories: ShopMainCategory[] = [
  {
    slug: "classic-magnets",
    navLabel: "Classic Magnets",
    eyebrow: "Classic Magnets",
    title: "Square and round photo magnets for fridges, memory boards, and everyday gifting.",
    description:
      "The easiest entry point into Magnetify. These are the classic photo magnets customers buy for home decor, family gifting, and return favors.",
    accentClass: "text-pink",
    panelClass: "border-pink/20 bg-[#fff3f8]",
    buttonClass: "bg-pink hover:bg-orange",
    previewImage: "/classic-magnets-fridge-photo-display-magnetify-studio.png",
    previewAlt: "Classic square and round photo magnets displayed on a kitchen fridge",
    previewKicker: "Best for first-time buyers",
    items: [
      {
        id: "square-magnets",
        title: "Magnetify Square",
        size: "2 x 2 in / 58 mm",
        price: "Sets from Rs. 179",
        detail: "Clean square format for couples, kids, travel memories, and family packs.",
        href: "/shop/classic-magnets#square-magnets",
      },
      {
        id: "round-magnets",
        title: "Magnetify Round",
        size: "2.5 in",
        price: "Sets from Rs. 179",
        detail: "Soft circular format that works beautifully for pets, baby photos, and portraits.",
        href: "/shop/classic-magnets/round-magnets",
      },
    ],
  },
  {
    slug: "acrylic-collection",
    navLabel: "Acrylic Collection",
    eyebrow: "Acrylic Collection",
    title: "Premium acrylic keepsakes with a polished, display-led feel.",
    description:
      "For customers who want a more premium look than standard magnets. Acrylic pieces work well for desks, shelves, and elevated gifting.",
    accentClass: "text-gold",
    panelClass: "border-gold/25 bg-[#fff8e4]",
    buttonClass: "bg-charcoal hover:bg-pink",
    previewImage: "/acrylic-photo-magnets-fridge-display-magnetify-studio.png",
    previewAlt: "Premium acrylic photo keepsakes displayed on a fridge",
    previewKicker: "Desk decor and premium gifting",
    items: [
      {
        id: "acrylic-rectangle",
        title: "Magnetify Acrylic Rectangle",
        size: "2 x 3 in to 3.5 x 4.25 in",
        price: "Starts at Rs. 179",
        detail: "Portrait acrylic format for desk styling, gifting, and premium display pieces.",
        href: "/shop/acrylic-collection",
      },
      {
        id: "acrylic-round",
        title: "Magnetify Acrylic Round",
        size: "3 in",
        price: "Rs. 249 per piece",
        detail: "Rounded acrylic finish for softer premium gifting and occasion-based keepsakes.",
        href: "/shop/acrylic-collection/round-acrylic",
      },
      {
        id: "acrylic-heart",
        title: "Magnetify Acrylic Heart",
        size: "3 in",
        price: "Rs. 249 per piece",
        detail: "Romantic heart format for anniversaries, proposals, and couple gifting.",
        href: "/shop/acrylic-collection/heart-acrylic",
      },
    ],
  },
  {
    slug: "music-magnets",
    navLabel: "Music Magnets",
    eyebrow: "Music Magnets",
    title: "Scan-and-play keepsakes that turn photos into sound-linked memories.",
    description:
      "A signature Magnetify category for couples, weddings, anniversaries, and story-driven gifting with Spotify or YouTube links.",
    accentClass: "text-orange",
    panelClass: "border-orange/20 bg-[#fff5ef]",
    buttonClass: "bg-orange hover:bg-pink",
    previewImage: "/music-magnets-handheld-keepsakes-magnetify-studio.png",
    previewAlt: "Personalized music magnets held in hand",
    previewKicker: "Most giftable format",
    items: [
      {
        id: "round-music-magnet",
        title: "Magnetify Music Round",
        size: "2.5 in",
        price: "Rs. 299 per piece",
        detail: "Photo plus Spotify, YouTube, Reel, or custom music link in a round layout.",
        href: "/shop/music-magnets#music-round",
        premium: true,
      },
      {
        id: "square-music-magnet",
        title: "Magnetify Music Square",
        size: "2 x 2 in",
        price: "Rs. 299 per piece",
        detail: "Square premium format with the same tap-to-play memory flow.",
        href: "/shop/music-magnets#music-square",
        premium: true,
      },
    ],
  },
  {
    slug: "accessories",
    navLabel: "Accessories",
    eyebrow: "Accessories",
    title: "Wearables and utility add-ons for events, gifting, and merchandise-style packs.",
    description:
      "This category combines lightweight event products and carryable keepsakes for customers who want more than standard magnets.",
    accentClass: "text-[#6f8c87]",
    panelClass: "border-[#c9ddd8] bg-[#eef7f5]",
    buttonClass: "bg-[#0e7466] hover:bg-charcoal",
    previewImage: "/photo-accessories-keychains-pins-bottle-openers-magnetify-studio.png",
    previewAlt: "Custom pins, keychains, and bottle openers arranged on a tabletop",
    previewKicker: "Perfect for events and giveaways",
    items: [
      {
        id: "plastic-pin-badges",
        title: "Magnetify Pin Badges",
        size: "Round 2.5 in",
        price: "Sets from Rs. 249",
        detail: "Custom button badges in plastic or metal for birthdays, event giveaways, merch, and branding kits.",
        href: "/shop/accessories/pin-badges",
      },
      {
        id: "custom-keychains",
        title: "Magnetify Keychain",
        size: "Round 2.5 in",
        price: "Sets from Rs. 179",
        detail: "A personal everyday-carry add-on for couples, families, and gift hampers.",
        href: "/shop/accessories/keychains",
      },
      {
        id: "bottle-opener",
        title: "Magnetify Bottle Opener",
        size: "2.5 in",
        price: "Sets from Rs. 299",
        detail: "Useful celebration-friendly product for parties, event favors, and gifting packs.",
        href: "/shop/accessories/bottle-opener",
      },
    ],
  },
  {
    slug: "ornaments",
    navLabel: "Ornaments",
    eyebrow: "Ornaments",
    title: "Decor-led pieces for festive gifting, keepsake moments, and premium add-on orders.",
    description:
      "A small but premium category that adds a festive, decorative angle to the Magnetify catalog.",
    accentClass: "text-gold",
    panelClass: "border-gold/20 bg-[#fff9ec]",
    buttonClass: "bg-gold hover:bg-orange",
    previewImage: "/crystal-ornaments-premium-gifting-magnetify-studio.png",
    previewAlt: "Crystal ornaments and premium keepsake gifts styled on a table",
    previewKicker: "Festive and premium",
    items: [
      {
        id: "crystal-ornaments",
        title: "Magnetify Ornaments",
        size: "2.5 in",
        price: "Rs. 399 per piece",
        detail: "Elegant ornament gifting for parents, partners, festive decor, and premium keepsakes.",
        href: "/shop/ornaments",
        premium: true,
      },
    ],
  },
  {
    slug: "frames-displays",
    navLabel: "Frames & Displays",
    eyebrow: "Frames & Displays",
    title: "Story-led frame formats for preserving multiple memories in one premium piece.",
    description:
      "This category is for customers who want a display product rather than a small single keepsake. Best for family storytelling and statement gifting.",
    accentClass: "text-pink",
    panelClass: "border-pink/18 bg-[#fff5f8]",
    buttonClass: "bg-pink hover:bg-orange",
    previewImage: "/family-photo-frame-display-gift-magnetify-studio.png",
    previewAlt: "Family photo frame and premium gift display",
    previewKicker: "Statement gifting format",
    items: [
      {
        id: "magnetify-frame",
        title: "Magnetify Heritage Grid",
        size: "12 square magnets + 1 frame",
        price: "Rs. 1499 per piece",
        detail: "A premium collage-style storytelling format for milestones, family memories, anniversaries, and luxury gifting.",
        href: "/shop/frames-displays",
        premium: true,
      },
    ],
  },
];

export function getShopCategory(slug: string) {
  return shopMainCategories.find((category) => category.slug === slug);
}

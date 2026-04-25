export type FaqItem = {
  category: string;
  question: string;
  answer: string;
};

export const faqs: readonly FaqItem[] = [
  {
    category: "Delivery & Timings",
    question: "How long does it take for my order to arrive?",
    answer:
      "Standard delivery usually takes 4-5 working days after dispatch. We ship across India from our Bangalore studio.",
  },
  {
    category: "Delivery & Timings",
    question: "Do you offer faster delivery in Bangalore?",
    answer:
      "Yes. For customers in Bangalore, we offer same-day or next-day delivery options when the order is placed before the daily cutoff time.",
  },
  {
    category: "Payments & Booking",
    question: "What is the payment process?",
    answer:
      "To keep production fast and seamless, we follow a full advance payment model. You can pay securely during checkout by scanning our UPI or GPay QR code. Once payment is confirmed, your order moves into the design and printing phase.",
  },
  {
    category: "Customization & Music Magnets",
    question: "How do I share my photos and song choices?",
    answer:
      "You can upload your photos directly on the product page. For Music Magnets, simply paste the Spotify or YouTube link in the provided text box. If you face any issues, you can also WhatsApp your files to us at +91 9370103844 with your Order ID.",
  },
  {
    category: "Studio Pickup",
    question: "Can I pick up my order from the Bangalore studio?",
    answer:
      "Absolutely. If you are based in Bangalore and want to save on shipping, select the Self-Pickup option at checkout. We will notify you on WhatsApp with the exact location and timing once your order is ready for collection.",
  },
  {
    category: "Events & Bulk Orders",
    question: "Do you handle large orders for weddings or corporate events?",
    answer:
      "Yes, we specialize in event favors. Whether it is a wedding, birthday, or corporate branding event, we offer special bulk pricing for orders above 50 units. Click the Book an Event button to chat with us for a custom quote.",
  },
  {
    category: "Product Quality & Care",
    question: "Are the magnets durable?",
    answer:
      "Our magnets feature a premium glossy finish that is waterproof and scratch-resistant. They are designed to stick firmly to metallic surfaces like fridges and cupboards, and they can be cleaned with a damp cloth without fading the print.",
  },
] as const;

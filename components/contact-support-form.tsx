"use client";

import type { ChangeEvent, ReactNode } from "react";
import { useState } from "react";
import { MailIcon } from "@/components/site-icons";

const careTopics = [
  { value: "order-help", label: "Help placing an order" },
  { value: "order-issue", label: "Order update or issue" },
  { value: "music-customization", label: "Music magnet customization" },
  { value: "events-bulk", label: "Events & bulk quote" },
  { value: "corporate-gifting", label: "Corporate gifting" },
  { value: "other", label: "Other" },
] as const;

const productOptions = [
  "Square Magnets",
  "Round Magnets",
  "Music Magnets",
  "Acrylic & Music",
  "Gifts & Displays",
  "Not sure yet",
] as const;

const eventTypes = [
  "Wedding",
  "Engagement",
  "Birthday",
  "Anniversary",
  "Corporate Event",
  "Other",
] as const;

const giftingTypes = [
  "Client Appreciation",
  "Employee Appreciation",
  "Event Giveaway",
  "Festive Gifts",
  "Launch Kits",
  "Other",
] as const;

const productChecklist = [
  "Square Magnets",
  "Round Magnets",
  "Music Magnets",
  "Acrylic Keepsakes",
  "Gift Boxes",
  "Need Recommendations",
] as const;

type TopicValue = (typeof careTopics)[number]["value"];

type ContactFormState = {
  topic: TopicValue;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  productType: string;
  city: string;
  orderId: string;
  requiredBy: string;
  quantity: string;
  songLink: string;
  message: string;
  eventType: string;
  eventDate: string;
  guestCount: string;
  venue: string;
  companyName: string;
  giftingType: string;
  budgetRange: string;
  brandingNotes: string;
  additionalComments: string;
  selectedProducts: string[];
  attachmentFiles: File[];
};

const initialState: ContactFormState = {
  topic: "order-help",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  productType: productOptions[0],
  city: "",
  orderId: "",
  requiredBy: "",
  quantity: "",
  songLink: "",
  message: "",
  eventType: eventTypes[0],
  eventDate: "",
  guestCount: "",
  venue: "",
  companyName: "",
  giftingType: giftingTypes[0],
  budgetRange: "",
  brandingNotes: "",
  additionalComments: "",
  selectedProducts: [],
  attachmentFiles: [],
};

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-charcoal">
      {children}
    </span>
  );
}

function UnderlineField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <div className="mt-2 border-b border-charcoal/55 pb-3">{children}</div>
    </label>
  );
}

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div>
      <h2 className="text-3xl tracking-[-0.04em] text-foreground sm:text-4xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-3 max-w-2xl text-base leading-8 text-muted">{subtitle}</p>
      ) : null}
    </div>
  );
}

function CheckboxGrid({
  label,
  values,
  selected,
  onToggle,
}: {
  label: string;
  values: readonly string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {values.map((value) => (
          <label key={value} className="flex items-center gap-3 text-sm text-foreground">
            <input
              type="checkbox"
              checked={selected.includes(value)}
              onChange={() => onToggle(value)}
              className="h-4 w-4 rounded border-charcoal/30 accent-pink"
            />
            <span>{value}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function UploadField({
  label,
  note,
  fileNames,
  inputKey,
  onChange,
}: {
  label: string;
  note: string;
  fileNames: string[];
  inputKey: number;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="mt-3">
        <input
          key={inputKey}
          type="file"
          name="attachment"
          multiple
          onChange={onChange}
          className="text-sm text-foreground file:mr-4 file:rounded-full file:border file:border-charcoal/15 file:bg-white file:px-4 file:py-2 file:text-sm file:font-semibold file:text-foreground"
        />
      </div>
      {fileNames.length > 0 ? (
        <p className="mt-3 text-sm text-muted">Selected: {fileNames.join(", ")}</p>
      ) : null}
      <p className="mt-2 text-sm leading-7 text-muted">{note}</p>
    </div>
  );
}

function getAttachmentNames(files: File[]) {
  return files.map((file) => file.name);
}

function buildMessage(form: ContactFormState) {
  const fullName = [form.firstName, form.lastName].filter(Boolean).join(" ");
  const attachmentNames = getAttachmentNames(form.attachmentFiles);

  if (form.topic === "events-bulk") {
    return [
      "Hi Magnetify Studio, I want an event / bulk quote.",
      "",
      `Name: ${fullName}`,
      `Email: ${form.email}`,
      `WhatsApp: ${form.phone}`,
      `Event Type: ${form.eventType}`,
      form.eventDate ? `Event Date: ${form.eventDate}` : null,
      form.guestCount ? `Estimated Guests / Quantity: ${form.guestCount}` : null,
      form.venue ? `City / Venue: ${form.venue}` : null,
      form.selectedProducts.length
        ? `Preferred Products: ${form.selectedProducts.join(", ")}`
        : null,
      attachmentNames.length
        ? `Reference Files: ${attachmentNames.join(", ")}`
        : null,
      "",
      `Additional Comments: ${form.additionalComments || "Not added"}`,
    ]
      .filter(Boolean)
      .join("\n");
  }

  if (form.topic === "corporate-gifting") {
    return [
      "Hi Magnetify Studio, I want a corporate gifting quote.",
      "",
      `Name: ${fullName}`,
      `Email: ${form.email}`,
      `Phone: ${form.phone}`,
      form.companyName ? `Company: ${form.companyName}` : null,
      `Type of Gifting: ${form.giftingType}`,
      form.requiredBy ? `Preferred Delivery Date: ${form.requiredBy}` : null,
      form.quantity ? `Estimated Quantity: ${form.quantity}` : null,
      form.budgetRange ? `Budget Range: ${form.budgetRange}` : null,
      form.selectedProducts.length
        ? `Preferred Categories: ${form.selectedProducts.join(", ")}`
        : null,
      form.brandingNotes ? `Branding / Packaging Notes: ${form.brandingNotes}` : null,
      attachmentNames.length
        ? `Reference Files: ${attachmentNames.join(", ")}`
        : null,
      "",
      `Additional Comments: ${form.additionalComments || "Not added"}`,
    ]
      .filter(Boolean)
      .join("\n");
  }

  if (form.topic === "other") {
    return [
      "Hi Magnetify Studio, I have a general support request.",
      "",
      `Name: ${fullName}`,
      `Email: ${form.email}`,
      `Message: ${form.message}`,
    ].join("\n");
  }

  return [
    "Hi Magnetify Studio, I need help with an order / customization request.",
    "",
    `Inquiry Topic: ${careTopics.find((topic) => topic.value === form.topic)?.label ?? form.topic}`,
    `Name: ${fullName}`,
    `Email: ${form.email}`,
    `WhatsApp: ${form.phone}`,
    `Product Type: ${form.productType}`,
    form.city ? `City / Delivery Area: ${form.city}` : null,
    form.orderId ? `Order ID: ${form.orderId}` : null,
    form.requiredBy ? `Need By Date: ${form.requiredBy}` : null,
    form.quantity ? `Pack Size / Quantity: ${form.quantity}` : null,
    form.songLink ? `Song Link: ${form.songLink}` : null,
    attachmentNames.length
      ? `Attachment Names: ${attachmentNames.join(", ")}`
      : null,
    "",
    `Message: ${form.message}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function ContactSupportForm() {
  const [form, setForm] = useState(initialState);
  const [fileInputKey] = useState(0);

  const topicLabel =
    careTopics.find((topic) => topic.value === form.topic)?.label ?? form.topic;
  const fullName = [form.firstName, form.lastName].filter(Boolean).join(" ");
  const attachmentNames = getAttachmentNames(form.attachmentFiles);
  const summary = buildMessage(form);

  const handleChange = (field: keyof ContactFormState, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    setForm((current) => ({
      ...current,
      attachmentFiles: files,
    }));
  };

  const handleToggleProduct = (value: string) => {
    setForm((current) => ({
      ...current,
      selectedProducts: current.selectedProducts.includes(value)
        ? current.selectedProducts.filter((item) => item !== value)
        : [...current.selectedProducts, value],
    }));
  };

  const isEventsForm = form.topic === "events-bulk";
  const isCorporateForm = form.topic === "corporate-gifting";
  const isOtherForm = form.topic === "other";
  const isMusicCustomization = form.topic === "music-customization";
  const isOrderIssue = form.topic === "order-issue";

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-[2.2rem] border border-[#f1ddd4] bg-[linear-gradient(135deg,#fff9f4_0%,#fff4fb_55%,#fff7f0_100%)] shadow-[0_28px_70px_rgba(26,26,27,0.06)]">
        <div className="px-6 py-12 text-center sm:px-8 lg:px-12 lg:py-14">
          <h1 className="text-5xl tracking-[-0.06em] text-foreground sm:text-6xl lg:text-[5rem] lg:leading-none">
            Contact Us
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-muted sm:text-lg">
            Tell us whether you need help with an order, a custom music magnet,
            or an event quote, and we will receive it directly on email.
          </p>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-6xl rounded-[2rem] border border-black/6 bg-white px-6 py-8 shadow-[0_24px_70px_rgba(26,26,27,0.06)] sm:px-8 lg:px-10 lg:py-10">
        <form
          action="https://formsubmit.co/magnetify.studio@gmail.com"
          method="POST"
          encType="multipart/form-data"
        >
          <input type="hidden" name="_subject" value={`Magnetify Contact | ${topicLabel}`} />
          <input type="hidden" name="_template" value="table" />
          <input type="hidden" name="_captcha" value="false" />
          <input type="hidden" name="_replyto" value={form.email} />
          <input type="hidden" name="full_name" value={fullName} />
          <input type="hidden" name="care_topic" value={topicLabel} />
          <input type="hidden" name="product_type" value={form.productType} />
          <input type="hidden" name="city_or_delivery_area" value={form.city} />
          <input type="hidden" name="order_id" value={form.orderId} />
          <input type="hidden" name="need_by_date" value={form.requiredBy} />
          <input type="hidden" name="pack_size_or_quantity" value={form.quantity} />
          <input type="hidden" name="song_link" value={form.songLink} />
          <input type="hidden" name="event_type" value={form.eventType} />
          <input type="hidden" name="event_date" value={form.eventDate} />
          <input type="hidden" name="estimated_guests_or_units" value={form.guestCount} />
          <input type="hidden" name="venue_or_city" value={form.venue} />
          <input type="hidden" name="company_name" value={form.companyName} />
          <input type="hidden" name="gifting_type" value={form.giftingType} />
          <input type="hidden" name="budget_range" value={form.budgetRange} />
          <input type="hidden" name="branding_notes" value={form.brandingNotes} />
          <input
            type="hidden"
            name="preferred_product_categories"
            value={form.selectedProducts.join(", ")}
          />
          <input
            type="hidden"
            name="attachment_names"
            value={attachmentNames.join(", ")}
          />
          <input type="hidden" name="request_summary" value={summary} />
          <UnderlineField label="Please Choose Care Topic">
            <select
              value={form.topic}
              onChange={(event) =>
                handleChange("topic", event.target.value as TopicValue)
              }
              className="w-full appearance-none bg-transparent text-lg text-foreground outline-none"
            >
              {careTopics.map((topic) => (
                <option key={topic.value} value={topic.value}>
                  {topic.label}
                </option>
              ))}
            </select>
          </UnderlineField>

          {isEventsForm ? (
            <div className="mt-10">
              <SectionTitle title="Custom Event Inquiry Form" />
              <div className="mt-8 grid gap-10 lg:grid-cols-2">
                <div>
                  <h3 className="text-2xl tracking-[-0.04em] text-foreground">
                    Contact Information
                  </h3>
                  <div className="mt-6 grid gap-6 sm:grid-cols-2">
                    <UnderlineField label="Name">
                      <input
                        required
                        type="text"
                        value={form.firstName}
                        onChange={(event) => handleChange("firstName", event.target.value)}
                        className="w-full bg-transparent text-lg text-foreground outline-none"
                      />
                    </UnderlineField>

                    <UnderlineField label="Email">
                      <input
                        required
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={(event) => handleChange("email", event.target.value)}
                        className="w-full bg-transparent text-lg text-foreground outline-none"
                      />
                    </UnderlineField>

                    <UnderlineField label="Phone Number">
                      <input
                        required
                        type="tel"
                        value={form.phone}
                        onChange={(event) => handleChange("phone", event.target.value)}
                        className="w-full bg-transparent text-lg text-foreground outline-none sm:col-span-2"
                      />
                    </UnderlineField>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl tracking-[-0.04em] text-foreground">
                    Details
                  </h3>
                  <div className="mt-6 grid gap-6 sm:grid-cols-2">
                    <UnderlineField label="Type of Event">
                      <select
                        value={form.eventType}
                        onChange={(event) => handleChange("eventType", event.target.value)}
                        className="w-full appearance-none bg-transparent text-lg text-foreground outline-none"
                      >
                        {eventTypes.map((eventType) => (
                          <option key={eventType} value={eventType}>
                            {eventType}
                          </option>
                        ))}
                      </select>
                    </UnderlineField>

                    <UnderlineField label="Date of Event">
                      <input
                        type="date"
                        value={form.eventDate}
                        onChange={(event) => handleChange("eventDate", event.target.value)}
                        className="w-full bg-transparent text-lg text-foreground outline-none"
                      />
                    </UnderlineField>

                    <UnderlineField label="Number of Guests / Units">
                      <input
                        type="text"
                        value={form.guestCount}
                        onChange={(event) => handleChange("guestCount", event.target.value)}
                        className="w-full bg-transparent text-lg text-foreground outline-none"
                      />
                    </UnderlineField>

                    <UnderlineField label="City / Venue">
                      <input
                        type="text"
                        value={form.venue}
                        onChange={(event) => handleChange("venue", event.target.value)}
                        className="w-full bg-transparent text-lg text-foreground outline-none"
                      />
                    </UnderlineField>
                  </div>

                  <div className="mt-8">
                    <CheckboxGrid
                      label="Preferred Product Categories"
                      values={productChecklist}
                      selected={form.selectedProducts}
                      onToggle={handleToggleProduct}
                    />
                  </div>

                  <div className="mt-8">
                    <UploadField
                      label="Photo References"
                      note="Attach inspiration images, invitation references, or sample artwork. Total upload size should stay under 10 MB."
                      fileNames={attachmentNames}
                      inputKey={fileInputKey}
                      onChange={handleFiles}
                    />
                  </div>

                  <div className="mt-8">
                    <FieldLabel>Additional Comments</FieldLabel>
                    <div className="mt-3 border border-[#efd79a] bg-[#fff0b7]/60 p-3">
                      <textarea
                        value={form.additionalComments}
                        onChange={(event) =>
                          handleChange("additionalComments", event.target.value)
                        }
                        rows={4}
                        className="w-full resize-none bg-transparent text-base leading-8 text-foreground outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : isCorporateForm ? (
            <div className="mt-10">
              <SectionTitle title="Corporate Gifting Inquiry Form" />
              <div className="mt-8 grid gap-10 lg:grid-cols-2">
                <div>
                  <h3 className="text-2xl tracking-[-0.04em] text-foreground">
                    Contact Information
                  </h3>
                  <div className="mt-6 grid gap-6 sm:grid-cols-2">
                    <UnderlineField label="First Name">
                      <input
                        required
                        type="text"
                        value={form.firstName}
                        onChange={(event) => handleChange("firstName", event.target.value)}
                        className="w-full bg-transparent text-lg text-foreground outline-none"
                      />
                    </UnderlineField>

                    <UnderlineField label="Last Name">
                      <input
                        type="text"
                        value={form.lastName}
                        onChange={(event) => handleChange("lastName", event.target.value)}
                        className="w-full bg-transparent text-lg text-foreground outline-none"
                      />
                    </UnderlineField>

                    <UnderlineField label="E-mail Address">
                      <input
                        required
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={(event) => handleChange("email", event.target.value)}
                        className="w-full bg-transparent text-lg text-foreground outline-none"
                      />
                    </UnderlineField>

                    <UnderlineField label="Phone Number">
                      <input
                        required
                        type="tel"
                        value={form.phone}
                        onChange={(event) => handleChange("phone", event.target.value)}
                        className="w-full bg-transparent text-lg text-foreground outline-none"
                      />
                    </UnderlineField>

                    <UnderlineField label="Company Name">
                      <input
                        type="text"
                        value={form.companyName}
                        onChange={(event) => handleChange("companyName", event.target.value)}
                        className="w-full bg-transparent text-lg text-foreground outline-none sm:col-span-2"
                      />
                    </UnderlineField>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl tracking-[-0.04em] text-foreground">
                    Gifting Details
                  </h3>
                  <div className="mt-6 grid gap-6 sm:grid-cols-2">
                    <UnderlineField label="Type of Gifting">
                      <select
                        value={form.giftingType}
                        onChange={(event) => handleChange("giftingType", event.target.value)}
                        className="w-full appearance-none bg-transparent text-lg text-foreground outline-none"
                      >
                        {giftingTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </UnderlineField>

                    <UnderlineField label="Estimated Quantity">
                      <input
                        type="text"
                        value={form.quantity}
                        onChange={(event) => handleChange("quantity", event.target.value)}
                        className="w-full bg-transparent text-lg text-foreground outline-none"
                      />
                    </UnderlineField>

                    <UnderlineField label="Preferred Delivery Date">
                      <input
                        type="date"
                        value={form.requiredBy}
                        onChange={(event) => handleChange("requiredBy", event.target.value)}
                        className="w-full bg-transparent text-lg text-foreground outline-none"
                      />
                    </UnderlineField>

                    <UnderlineField label="Budget Range">
                      <input
                        type="text"
                        value={form.budgetRange}
                        onChange={(event) => handleChange("budgetRange", event.target.value)}
                        placeholder="e.g. Rs. 90 - Rs. 250 per gift"
                        className="w-full bg-transparent text-lg text-foreground placeholder:text-muted/65 outline-none"
                      />
                    </UnderlineField>
                  </div>

                  <div className="mt-8">
                    <CheckboxGrid
                      label="Preferred Product Categories"
                      values={productChecklist}
                      selected={form.selectedProducts}
                      onToggle={handleToggleProduct}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <FieldLabel>Branding / Packaging Notes</FieldLabel>
                <div className="mt-3 border-b border-charcoal/55 pb-3">
                  <textarea
                    value={form.brandingNotes}
                    onChange={(event) => handleChange("brandingNotes", event.target.value)}
                    rows={4}
                    className="w-full resize-none bg-transparent text-base leading-8 text-foreground outline-none"
                  />
                </div>
              </div>

              <div className="mt-8">
                <UploadField
                  label="Photo References"
                  note="Attach logo references, packaging inspiration, or sample gifting layouts. Total upload size should stay under 10 MB."
                  fileNames={attachmentNames}
                  inputKey={fileInputKey}
                  onChange={handleFiles}
                />
              </div>

              <div className="mt-8">
                <FieldLabel>Additional Comments</FieldLabel>
                <div className="mt-3 border-b border-charcoal/55 pb-3">
                  <textarea
                    value={form.additionalComments}
                    onChange={(event) =>
                      handleChange("additionalComments", event.target.value)
                    }
                    rows={4}
                    className="w-full resize-none bg-transparent text-base leading-8 text-foreground outline-none"
                  />
                </div>
              </div>
            </div>
          ) : isOtherForm ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              <UnderlineField label="First Name">
                <input
                  required
                  type="text"
                  value={form.firstName}
                  onChange={(event) => handleChange("firstName", event.target.value)}
                  className="w-full bg-transparent text-lg text-foreground outline-none"
                />
              </UnderlineField>

              <UnderlineField label="Last Name">
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(event) => handleChange("lastName", event.target.value)}
                  className="w-full bg-transparent text-lg text-foreground outline-none"
                />
              </UnderlineField>

              <UnderlineField label="E-mail Address">
                <input
                  required
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={(event) => handleChange("email", event.target.value)}
                  className="w-full bg-transparent text-lg text-foreground outline-none"
                />
              </UnderlineField>

              <div className="sm:col-span-3">
                <FieldLabel>Message</FieldLabel>
                <div className="mt-3 border-b border-charcoal/55 pb-3">
                  <textarea
                    required
                    value={form.message}
                    onChange={(event) => handleChange("message", event.target.value)}
                    rows={4}
                    className="w-full resize-none bg-transparent text-base leading-8 text-foreground outline-none"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-8">
              <div className="grid gap-6 sm:grid-cols-3">
                <UnderlineField label="First Name">
                  <input
                    required
                    type="text"
                    value={form.firstName}
                    onChange={(event) => handleChange("firstName", event.target.value)}
                    className="w-full bg-transparent text-lg text-foreground outline-none"
                  />
                </UnderlineField>

                <UnderlineField label="Last Name">
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(event) => handleChange("lastName", event.target.value)}
                    className="w-full bg-transparent text-lg text-foreground outline-none"
                  />
                </UnderlineField>

                <UnderlineField label="E-mail Address">
                  <input
                    required
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={(event) => handleChange("email", event.target.value)}
                    className="w-full bg-transparent text-lg text-foreground outline-none"
                  />
                </UnderlineField>
              </div>

              <div className="mt-6 grid gap-6 sm:grid-cols-3">
                <UnderlineField label="Phone / WhatsApp Number">
                  <input
                    required
                    type="tel"
                    value={form.phone}
                    onChange={(event) => handleChange("phone", event.target.value)}
                    className="w-full bg-transparent text-lg text-foreground outline-none"
                  />
                </UnderlineField>

                <UnderlineField label="Product Type">
                  <select
                    value={form.productType}
                    onChange={(event) => handleChange("productType", event.target.value)}
                    className="w-full appearance-none bg-transparent text-lg text-foreground outline-none"
                  >
                    {productOptions.map((product) => (
                      <option key={product} value={product}>
                        {product}
                      </option>
                    ))}
                  </select>
                </UnderlineField>

                <UnderlineField label="Need By Date">
                  <input
                    type="date"
                    value={form.requiredBy}
                    onChange={(event) => handleChange("requiredBy", event.target.value)}
                    className="w-full bg-transparent text-lg text-foreground outline-none"
                  />
                </UnderlineField>
              </div>

              <div className="mt-6 grid gap-6 sm:grid-cols-3">
                <UnderlineField label="Pack Size / Quantity">
                  <input
                    type="text"
                    value={form.quantity}
                    onChange={(event) => handleChange("quantity", event.target.value)}
                    className="w-full bg-transparent text-lg text-foreground outline-none"
                  />
                </UnderlineField>

                <UnderlineField label="City / Delivery Area">
                  <input
                    type="text"
                    value={form.city}
                    onChange={(event) => handleChange("city", event.target.value)}
                    className="w-full bg-transparent text-lg text-foreground outline-none"
                  />
                </UnderlineField>

                {isOrderIssue ? (
                  <UnderlineField label="Order ID">
                    <input
                      type="text"
                      value={form.orderId}
                      onChange={(event) => handleChange("orderId", event.target.value)}
                      className="w-full bg-transparent text-lg text-foreground outline-none"
                    />
                  </UnderlineField>
                ) : (
                  <UnderlineField label={isMusicCustomization ? "Song Link" : "Order ID (Optional)"}>
                    <input
                      type="text"
                      value={isMusicCustomization ? form.songLink : form.orderId}
                      onChange={(event) =>
                        handleChange(
                          isMusicCustomization ? "songLink" : "orderId",
                          event.target.value,
                        )
                      }
                      className="w-full bg-transparent text-lg text-foreground outline-none"
                    />
                  </UnderlineField>
                )}
              </div>

              <div className="mt-8">
                <FieldLabel>Message</FieldLabel>
                <div className="mt-3 border-b border-charcoal/55 pb-3">
                  <textarea
                    required
                    value={form.message}
                    onChange={(event) => handleChange("message", event.target.value)}
                    rows={4}
                    className="w-full resize-none bg-transparent text-base leading-8 text-foreground outline-none"
                  />
                </div>
              </div>

              <div className="mt-8">
                <UploadField
                  label="Attachments (receipts, screenshots, product photos)"
                  note="Attach payment screenshots, order references, or inspiration images. Total upload size should stay under 10 MB."
                  fileNames={attachmentNames}
                  inputKey={fileInputKey}
                  onChange={handleFiles}
                />
              </div>
            </div>
          )}

          <div className="mt-10 flex justify-center">
            <button
              type="submit"
              className="inline-flex min-w-[180px] items-center justify-center gap-2 rounded-2xl border border-charcoal/55 bg-white px-8 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-foreground hover:-translate-y-0.5 hover:bg-[#fff9f5]"
            >
              <MailIcon className="size-4" />
              <span>Submit</span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}


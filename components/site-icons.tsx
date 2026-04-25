import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function UserIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        d="M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM4.5 20a7.5 7.5 0 0 1 15 0"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
      />
    </svg>
  );
}

export function CartIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        d="M3 4h2l2.2 10.2a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.76L20 7H7"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
      />
      <circle cx="10" cy="19" r="1.2" fill="currentColor" />
      <circle cx="17" cy="19" r="1.2" fill="currentColor" />
    </svg>
  );
}

export function UploadIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        d="M12 16V7m0 0-3 3m3-3 3 3M5 16.5v1A1.5 1.5 0 0 0 6.5 19h11a1.5 1.5 0 0 0 1.5-1.5v-1"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
      />
      <rect
        x="3.5"
        y="4"
        width="17"
        height="16"
        rx="3"
        strokeWidth={1.5}
      />
    </svg>
  );
}

export function ShapeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <circle cx="7.5" cy="8" r="3.5" strokeWidth={1.8} />
      <rect
        x="12.5"
        y="4.5"
        width="7"
        height="7"
        rx="1.5"
        strokeWidth={1.8}
      />
      <path
        d="M4 18h16"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
      />
    </svg>
  );
}

export function PaymentIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5v-9Z"
        strokeWidth={1.8}
      />
      <path
        d="M7 9.5h10M7 13h4"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
      />
      <rect
        x="14.5"
        y="11.5"
        width="3"
        height="3"
        rx=".6"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

export function WhatsAppIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        d="M20 11.6A8 8 0 0 1 8.2 18.9L4 20l1.2-4.1A8 8 0 1 1 20 11.6Z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
      />
      <path
        d="M9.4 8.9c.3-.6.7-.6 1-.5.1 0 .3.1.4.4l.8 1.8c.1.2.1.5-.1.7l-.5.6c-.1.1-.1.3 0 .4.5 1 1.2 1.7 2.2 2.2.1.1.3.1.4 0l.6-.5c.2-.2.5-.2.7-.1l1.8.8c.3.1.4.3.4.4.1.3.1.7-.5 1-.4.2-1.3.4-3.1-.4a8.1 8.1 0 0 1-4.1-4.1c-.8-1.8-.6-2.7-.4-3.1Z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <rect
        x="4"
        y="4"
        width="16"
        height="16"
        rx="5"
        strokeWidth={1.8}
      />
      <circle cx="12" cy="12" r="3.5" strokeWidth={1.8} />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function YouTubeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        d="M21 12c0 2.3-.2 3.8-.4 4.6a3 3 0 0 1-2 2C17.8 19 15.5 19 12 19s-5.8 0-6.6-.4a3 3 0 0 1-2-2C3.2 15.8 3 14.3 3 12s.2-3.8.4-4.6a3 3 0 0 1 2-2C6.2 5 8.5 5 12 5s5.8 0 6.6.4a3 3 0 0 1 2 2c.2.8.4 2.3.4 4.6Z"
        strokeWidth={1.8}
      />
      <path
        d="m10 9 5 3-5 3V9Z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

export function FacebookIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        d="M14 8h2.5V4.8H14c-2.4 0-4 1.6-4 4v2.2H7.5v3.2H10V20h3.5v-5.8h2.6l.4-3.2h-3V9.2c0-.8.3-1.2 1.5-1.2Z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

export function PinterestIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        d="M12 4.5c-4 0-6.5 2.8-6.5 6 0 2.3 1.2 4.3 3.1 5.1.2.1.3 0 .3-.2l.5-1.9c0-.2 0-.3-.2-.5-.5-.6-.9-1.5-.9-2.6 0-2.5 1.9-4.9 5.3-4.9 2.9 0 4.5 1.8 4.5 4.1 0 3.1-1.4 5.7-3.4 5.7-1.1 0-2-1-1.7-2.2.3-1.4.9-2.9.9-3.9 0-.9-.5-1.6-1.5-1.6-1.2 0-2.1 1.2-2.1 2.8 0 1 .3 1.7.3 1.7l-1.2 5.2c-.2.9 0 2.2.1 2.8.1.2.3.2.4.1.1-.1 1.2-1.5 1.5-2.4l.6-2.4c.3.6 1.3 1.1 2.3 1.1 3 0 5.1-2.8 5.1-6.4 0-2.8-2.4-5.3-6-5.3Z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

export function ThreadsIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        d="M15.5 10.1c-.4-2.3-2-3.6-4.4-3.6-2.8 0-4.8 1.8-4.8 4.4 0 2.6 1.9 4.5 4.6 4.5 2.1 0 3.7-1 4.2-2.8.3-1 .2-2-.2-2.8m-3.8.6c1.9.1 3.4.5 4.3 1.1 1.2.8 1.8 2 1.8 3.5 0 2.7-2.2 4.5-5.5 4.5-3.8 0-6.2-2.3-6.2-6.2 0-3.7 2.3-6 5.9-6 3.4 0 5.7 1.8 6.1 4.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
      />
    </svg>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <rect
        x="3.5"
        y="5.5"
        width="17"
        height="13"
        rx="2.5"
        strokeWidth={1.8}
      />
      <path
        d="m5.5 8 6.5 5 6.5-5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
      />
    </svg>
  );
}

export function MapPinIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        d="M12 20s6-4.7 6-10a6 6 0 1 0-12 0c0 5.3 6 10 6 10Z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
      />
      <circle cx="12" cy="10" r="2.2" strokeWidth={1.8} />
    </svg>
  );
}

export function ShieldCheckIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        d="M12 3.5 5.5 6v5.3c0 4.2 2.7 8 6.5 9.2 3.8-1.2 6.5-5 6.5-9.2V6L12 3.5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
      />
      <path
        d="m9.3 12.2 1.8 1.8 3.8-4"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
      />
    </svg>
  );
}

export function IndiaFlagIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M5 4.5v15" stroke="currentColor" strokeWidth={1.8} />
      <path d="M6 5h11l-1.8 3L17 11H6V5Z" fill="#ffffff" />
      <path d="M6 5h11l-1 1.7H6V5Z" fill="#ff8c37" />
      <path d="M6 9.3H17V11H6V9.3Z" fill="#138808" />
      <circle cx="11.8" cy="8.1" r="1.1" fill="#2b55a1" />
    </svg>
  );
}

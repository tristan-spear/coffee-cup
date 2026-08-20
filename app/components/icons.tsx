type IconProps = {
  className?: string;
};

export function Heart({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 20s-7.2-4.35-7.2-10.1A4.15 4.15 0 0 1 12 7.4a4.15 4.15 0 0 1 7.2 2.5C19.2 15.65 12 20 12 20Z" />
    </svg>
  );
}

export function PersonIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="32" cy="32" r="28" />
      <circle cx="32" cy="24" r="9" />
      <path d="M16 48c3.5-9 10-13 16-13s12.5 4 16 13" />
    </svg>
  );
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="10" y="14" width="44" height="40" rx="4" />
      <path d="M10 26h44M22 10v10M42 10v10" />
      <path d="M20 36h6M29 36h6M38 36h6M20 44h6M29 44h6" />
    </svg>
  );
}

export function CheckCircleIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="32" cy="32" r="28" />
      <path d="M20 33l8 8 16-18" />
    </svg>
  );
}

export function LinkIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M28 36l8-8" />
      <path d="M26 42c-4-4-4-10 0-14l6-6c4-4 10-4 14 0s4 10 0 14l-3 3" />
      <path d="M38 22c4 4 4 10 0 14l-6 6c-4 4-10 4-14 0s-4-10 0-14l3-3" />
    </svg>
  );
}

export function GoogleGIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="32" cy="32" r="22" />
      <path d="M34 22c-7 0-12 5-12 12s5 12 12 12c5.5 0 10-3.5 11.5-8.5H34v-7h18" />
    </svg>
  );
}

export function ShieldLockIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M32 8l20 8v14c0 14-8 22-20 26C20 52 12 44 12 30V16l20-8Z" />
      <rect x="26" y="28" width="12" height="10" rx="2" />
      <path d="M29 28v-3a3 3 0 0 1 6 0v3" />
    </svg>
  );
}

export function ArrowRight({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 12h36M32 5l8 7-8 7" />
    </svg>
  );
}

export function LockIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3.5" y="7" width="9" height="7" rx="1.2" />
      <path d="M5.5 7V5.2a2.5 2.5 0 0 1 5 0V7" />
    </svg>
  );
}

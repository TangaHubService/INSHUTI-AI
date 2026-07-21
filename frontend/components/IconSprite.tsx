// SVG icon sprite, ported from the design prototype ( test-g/index.html) as
// real JSX. Render once in the root layout; <use href="#i-x"> then works
// from any page since SVG symbol references resolve against the whole DOM.
export function IconSprite() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        <symbol id="i-droplet" viewBox="0 0 24 24">
          <path
            d="M12 3s6 7.2 6 11.2A6 6 0 1 1 6 14.2C6 10.2 12 3 12 3Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </symbol>
        <symbol id="i-baby" viewBox="0 0 24 24">
          <circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path
            d="M6 21c0-4 2.5-6.5 6-6.5s6 2.5 6 6.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </symbol>
        <symbol id="i-heart" viewBox="0 0 24 24">
          <path
            d="M12 20s-7.5-4.6-9.5-9.3C1.2 7.3 3 4 6.4 4c2 0 3.4 1 5.6 3.3C14.2 5 15.6 4 17.6 4 21 4 22.8 7.3 21.5 10.7 19.5 15.4 12 20 12 20Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </symbol>
        <symbol id="i-pill" viewBox="0 0 24 24">
          <rect x="3" y="9" width="18" height="6" rx="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <line x1="12" y1="9" x2="12" y2="15" stroke="currentColor" strokeWidth="1.8" />
        </symbol>
        <symbol id="i-shield" viewBox="0 0 24 24">
          <path
            d="M12 3l7 3v5.5c0 4.7-3 7.9-7 9.5-4-1.6-7-4.8-7-9.5V6l7-3Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </symbol>
        <symbol id="i-user-check" viewBox="0 0 24 24">
          <circle cx="10" cy="8" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
          <path d="M4 20c0-3.6 2.7-6 6-6s6 2.4 6 6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M16 12.5l2 2 3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        <symbol id="i-stethoscope" viewBox="0 0 24 24">
          <path
            d="M6 3v6a4 4 0 0 0 8 0V3M6 4.5h-1.5M14 4.5h1.5M10 13v3a4 4 0 0 0 8 0v-1.3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <circle cx="19" cy="16.5" r="2" fill="none" stroke="currentColor" strokeWidth="1.7" />
        </symbol>
        <symbol id="i-mind" viewBox="0 0 24 24">
          <path
            d="M9 3a5 5 0 0 0-5 5c0 1.3.5 2.3 1.2 3.2C4.5 12 4 13 4 14.3 4 16.9 6 19 8.5 19H9v2h6v-2.3c1.7-.8 3-2.6 3-4.7 0-1.3-.5-2.3-1.2-3.2.7-.9 1.2-1.9 1.2-3.2A5 5 0 0 0 13 3c-.8 0-1.5.2-2 .5-.5-.3-1.2-.5-2-.5Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </symbol>
        <symbol id="i-plus" viewBox="0 0 24 24">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </symbol>
        <symbol id="i-bot" viewBox="0 0 24 24">
          <rect x="4" y="7" width="16" height="12" rx="4" fill="none" stroke="currentColor" strokeWidth="1.7" />
          <path d="M12 3v4M8 13h.01M16 13h.01" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </symbol>
        <symbol id="i-lock" viewBox="0 0 24 24">
          <rect x="5" y="10" width="14" height="10" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" strokeWidth="1.7" />
        </symbol>
        <symbol id="i-eye" viewBox="0 0 24 24">
          <path
            d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.7" />
        </symbol>
        <symbol id="i-eye-off" viewBox="0 0 24 24">
          <path
            d="M3.5 3.5l17 17M9.9 5.7A10.7 10.7 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a15.6 15.6 0 0 1-3.3 4.1M6.6 6.9A15.9 15.9 0 0 0 2.5 12S6 18.5 12 18.5a10.6 10.6 0 0 0 3.2-.5M14.6 14.6a3 3 0 0 1-4.2-4.2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </symbol>
        <symbol id="i-globe" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
          <path
            d="M3.5 12h17M12 3.5c2.5 2.5 2.5 14.5 0 17M12 3.5c-2.5 2.5-2.5 14.5 0 17"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </symbol>
        <symbol id="i-book" viewBox="0 0 24 24">
          <path
            d="M4 5.5A2.5 2.5 0 0 1 6.5 3H12v18H6.5A2.5 2.5 0 0 1 4 18.5v-13Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M20 5.5A2.5 2.5 0 0 0 17.5 3H12v18h5.5a2.5 2.5 0 0 0 2.5-2.5v-13Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </symbol>
        <symbol id="i-arrow" viewBox="0 0 24 24">
          <path
            d="M5 12h14M13 6l6 6-6 6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </symbol>
        <symbol id="i-back" viewBox="0 0 24 24">
          <path
            d="M19 12H5M11 6l-6 6 6 6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </symbol>
        <symbol id="i-send" viewBox="0 0 24 24">
          <path d="M4 20l17-8L4 4l2 8-2 8Z" fill="#fff" />
        </symbol>
        <symbol id="i-grid" viewBox="0 0 24 24">
          <rect x="3" y="3" width="8" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <rect x="13" y="3" width="8" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <rect x="3" y="13" width="8" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <rect x="13" y="13" width="8" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </symbol>
        <symbol id="i-chat" viewBox="0 0 24 24">
          <path
            d="M4 5h16v11H9l-4 4V5Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </symbol>
        <symbol id="i-flag" viewBox="0 0 24 24">
          <path
            d="M6 3v18M6 4h11l-2.5 3.5L17 11H6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </symbol>
        <symbol id="i-users" viewBox="0 0 24 24">
          <circle cx="9" cy="8" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="17" cy="9" r="2.4" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M15.5 14c2.7.3 4.5 2 4.5 5" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </symbol>
        <symbol id="i-gear" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="M12 3v2.2M12 18.8V21M21 12h-2.2M5.2 12H3M18 6l-1.5 1.5M7.5 16.5 6 18M18 18l-1.5-1.5M7.5 7.5 6 6"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </symbol>
        <symbol id="i-bell" viewBox="0 0 24 24">
          <path
            d="M6 10a6 6 0 0 1 12 0c0 4 1.5 5 1.5 5h-15S6 14 6 10Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M10 19a2 2 0 0 0 4 0" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </symbol>
        <symbol id="i-search" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M20 20l-4.3-4.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </symbol>
        <symbol id="i-logout" viewBox="0 0 24 24">
          <path
            d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </symbol>
        <symbol id="i-edit" viewBox="0 0 24 24">
          <path
            d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </symbol>
        <symbol id="i-check" viewBox="0 0 24 24">
          <path
            d="M5 12l5 5 9-10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </symbol>
        <symbol id="i-clock" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
          <path
            d="M12 7.5V12l3 2"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </symbol>
        <symbol id="i-sparkle" viewBox="0 0 24 24">
          <path
            d="M12 3l1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
        </symbol>
        <symbol id="i-trash" viewBox="0 0 24 24">
          <path
            d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-9 0 1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </symbol>

        {/* signature "friendship knot": two interlocking speech bubbles */}
        <symbol id="i-map-pin" viewBox="0 0 24 24">
          <path
            d="M12 21s7-6.3 7-11.5A7 7 0 0 0 5 9.5C5 14.7 12 21 12 21Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="9.5" r="2.4" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </symbol>
        <symbol id="i-building" viewBox="0 0 24 24">
          <rect x="4" y="3" width="11" height="18" rx="1" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="M15 9h5v12h-5M7.5 7h2M7.5 11h2M7.5 15h2"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </symbol>
        <symbol id="i-filter" viewBox="0 0 24 24">
          <path
            d="M4 5h16l-6 7v6l-4 2v-8L4 5Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </symbol>
        <symbol id="i-phone" viewBox="0 0 24 24">
          <path
            d="M6 3h4l1.5 4.5-2 1.5a12 12 0 0 0 5.5 5.5l1.5-2L21 14v4a2 2 0 0 1-2 2C11.5 20 4 12.5 4 5a2 2 0 0 1 2-2Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </symbol>

        <symbol id="mark-knot" viewBox="0 0 64 64">
          <path
            d="M14 12c-8 0-13 6-13 13 0 5 2.5 8.8 6.5 11L6 44l9-3.4c1.3.3 2.7.4 4 .3 8-.5 12-6.5 12-13 0-7-6.5-16-17-16Z"
            fill="var(--coral, #E8735C)"
          />
          <path
            d="M50 20c8 0 13 6 13 13 0 5-2.5 8.8-6.5 11L58 52l-9-3.4c-1.3.3-2.7.4-4 .3-8-.5-12-6.5-12-13 0-7 6.5-16 17-16Z"
            fill="var(--teal-700, #146661)"
          />
        </symbol>
      </defs>
    </svg>
  );
}

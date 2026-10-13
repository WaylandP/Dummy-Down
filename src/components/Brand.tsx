export function Brand() {
  return (
    <a href="#top" className="brand" aria-label="Dummy-Down home">
      <span className="brand-mark">
        <svg
          viewBox="0 0 40 40"
          width="34"
          height="34"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 27C4 14 11 5 23 5c9 0 13 5 13 13 0 11-8 17-20 17M9 27C9 17 14 10 23 10c6 0 8 4 8 8 0 8-6 12-15 12M14 25c0-6 3-10 8-10 4 0 5 2 5 5 0 4-3 6-8 6"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span>
        Dummy<span className="brand-hyphen">-</span>Down
      </span>
    </a>
  )
}

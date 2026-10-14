/** Illustration of a fictional policy, never a quotation of a CMMC requirement. */
export function DecodeDiagram() {
  return (
    <figure className="decode-diagram" aria-labelledby="decode-caption">
      <ol className="chalk-flow" role="list">
        <li className="chalk-step">
          <p className="chalk-note">
            What does <br />
            the rule say?
          </p>
          <NoteArrow />
          <div className="chalk-frame">
            <Frame />
            <svg
              className="chalk-icon"
              viewBox="0 0 100 90"
              fill="none"
              aria-hidden="true"
            >
              <path d="M27 13 72 10 75 74 25 76Z M37 29 60 28 M37 42 63 41 M37 56 59 56" />
            </svg>
            <span>Requirement</span>
          </div>
          <p className="chalk-example">
            “Keep our logs <br />
            for 90 days.”
          </p>
          <FlowArrow />
        </li>
        <li className="chalk-step">
          <p className="chalk-note">
            What is it <br />
            actually for?
          </p>
          <NoteArrow />
          <div className="chalk-frame">
            <Frame />
            <svg
              className="chalk-icon"
              viewBox="0 0 100 90"
              fill="none"
              aria-hidden="true"
            >
              <path d="M43 64C43 50 31 49 31 35 30 9 70 10 69 35 69 49 57 52 57 64Z M43 70H56 M45 76H54 M50 63V40L42 34 M50 40 57 32 M50 2V8 M19 12 24 18 M12 34H20 M76 17 82 11 M79 35H88" />
            </svg>
            <span>Meaning</span>
          </div>
          <p className="chalk-example chalk-circle">
            Keep evidence <br />
            so we can investigate <br />
            what happened.
          </p>
          <FlowArrow />
        </li>
        <li className="chalk-step">
          <p className="chalk-note">
            How does this <br />
            look in practice?
          </p>
          <NoteArrow />
          <div className="chalk-frame">
            <Frame />
            <svg
              className="chalk-icon"
              viewBox="0 0 100 90"
              fill="none"
              aria-hidden="true"
            >
              <path d="m39 8 10 2 1 8 7 4 8-2 5 8-6 6 1 8 7 5-3 9-9-1-6 5-1 8-10 1-3-8-7-4-8 3-6-8 5-7-1-8-7-4 4-10 8 1 7-5Z" />
              <path d="M52 36a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z m27 17 6 2-1 6 5 5-3 6-6-1-5 4-6-3 1-7-4-5 4-6 5 1Z M81 65a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z" />
            </svg>
            <span>Real life</span>
          </div>
          <p className="chalk-example chalk-underline">
            Your logs still exist <br />
            when you need to <br />
            find out what happened.
          </p>
        </li>
      </ol>
      <figcaption id="decode-caption">
        A fictional policy example — not an official requirement.
      </figcaption>
    </figure>
  )
}

function Frame() {
  return (
    <svg
      className="chalk-frame-line"
      viewBox="0 0 190 145"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
    >
      <path d="M5 5 185 2 187 139 3 143Z M7 7 183 5 M6 140 185 138" />
    </svg>
  )
}

function NoteArrow() {
  return (
    <svg
      className="chalk-note-arrow"
      viewBox="0 0 50 48"
      fill="none"
      aria-hidden="true"
    >
      <path d="M21 3C20 18 24 28 31 40 M17 31 32 42 37 26" />
    </svg>
  )
}

function FlowArrow() {
  return (
    <svg
      className="chalk-flow-arrow"
      viewBox="0 0 50 30"
      fill="none"
      aria-hidden="true"
    >
      <path d="M3 17 43 14 M31 4 46 14 32 26" />
    </svg>
  )
}

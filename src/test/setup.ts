import '@testing-library/jest-dom/vitest'
import { cleanup, configure } from '@testing-library/react'
import { afterEach } from 'vitest'

// The dust of an erased control is a copy of its markup, inert and hidden from
// assistive technology for 400 ms; role queries already skip it, and text
// queries treat it like a script or style element rather than page content.
configure({ defaultIgnore: 'script, style, .erase-dust, .erase-dust *' })

afterEach(cleanup)

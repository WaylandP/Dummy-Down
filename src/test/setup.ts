import '@testing-library/jest-dom/vitest'
import { cleanup, configure } from '@testing-library/react'
import { afterEach } from 'vitest'

// Most pages are lazy chunks, and under a full run (or beside another suite on
// the same cores) their first mount can take more than the library's one-second
// wait; five seconds keeps findBy* and waitFor from timing out on a slow
// machine without changing what any test asserts.
configure({ asyncUtilTimeout: 5000 })

afterEach(cleanup)

import type { GlossaryTerm } from '../types/content'
import { projectReadmeSource } from './sources'
import { levelOneGlossaryTerms } from './level-one-glossary'

const glossaryContext =
  'Project glossary for the authorized-access teaching example. These plain-language explanations are not official definitions or complete requirements.'

/** Preserve the existing teaching vocabulary and its stable identifiers. */
const projectGlossaryTerms: readonly GlossaryTerm[] = [
  {
    id: 'access-review',
    title: 'Access review',
    definition:
      'A check of who or what can use a system, and whether that access is still appropriate. For example, a team might look for an account that still has access after someone changes jobs.',
    reviewStatus: 'draft',
    versionContext: glossaryContext,
    sources: [projectReadmeSource],
  },
  {
    id: 'account',
    title: 'Account',
    definition:
      'A record a system uses to recognize a person or a service and connect it to permissions. A username is a familiar part of an account; the account also helps determine what its holder can do.',
    reviewStatus: 'draft',
    versionContext: glossaryContext,
    sources: [projectReadmeSource],
  },
  {
    id: 'authorized-user',
    title: 'Authorized user',
    definition:
      'A person who has been given permission to use a system or resource. Having a working login does not, by itself, show that the person’s access has been approved or is still appropriate.',
    reviewStatus: 'draft',
    versionContext: glossaryContext,
    sources: [projectReadmeSource],
  },
  {
    id: 'device',
    title: 'Device',
    definition:
      'A piece of equipment that can connect to or use a system, such as a laptop or phone. In the README example, the company decides which devices may access its resources.',
    reviewStatus: 'draft',
    versionContext: glossaryContext,
    sources: [projectReadmeSource],
  },
  {
    id: 'offboarding',
    title: 'Offboarding',
    definition:
      'The steps a company takes when someone leaves or no longer needs their current access. Removing or changing system access is one part of that process, like collecting a building key.',
    reviewStatus: 'draft',
    versionContext: glossaryContext,
    sources: [projectReadmeSource],
  },
  {
    id: 'process',
    title: 'Process',
    definition:
      'A running program or task on a computer. In the authorized-access example, a process may act on behalf of a user, such as an application retrieving a file with that user’s permissions.',
    reviewStatus: 'draft',
    versionContext: glossaryContext,
    sources: [projectReadmeSource],
  },
]

/** Versioned educational vocabulary; publication does not imply expert review. */
export const glossaryTerms: readonly GlossaryTerm[] = [
  ...projectGlossaryTerms,
  ...levelOneGlossaryTerms,
]

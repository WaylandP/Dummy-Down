import type { LearningActivity } from '../types/learning'

/** Source-bound fictional drafts; qualified review remains pending. */
export const expandedLearningActivities = [
  {
    id: 'level-one-permitted-actions',
    lesson: {
      frameworkId: 'cmmc',
      editionId: 'cmmc-2-13-sep-2024',
      controlKey: 'ac-l1-b-1-ii',
    },
    reviewStatus: 'draft',
    contentVersion: '2026-10-14.1',
    title: 'Practice: a login is not permission to edit',
    learningObjective:
      'Distinguish permission to access a system from permission to perform particular actions, then connect defined actions to enforced restrictions.',
    introduction:
      'Work through a fictional contract workspace in which one person may read records and another may update them.',
    plainEnglish:
      'Being allowed into a system does not mean being allowed to do everything inside it. Define each authorized user’s permitted transactions and functions—actions such as reading, creating, changing, or deleting records—and limit system access to those actions.',
    commonMisunderstanding: {
      claim: '“If I can sign in, I can use every button I find.”',
      correction:
        'A successful sign-in does not establish permission for every transaction or function. The defined permissions and actual system restrictions must match.',
    },
    scenarioTitle: 'Two roles, one contract workspace',
    scenario: [
      {
        id: 'define-actions',
        title: 'Define the permitted actions',
        description:
          'Fictional Harbor Workshop handles Federal Contract Information (FCI). Robin’s reviewer role may read contract records; Lena’s coordinator role may create and update them. The team records these role choices.',
      },
      {
        id: 'apply-restrictions',
        title: 'Make the workspace follow those choices',
        description:
          'IT configures the workspace so Robin can read but cannot create, update, or delete these records. Lena’s allowed actions reflect her separately defined role.',
      },
      {
        id: 'test-actions',
        title: 'Check what the system actually allows',
        description:
          'In a test workspace with fictional records, the team checks both permitted and restricted actions. A hidden edit button alone would not settle whether a direct edit request is blocked.',
      },
    ],
    questions: [
      {
        id: 'reader-edit-blocked',
        prompt:
          'Robin can sign in and read a record. The coordinator role is the only role permitted to update it. What should happen when Robin attempts an update?',
        correctChoiceId: 'block-update',
        choices: [
          {
            id: 'allow-signed-in',
            label: 'Allow the update because Robin is an authorized user.',
            feedback:
              'Authorization to enter the system is not authorization for every action. Robin’s defined role permits reading, so the update needs to be restricted.',
          },
          {
            id: 'block-update',
            label:
              'Restrict the update while preserving Robin’s permitted reading access.',
            feedback:
              'That connects the defined permitted functions to actual system limits. This requirement concerns what an authorized user may do, not just whether a login works.',
          },
          {
            id: 'remove-all-access',
            label:
              'Remove Robin’s reading access too, because updating is restricted.',
            feedback:
              'The restriction concerns an action Robin is not permitted to perform. It does not require removing a separately permitted reading function.',
          },
        ],
      },
      {
        id: 'hidden-button-not-enforcement',
        prompt:
          'The edit button is hidden, but a direct request still changes the record using Robin’s account. What does this reveal?',
        correctChoiceId: 'restriction-gap',
        choices: [
          {
            id: 'interface-sufficient',
            label: 'The restriction works because the button is hidden.',
            feedback:
              'Hiding a button changes the interface, but the underlying system still permits the restricted action. The actual access limit must enforce the defined permission.',
          },
          {
            id: 'all-permissions-invalid',
            label: 'No role-based permissions can work in this workspace.',
            feedback:
              'The observation identifies an enforcement gap in this path. It does not establish that every permission or every role is invalid.',
          },
          {
            id: 'restriction-gap',
            label:
              'The defined update restriction is not enforced on that request path.',
            feedback:
              'The test shows that Robin can perform an action outside the defined permissions. The team needs to address that enforcement gap; a particular product is not prescribed here.',
          },
        ],
      },
      {
        id: 'define-then-limit-actions',
        prompt: 'Which approach best captures the two source determinations?',
        correctChoiceId: 'define-and-limit',
        choices: [
          {
            id: 'define-and-limit',
            label:
              'Define permitted actions, then make system access follow those definitions.',
            feedback:
              'The source separately asks whether permitted transactions/functions are defined and whether system access is limited accordingly. Both matter.',
          },
          {
            id: 'write-only',
            label: 'Write a role description and leave all actions enabled.',
            feedback:
              'That may help describe permissions, but it omits the determination about limiting actual system access to those defined functions.',
          },
          {
            id: 'copy-everyone',
            label: 'Give every approved employee the same full-control role.',
            feedback:
              'Approved employees can have different responsibilities. Universal full control does not follow from their being authorized users.',
          },
        ],
      },
    ],
    glossaryTermIds: [
      'authorization',
      'authorized-user',
      'fci',
      'information-system',
    ],
    disclaimer:
      'A fictional practice activity written from the September 2024 CMMC v2.13 snapshot. It illustrates selected ideas; it is not an assessment checklist, a compliance score, or a measure of assessment readiness. No real organizational information, evidence, credentials or CUI is needed.',
    teachingSource: {
      id: 'cmmc-assessment-l1-213-page-19',
      title: 'CMMC Assessment Guide – Level 1',
      url: 'https://dodcio.defense.gov/Portals/0/Documents/CMMC/AssessmentGuideL1v2.pdf#page=19',
      kind: 'official-publication',
      versionContext:
        'Version 2.13 · September 2024; PDF page 19 (printed page 15). Source text checked against a hash-pinned public PDF mirror; current official-host bytes and applicability have not been verified.',
    },
  },
  {
    id: 'level-one-visitors-and-keys',
    lesson: {
      frameworkId: 'cmmc',
      editionId: 'cmmc-2-13-sep-2024',
      controlKey: 'pe-l1-b-1-ix',
    },
    reviewStatus: 'draft',
    contentVersion: '2026-10-14.1',
    title: 'Practice: visitors, access records, and keys',
    learningObjective:
      'Recognize that visitor escorting/monitoring, retained physical-access records, and controlled/managed access devices are distinct responsibilities.',
    introduction:
      'Follow a fictional workshop’s visitor arrival and the return of a departing worker’s keys.',
    plainEnglish:
      'Escort visitors and monitor their activity. Maintain physical-access records, and identify, control, and manage devices such as keys and badges. A visitor badge or a locked door alone does not perform all of these jobs.',
    commonMisunderstanding: {
      claim: '“A familiar visitor with a badge can walk around alone.”',
      correction:
        'Familiarity and a badge do not replace escorting and monitoring a visitor. This scenario’s guest has no permanent physical-access authorization; the guide excludes people with permanent physical-access authorization credentials from its visitor category.',
    },
    scenarioTitle: 'A returning supplier and a returned key',
    scenario: [
      {
        id: 'visitor-arrives',
        title: 'Welcome a visitor',
        description:
          'A supplier visits Harbor’s area containing systems that handle FCI. The supplier has no permanent physical-access authorization. An assigned employee escorts the supplier and monitors the visit.',
      },
      {
        id: 'record-access',
        title: 'Keep the access record',
        description:
          'Harbor uses a written sign-in/sign-out record for this visit and retains physical-access records for its defined retention period. Paper is its fictional choice; the guide also describes automated records.',
      },
      {
        id: 'manage-device',
        title: 'Keep track of access devices',
        description:
          'A worker changing roles returns an assigned key. The facility owner compares it with the key inventory and updates the assignment record. Badge permissions or locks would be adjusted when necessary for the situation.',
      },
    ],
    questions: [
      {
        id: 'badge-does-not-replace-escort',
        prompt:
          'The familiar supplier receives a visitor badge and offers to walk to the equipment area alone. What is the appropriate response in this scenario?',
        correctChoiceId: 'escort-monitor',
        choices: [
          {
            id: 'known-person-alone',
            label: 'Allow it because the team recognizes the supplier.',
            feedback:
              'Knowing a visitor does not replace escorting and monitoring. The supplier is still a visitor in this scenario.',
          },
          {
            id: 'badge-alone',
            label: 'Allow it because the badge itself monitors the visit.',
            feedback:
              'A badge can help distinguish a visitor, but it does not by itself provide an escort or establish that activity is monitored.',
          },
          {
            id: 'escort-monitor',
            label:
              'Have the assigned employee escort the supplier and monitor the visit.',
            feedback:
              'These are two named determinations. The badge can help identify the visitor, but it does not substitute for either activity.',
          },
        ],
      },
      {
        id: 'written-access-record',
        prompt:
          'Harbor uses written access records retained for its defined period. Which interpretation follows the guide?',
        correctChoiceId: 'manual-records-possible',
        choices: [
          {
            id: 'manual-records-possible',
            label:
              'Written records can be used; access records still need to be maintained and retained appropriately.',
            feedback:
              'The guide explicitly permits procedural, automated, or combined logs and describes a company-defined retention period. It does not universally require electronic badge readers.',
          },
          {
            id: 'electronic-only',
            label:
              'Written records never count; electronic badge readers are mandatory.',
            feedback:
              'The guide gives written logs as an example. The required concept is maintained physical-access records, not one required logging technology.',
          },
          {
            id: 'one-year-universal',
            label:
              'Every organization must keep these records for exactly one year.',
            feedback:
              'One year appears in a fictional guide example. The Further Discussion instead refers to the time period defined by the company; an example is not a universal retention parameter.',
          },
        ],
      },
      {
        id: 'returned-key-record',
        prompt:
          'A returned key is placed in a drawer without checking its identity or updating its assignment. What part of the picture remains unresolved?',
        correctChoiceId: 'key-accountability',
        choices: [
          {
            id: 'visitor-only',
            label: 'Only whether the former key holder wore a visitor badge.',
            feedback:
              'Visitor handling is separate. Here the unresolved issue is identification and management of an access device and who still has access.',
          },
          {
            id: 'key-accountability',
            label:
              'Whether the assigned key was returned and its access/assignment records are current.',
            feedback:
              'The source separately calls for identifying, controlling, and managing physical-access devices. Comparing the returned key with the inventory and updating records illustrates that accountability.',
          },
          {
            id: 'mandatory-lock-change',
            label:
              'The source requires replacing every lock after every role change.',
            feedback:
              'Changing locks may be necessary in a particular situation, but the guide lists it as a possible management action. It does not impose that exact action for every role change.',
          },
        ],
      },
    ],
    glossaryTermIds: ['fci', 'offboarding', 'assessment-objective'],
    disclaimer:
      'A fictional practice activity written from the September 2024 CMMC v2.13 snapshot. It illustrates selected ideas; it is not an assessment checklist, a compliance score, or a measure of assessment readiness. No real organizational information, evidence, credentials or CUI is needed.',
    teachingSource: {
      id: 'cmmc-assessment-l1-213-page-35',
      title: 'CMMC Assessment Guide – Level 1',
      url: 'https://dodcio.defense.gov/Portals/0/Documents/CMMC/AssessmentGuideL1v2.pdf#page=35',
      kind: 'official-publication',
      versionContext:
        'Version 2.13 · September 2024; PDF page 35 (printed page 31). Source text checked against a hash-pinned public PDF mirror; current official-host bytes and applicability have not been verified.',
    },
  },
  {
    id: 'level-one-public-system-separation',
    lesson: {
      frameworkId: 'cmmc',
      editionId: 'cmmc-2-13-sep-2024',
      controlKey: 'sc-l1-b-1-xi',
    },
    reviewStatus: 'draft',
    contentVersion: '2026-10-14.1',
    title: 'Practice: the public website’s network boundary',
    learningObjective:
      'Identify a publicly accessible component and distinguish actual physical/logical subnetwork separation from labels or encrypted website traffic.',
    introduction:
      'Decide how a fictional public recruiting site relates to a workshop’s internal contract systems.',
    plainEnglish:
      'Identify system components the public can reach. Put publicly accessible components on subnetworks physically or logically separated from internal networks. A subnetwork is a distinct part of a network; logical separation uses enforced network controls rather than necessarily separate hardware.',
    commonMisunderstanding: {
      claim: '“Calling a server the public zone makes it separated.”',
      correction:
        'The label does not establish separation. The implemented network boundaries and access controls must separate the public component’s subnetwork from the internal network.',
    },
    scenarioTitle: 'A recruiting site beside an internal workspace',
    scenario: [
      {
        id: 'identify-public-component',
        title: 'Identify the public component',
        description:
          'Harbor plans a recruiting website anyone on the internet can reach. Its internal contract workspace handles FCI and is not offered to the public.',
      },
      {
        id: 'separate-subnetwork',
        title: 'Separate its network',
        description:
          'The team puts the site on a logically separated subnetwork with enforced boundary rules. In this example, access from the public zone to the internal network is blocked by default.',
      },
      {
        id: 'check-boundary',
        title: 'Check the actual boundary',
        description:
          'The network drawing, effective configuration, and a controlled test in a fictional environment are compared. Renaming a server or enabling encrypted web traffic would not establish subnetwork separation.',
      },
    ],
    questions: [
      {
        id: 'identify-public-component',
        prompt:
          'Which component is clearly publicly accessible in the stated scenario?',
        correctChoiceId: 'recruiting-site',
        choices: [
          {
            id: 'recruiting-site',
            label:
              'The recruiting website that anyone on the internet can reach.',
            feedback:
              'The scenario expressly makes that component public. Identifying it is the first determination before checking the separation of its subnetwork.',
          },
          {
            id: 'internal-contract-workspace',
            label:
              'The internal contract workspace, solely because it handles FCI.',
            feedback:
              'Handling FCI does not itself make a component publicly accessible. The scenario says the internal workspace is not offered to the public.',
          },
          {
            id: 'every-system',
            label: 'Every system owned by Harbor.',
            feedback:
              'Ownership does not establish public reachability. The team needs to identify the actual publicly accessible components.',
          },
        ],
      },
      {
        id: 'logical-separation-option',
        prompt:
          'The public site shares underlying hardware with another workload, but its subnetwork is logically separated using enforced boundary controls. Does the requirement permit logical separation?',
        correctChoiceId: 'physical-or-logical',
        choices: [
          {
            id: 'separate-hardware-only',
            label:
              'No; this requirement permits only separately purchased physical hardware.',
            feedback:
              'The exact requirement permits physical or logical separation. Shared hardware does not automatically prove adequate logical separation, but it does not automatically rule it out either.',
          },
          {
            id: 'physical-or-logical',
            label:
              'Yes, physical or logical separation is permitted; the actual separation still needs to be established.',
            feedback:
              'The source names both alternatives and discusses virtualization and cloud techniques. This fictional description illustrates the permitted concept, not proof that a real configuration is adequate.',
          },
          {
            id: 'name-is-enough',
            label: 'Yes; naming the workload “public” is all that is needed.',
            feedback:
              'The name is not an implemented boundary. The question specifically describes enforced logical separation, which still needs to be checked in context.',
          },
        ],
      },
      {
        id: 'https-is-not-network-separation',
        prompt:
          'A proposal enables HTTPS but leaves the public server on the internal subnetwork with unrestricted internal connectivity. Which distinction matters?',
        correctChoiceId: 'separate-connection-from-boundary',
        choices: [
          {
            id: 'encrypted-means-separated',
            label:
              'Encryption of the web traffic automatically creates a separate subnetwork.',
            feedback:
              'Encryption protects communication; it does not create the required separation of subnetworks. The stated internal connectivity remains a separate issue.',
          },
          {
            id: 'public-release-sufficient',
            label:
              'Approving the site’s public text establishes its network separation.',
            feedback:
              'Reviewing published information is a different control concept. Content approval does not establish a network boundary.',
          },
          {
            id: 'separate-connection-from-boundary',
            label:
              'Encrypted traffic and subnetwork separation are different protections.',
            feedback:
              'This requirement concerns the placement and separation of publicly accessible components. HTTPS alone does not address the described network placement or unrestricted internal path.',
          },
        ],
      },
    ],
    glossaryTermIds: [
      'publicly-accessible-system',
      'system-boundary',
      'fci',
      'information-system',
    ],
    disclaimer:
      'A fictional practice activity written from the September 2024 CMMC v2.13 snapshot. It illustrates selected ideas; it is not an assessment checklist, a compliance score, or a measure of assessment readiness. No real organizational information, evidence, credentials or CUI is needed.',
    teachingSource: {
      id: 'cmmc-assessment-l1-213-page-41',
      title: 'CMMC Assessment Guide – Level 1',
      url: 'https://dodcio.defense.gov/Portals/0/Documents/CMMC/AssessmentGuideL1v2.pdf#page=41',
      kind: 'official-publication',
      versionContext:
        'Version 2.13 · September 2024; PDF page 41 (printed page 37). Source text checked against a hash-pinned public PDF mirror; current official-host bytes and applicability have not been verified.',
    },
  },
  {
    id: 'level-two-mfa-access-paths',
    lesson: {
      frameworkId: 'cmmc',
      editionId: 'cmmc-2-13-sep-2024',
      controlKey: 'ia-l2-3-5-3',
    },
    reviewStatus: 'draft',
    contentVersion: '2026-10-14.1',
    title: 'Practice: find the missing authentication factor',
    learningObjective:
      'Distinguish authentication-factor types and identify the three specified MFA access categories, including onsite network access and local privileged access.',
    introduction:
      'Inspect a fictional team’s sign-ins instead of assuming its VPN covers every path.',
    plainEnglish:
      'Multifactor authentication (MFA) uses two or more different kinds of proof: something you know, have, or are. This requirement covers direct local and network access to privileged accounts (accounts with special permissions), plus network access to ordinary non-privileged accounts. Network access can happen from inside the office.',
    commonMisunderstanding: {
      claim: '“MFA on the VPN covers every sign-in this requirement names.”',
      correction:
        'A VPN is only one possible network path. Local privileged sign-ins and other privileged or ordinary-account network access also need their specified coverage.',
    },
    scenarioTitle: 'At a desk, at a console, and over a network',
    scenario: [
      {
        id: 'identify-privileged',
        title: 'Identify the special-permission accounts',
        description:
          'Fictional Cedar Lab identifies the accounts used to administer its CUI systems. It distinguishes them from ordinary accounts used for daily work.',
      },
      {
        id: 'inspect-access-paths',
        title: 'Inspect each access category',
        description:
          'The team reviews local administrator console access, administrator access over a network, and ordinary-user network access—including access over the office network.',
      },
      {
        id: 'check-factors',
        title: 'Check different kinds of proof',
        description:
          'For its fictional design, the team checks an account password plus an appropriate possession-based authenticator. It does not count a second password as a second factor type.',
      },
    ],
    questions: [
      {
        id: 'office-network-still-network',
        prompt:
          'An ordinary user opens a network application over Cedar Lab’s office network. Which statement follows this requirement?',
        correctChoiceId: 'onsite-network-covered',
        choices: [
          {
            id: 'physical-office-local',
            label:
              'It is local access because the user is physically in the office.',
            feedback:
              'The guide defines local access by a direct connection without a network. Using the office network is network access even when the person is onsite.',
          },
          {
            id: 'onsite-network-covered',
            label:
              'It is network access to a non-privileged account, so the specified MFA scope applies.',
            feedback:
              'Network access includes internal network connections. Remote access is one type of network access, not the only type.',
          },
          {
            id: 'ordinary-users-exempt',
            label: 'Ordinary accounts never fall within this MFA requirement.',
            feedback:
              'The exact requirement includes network access to non-privileged accounts. It does not require privileged status for that category.',
          },
        ],
      },
      {
        id: 'two-passwords-one-factor',
        prompt:
          'A proposal asks for an account password and a second memorized secret. What is the key factor distinction?',
        correctChoiceId: 'same-factor-kind',
        choices: [
          {
            id: 'two-prompts-two-factors',
            label:
              'Two prompts always mean two different authentication factors.',
            feedback:
              'The number of prompts is not the number of factor types. Two knowledge-based secrets do not supply two different kinds of proof.',
          },
          {
            id: 'passwords-never-factors',
            label: 'A password cannot be used as any authentication factor.',
            feedback:
              'A password is an example of something you know. The issue is combining it with a different factor type, not excluding passwords altogether.',
          },
          {
            id: 'same-factor-kind',
            label:
              'Both are knowledge factors; use two or more different factor types.',
            feedback:
              'The guide names knowledge, possession, and inherent characteristics. Two passwords remain the same kind of proof, even if the prompts look different.',
          },
        ],
      },
      {
        id: 'local-admin-gap',
        prompt:
          'VPN access uses MFA, but the local administrator console sign-in still uses one factor. Which access category is visibly missing the specified protection?',
        correctChoiceId: 'local-privileged-gap',
        choices: [
          {
            id: 'local-privileged-gap',
            label: 'Local access to the privileged administrator account.',
            feedback:
              'That category is explicitly named in determination [b]. MFA on a VPN does not automatically protect a separate local administrator sign-in.',
          },
          {
            id: 'every-local-ordinary-login',
            label:
              'Every ordinary user’s local sign-in, because this requirement says all local logins.',
            feedback:
              'The exact scope specifies local privileged access and privileged/non-privileged network access. It does not state a blanket requirement for every local ordinary-user login here.',
          },
          {
            id: 'no-gap-vpn-complete',
            label:
              'No gap; the VPN setting proves all required categories are covered.',
            feedback:
              'A setting on one access path does not establish coverage of other paths. The scenario directly identifies local privileged access with only one factor.',
          },
        ],
      },
    ],
    glossaryTermIds: ['authentication', 'account', 'cui', 'information-system'],
    disclaimer:
      'A fictional practice activity written from the September 2024 CMMC v2.13 snapshot. It illustrates selected ideas; it is not an assessment checklist, a compliance score, or a measure of assessment readiness. No real organizational information, evidence, credentials or CUI is needed.',
    teachingSource: {
      id: 'cmmc-assessment-l2-213-page-125',
      title: 'CMMC Assessment Guide – Level 2',
      url: 'https://dodcio.defense.gov/Portals/0/Documents/CMMC/AssessmentGuideL2v2.pdf#page=125',
      kind: 'official-publication',
      versionContext:
        'Version 2.13 · September 2024; PDF page 125 (printed page 117). Source text checked against a hash-pinned public PDF mirror; current official-host bytes and applicability have not been verified.',
    },
  },
  {
    id: 'level-two-software-execution-policy',
    lesson: {
      frameworkId: 'cmmc',
      editionId: 'cmmc-2-13-sep-2024',
      controlKey: 'cm-l2-3-4-8',
    },
    reviewStatus: 'draft',
    contentVersion: '2026-10-14.1',
    title: 'Practice: installed does not mean allowed to run',
    learningObjective:
      'Interpret allow-by-exception and deny-by-exception policies, then distinguish a selected software list from actual execution enforcement.',
    introduction:
      'Work through a fictional team’s chosen policy when a new utility appears on a workstation.',
    plainEnglish:
      'Choose and specify an execution policy: deny-by-exception lets software run unless specifically denied; deny-all, permit-by-exception lets only specifically allowed software run. Specify the allowed or denied software and enforce the chosen policy. An installation list is not execution enforcement.',
    commonMisunderstanding: {
      claim:
        '“The approved-software spreadsheet automatically prevents other software from running.”',
      correction:
        'The list describes the selected software set. A corresponding implemented control must enforce the chosen execution policy.',
    },
    scenarioTitle: 'An unlisted utility on a managed workstation',
    scenario: [
      {
        id: 'choose-policy',
        title: 'Choose the policy',
        description:
          'Fictional Cedar Lab chooses deny-all, permit-by-exception for this workstation group. Only its specifically allowed software should execute; this choice is not a universal mandate to use that option.',
      },
      {
        id: 'specify-software',
        title: 'Specify the software set',
        description:
          'The team maintains the software allowed under that policy and a controlled process for evaluating changes to the allowed set.',
      },
      {
        id: 'enforce-execution',
        title: 'Check actual execution',
        description:
          'A new utility appears on a test workstation. The team checks whether the execution control prevents it from running until it is allowed under the selected policy; merely finding it in an inventory does not establish enforcement.',
      },
    ],
    questions: [
      {
        id: 'allow-policy-unlisted-program',
        prompt:
          'Under Cedar Lab’s chosen deny-all, permit-by-exception policy, an unlisted utility attempts to execute. What should the policy implementation do?',
        correctChoiceId: 'deny-unlisted',
        choices: [
          {
            id: 'deny-unlisted',
            label:
              'Prevent execution unless the utility is included in the allowed software set.',
            feedback:
              'This is the defining behavior of the chosen permit-by-exception policy. The scenario concerns execution, not merely whether a file can be downloaded or installed.',
          },
          {
            id: 'allow-unless-malicious',
            label: 'Allow it unless it is already on a denied-software list.',
            feedback:
              'That describes deny-by-exception behavior. Cedar Lab chose the other permitted policy, so an unlisted program is not automatically allowed.',
          },
          {
            id: 'purchase-approval-enough',
            label: 'Allow it because its vendor is a recognized company.',
            feedback:
              'Vendor recognition does not place the program in this team’s specified allowed set. The selected policy must still be implemented as specified.',
          },
        ],
      },
      {
        id: 'inventory-versus-execution',
        prompt:
          'The software list is accurate, but the unlisted utility still runs in the controlled test. What does the test establish?',
        correctChoiceId: 'execution-enforcement-gap',
        choices: [
          {
            id: 'inventory-proves-control',
            label: 'The accurate inventory proves the execution policy works.',
            feedback:
              'An inventory describes software. The test shows actual execution outside the selected allowed set, so the inventory cannot establish enforcement on its own.',
          },
          {
            id: 'execution-enforcement-gap',
            label:
              'The chosen execution policy is not enforced for that tested path.',
            feedback:
              'Specifying the policy and software set is separate from implementing it. The controlled test reveals the difference without claiming to assess every system.',
          },
          {
            id: 'only-installation-control',
            label:
              'Only user installation matters; execution is outside this requirement.',
            feedback:
              'Controlling user-installed software is the related CM.L2-3.4.9 concept. This requirement explicitly concerns authorized or unauthorized software execution.',
          },
        ],
      },
      {
        id: 'stronger-does-not-mean-only-option',
        prompt:
          'The guide calls allow-listing stronger. Does the exact requirement therefore permit only deny-all, permit-by-exception?',
        correctChoiceId: 'both-policy-options',
        choices: [
          {
            id: 'only-allow-policy',
            label:
              'Yes; describing one option as stronger removes the other from the requirement.',
            feedback:
              'The exact requirement uses “or” between the two policies. A preference stated in Discussion does not erase the other named option.',
          },
          {
            id: 'no-policy-needed',
            label:
              'No; because both are named, an organization need not specify either.',
            feedback:
              'Determination [a] asks for a specified policy, and [b] and [c] ask for its software set and implementation. The choice does not remove those tasks.',
          },
          {
            id: 'both-policy-options',
            label:
              'No; both are named, but the selected policy and software set must be specified and implemented.',
            feedback:
              'That preserves the exact alternatives and all three determinations. Cedar Lab’s allow-list choice is an example, not a new universal obligation.',
          },
        ],
      },
    ],
    glossaryTermIds: [
      'authorization',
      'malicious-code',
      'device',
      'assessment-objective',
    ],
    disclaimer:
      'A fictional practice activity written from the September 2024 CMMC v2.13 snapshot. It illustrates selected ideas; it is not an assessment checklist, a compliance score, or a measure of assessment readiness. No real organizational information, evidence, credentials or CUI is needed.',
    teachingSource: {
      id: 'cmmc-assessment-l2-213-page-116',
      title: 'CMMC Assessment Guide – Level 2',
      url: 'https://dodcio.defense.gov/Portals/0/Documents/CMMC/AssessmentGuideL2v2.pdf#page=116',
      kind: 'official-publication',
      versionContext:
        'Version 2.13 · September 2024; PDF page 116 (printed page 108). Source text checked against a hash-pinned public PDF mirror; current official-host bytes and applicability have not been verified.',
    },
  },
  {
    id: 'level-two-audit-failure-alerts',
    lesson: {
      frameworkId: 'cmmc',
      editionId: 'cmmc-2-13-sep-2024',
      controlKey: 'au-l2-3-3-4',
    },
    reviewStatus: 'draft',
    contentVersion: '2026-10-14.1',
    title: 'Practice: notice when the recording stops',
    learningObjective:
      'Recognize audit-process failures, identify alert recipients and failure types, and connect those definitions to an alert that reaches the identified personnel or roles.',
    introduction:
      'Investigate a fictional service that still works even though its activity records have stopped.',
    plainEnglish:
      'An audit log records system activity. If its recording process fails, the organization needs an alert. Identify who should be alerted, define the logging failures that generate alerts, and alert those identified people or roles when a logging failure occurs.',
    commonMisunderstanding: {
      claim:
        '“If the application is still available, its audit logging must be working.”',
      correction:
        'Logging can fail independently of the application. Software/hardware errors, broken capture mechanisms, and full audit storage are failure examples in the guide.',
    },
    scenarioTitle: 'The service is up. Its records are missing.',
    scenario: [
      {
        id: 'define-failure-and-role',
        title: 'Define the failure and recipient',
        description:
          'Fictional Cedar Lab identifies its responsible security role and defines audit-storage exhaustion and stopped capture as logging failures to alert on. These are selected examples from its environment.',
      },
      {
        id: 'observe-failure',
        title: 'Notice a separate failure',
        description:
          'A test service still serves requests, but the audit storage fills and new activity records stop. Successful requests do not establish a functioning audit process.',
      },
      {
        id: 'verify-alert',
        title: 'Check delivery to the responsible role',
        description:
          'In a controlled simulation, the alert reaches the identified security role through the team’s configured channel. The team investigates and restores logging as appropriate; no particular messaging product is required.',
      },
    ],
    questions: [
      {
        id: 'service-up-logging-down',
        prompt:
          'The service still works, but full audit storage prevents new records. How should the team interpret this?',
        correctChoiceId: 'logging-failure-example',
        choices: [
          {
            id: 'availability-proves-auditing',
            label:
              'No logging failure occurred because users can still use the service.',
            feedback:
              'Application availability and audit-process operation are different. The scenario states that new audit records cannot be stored.',
          },
          {
            id: 'only-malware-counts',
            label: 'It counts only if someone proves malware caused it.',
            feedback:
              'The guide includes storage capacity and software/hardware errors as failures. A proven attacker is not a prerequisite to recognizing this logging problem.',
          },
          {
            id: 'logging-failure-example',
            label:
              'It is an audit-process failure example even without an application outage.',
            feedback:
              'The guide specifically includes audit-storage capacity being reached or exceeded. The designated personnel need to be alerted to the loss of logging.',
          },
        ],
      },
      {
        id: 'alert-needs-recipient',
        prompt:
          'Which fictional alert arrangement best connects the source’s recipient and delivery determinations?',
        correctChoiceId: 'identified-recipient-delivery',
        choices: [
          {
            id: 'identified-recipient-delivery',
            label:
              'Identify the responsible role and configure the failure alert to reach that role.',
            feedback:
              'The source distinguishes identifying personnel/roles from actually alerting them. This connects the two; choosing a particular email or SMS product is not the requirement.',
          },
          {
            id: 'unowned-warning',
            label:
              'Write an unowned warning on a screen no identified person uses.',
            feedback:
              'A warning’s existence does not establish that the identified personnel or roles are alerted. Ownership and delivery remain unresolved.',
          },
          {
            id: 'enabled-setting-only',
            label:
              'Show an “audit enabled” setting without generating a failure alert.',
            feedback:
              'A normal-operation setting does not itself alert anyone when recording fails. The question is about the failure response, not the presence of a configuration label.',
          },
        ],
      },
      {
        id: 'alert-rollout-order',
        prompt:
          'Which rollout order best connects definitions to a useful controlled test?',
        correctChoiceId: 'define-configure-test',
        choices: [
          {
            id: 'test-without-definitions',
            label:
              'Create a test warning first and declare the recipient and failure types irrelevant.',
            feedback:
              'The source separately asks for identified personnel/roles and defined failure types. A test cannot establish those missing definitions.',
          },
          {
            id: 'define-configure-test',
            label:
              'Identify recipients and failure types, configure alerts, then test whether a selected failure alerts the identified role.',
            feedback:
              'That is a coherent fictional learning sequence connecting [a], [b], and [c]. The source does not prescribe this as one mandatory implementation workflow, and one test does not prove complete coverage.',
          },
          {
            id: 'collect-only',
            label: 'Collect more audit records but omit the failure alert.',
            feedback:
              'Audit collection is important, but this requirement concerns alerting when the process fails. More records alone do not establish that behavior.',
          },
        ],
      },
    ],
    glossaryTermIds: ['information-system', 'assessment-objective', 'cui'],
    disclaimer:
      'A fictional practice activity written from the September 2024 CMMC v2.13 snapshot. It illustrates selected ideas; it is not an assessment checklist, a compliance score, or a measure of assessment readiness. No real organizational information, evidence, credentials or CUI is needed.',
    teachingSource: {
      id: 'cmmc-assessment-l2-213-page-87',
      title: 'CMMC Assessment Guide – Level 2',
      url: 'https://dodcio.defense.gov/Portals/0/Documents/CMMC/AssessmentGuideL2v2.pdf#page=87',
      kind: 'official-publication',
      versionContext:
        'Version 2.13 · September 2024; PDF page 87 (printed page 79). Source text checked against a hash-pinned public PDF mirror; current official-host bytes and applicability have not been verified.',
    },
  },
  {
    id: 'level-three-practical-training',
    lesson: {
      frameworkId: 'cmmc',
      editionId: 'cmmc-2-13-sep-2024',
      controlKey: 'at-l3-3-2-2e',
    },
    reviewStatus: 'draft',
    contentVersion: '2026-10-14.1',
    title: 'Practice: turn awareness into action',
    learningObjective:
      'Distinguish practical role-tailored exercises from passive awareness material and identify current-threat alignment and feedback to both participants and supervisors.',
    introduction:
      'Help a fictional training coordinator improve an exercise plan for general, specialized and privileged users.',
    plainEnglish:
      'Include practical exercises in awareness training for all users, tailored to their roles and aligned with current threat scenarios. Identify the people involved and their supervisors, and provide feedback to both. A practical exercise asks people to respond, rather than only watch or read.',
    commonMisunderstanding: {
      claim:
        '“Sending everyone the same slide deck completes practical training.”',
      correction:
        'Material alone does not establish practical exercises. The source names all users, role tailoring, current threats, and feedback to participants and their supervisors.',
    },
    scenarioTitle: 'Different roles need meaningful practice',
    scenario: [
      {
        id: 'identify-roles-and-threat',
        title: 'Identify roles and a current threat scenario',
        description:
          'Fictional Cedar Lab identifies general users, specialized finance staff and privileged system administrators, plus their supervisors. The training coordinator selects a current social-engineering scenario relevant to their work.',
      },
      {
        id: 'tailor-practice',
        title: 'Give each role something to practise',
        description:
          'General users practise reporting a suspicious request; finance staff practise handling a request through their approved payment-verification process; administrators practise responding to a request for privileged action. These are fictional exercise choices, not required scripts.',
      },
      {
        id: 'provide-feedback',
        title: 'Explain results to participants and supervisors',
        description:
          'The coordinator gives participants specific feedback about their responses and provides their supervisors with relevant feedback too. The aim is to reinforce appropriate behavior and identify needed instruction; no real training data is collected in this activity.',
      },
    ],
    questions: [
      {
        id: 'practical-versus-passive-training',
        prompt:
          'Everyone watched the same video, but no one practised a response and no role-specific exercises occurred. What is missing relative to this requirement?',
        correctChoiceId: 'practical-tailored-exercises',
        choices: [
          {
            id: 'more-slides-only',
            label:
              'Only a longer video; practical responses are outside the requirement.',
            feedback:
              'The requirement explicitly includes practical exercises. More passive material does not establish that people practised role-relevant responses.',
          },
          {
            id: 'practical-tailored-exercises',
            label:
              'Practical exercises for all users, tailored by role and aligned with current threats.',
            feedback:
              'The source specifies that combination. A shared overview can be useful, but it does not replace the named practical and role-tailored elements.',
          },
          {
            id: 'admins-only-exercises',
            label: 'Exercise participation for administrators only.',
            feedback:
              'Privileged users are included, but so are general users and users with specialized roles. Restricting practice to administrators omits the all-user scope.',
          },
        ],
      },
      {
        id: 'current-threat-role-fit',
        prompt:
          'Which exercise plan best preserves both role tailoring and current-threat alignment?',
        correctChoiceId: 'role-fit-current-threat',
        choices: [
          {
            id: 'role-fit-current-threat',
            label:
              'Use a relevant current threat scenario with different practical tasks for general, specialized and privileged roles.',
            feedback:
              'This preserves all-user coverage while making the exercise meaningful to different responsibilities. These fictional tasks are examples, not a mandated exercise vendor or fixed script.',
          },
          {
            id: 'same-obsolete-script',
            label:
              'Reuse an obsolete scenario unchanged for every role because one script is easier to administer.',
            feedback:
              'Convenience alone does not establish current-threat alignment or tailoring by role. The scenario needs to reflect current threats and the users’ responsibilities.',
          },
          {
            id: 'paid-phishing-only',
            label:
              'Require one paid phishing service because the guide’s example uses a third party.',
            feedback:
              'The guide states the organization or a third party can perform exercises. Its example does not prescribe a paid product or phishing as the only practical exercise.',
          },
        ],
      },
      {
        id: 'training-feedback-recipients',
        prompt:
          'The coordinator identifies the participants and supervisors, but sends useful feedback only to participants. Which stated feedback audience is missing?',
        correctChoiceId: 'supervisor-feedback',
        choices: [
          {
            id: 'public-leaderboard',
            label: 'A public leaderboard naming unsuccessful participants.',
            feedback:
              'The source asks for feedback to individuals and their supervisors. It does not require public ranking or exposure of training results.',
          },
          {
            id: 'no-other-audience',
            label: 'None; participant feedback is the only named audience.',
            feedback:
              'The requirement and determination [e] also name supervisors. Feedback to participants alone omits that audience.',
          },
          {
            id: 'supervisor-feedback',
            label: 'The participants’ supervisors.',
            feedback:
              'Both individuals involved in the training and their supervisors are named. This reinforces learning and helps supervisors address needs; it does not prescribe punishment or a public report.',
          },
        ],
      },
    ],
    glossaryTermIds: [
      'authorized-user',
      'authorization',
      'cui',
      'assessment-objective',
    ],
    disclaimer:
      'A fictional practice activity written from the September 2024 CMMC v2.13 snapshot. It illustrates selected ideas; it is not an assessment checklist, a compliance score, or a measure of assessment readiness. No real organizational information, evidence, credentials or CUI is needed.',
    teachingSource: {
      id: 'cmmc-assessment-l3-213-page-26',
      title: 'CMMC Assessment Guide – Level 3',
      url: 'https://dodcio.defense.gov/Portals/0/Documents/CMMC/AssessmentGuideL3.pdf#page=26',
      kind: 'official-publication',
      versionContext:
        'Version 2.13 · September 2024; PDF page 26 (printed page 22). Source text checked against a hash-pinned public PDF mirror; current official-host bytes and applicability have not been verified.',
    },
  },
  {
    id: 'level-three-response-team-deployment',
    lesson: {
      frameworkId: 'cmmc',
      editionId: 'cmmc-2-13-sep-2024',
      controlKey: 'ir-l3-3-6-2e',
    },
    reviewStatus: 'draft',
    contentVersion: '2026-10-14.1',
    title: 'Practice: ready to deploy a response team',
    learningObjective:
      'Distinguish a maintained incident-response team’s deployment capability from full incident resolution and identify when remote deployment can or cannot perform the needed work.',
    introduction:
      'Compare two fictional environments before assuming deployment always means travel or always means a remote connection.',
    plainEnglish:
      'Establish and maintain a cyber incident response team that the organization can deploy within 24 hours. Deployment can be remote when it provides the needed capability; some environments require physical access. The 24 hours is for deploying the team, not for fully resolving every incident.',
    commonMisunderstanding: {
      claim:
        '“Deploying within 24 hours means every responder must travel on site and the incident must be resolved by then.”',
      correction:
        'The guide distinguishes remote and physical deployment according to the environment. The specified capability is deploying the team within 24 hours, not completing every recovery by then.',
    },
    scenarioTitle: 'An online service and an isolated facility',
    scenario: [
      {
        id: 'maintain-team',
        title: 'Maintain the team before an incident',
        description:
          'Fictional Cedar Lab has an established response team. Its leads keep roles, contacts, tools and procedures current; a name on an old roster is not a deployable team.',
      },
      {
        id: 'remote-capability',
        title: 'Consider the accessible service',
        description:
          'In a fictional exercise, approved remote access gives responders the capability needed to inspect an online service and preserve evidence. The team can deploy through that access within the specified window.',
      },
      {
        id: 'physical-need',
        title: 'Consider the isolated facility',
        description:
          'A separate physically isolated environment has no appropriate remote response path, so responders must be there in person. The team plans the people, travel and site access needed to deploy there within 24 hours too, rather than assuming the online service’s approach works everywhere.',
      },
    ],
    questions: [
      {
        id: 'remote-response-deployment',
        prompt:
          'For the online service, approved remote access gives the response team the needed capability within 24 hours. Does deployment have to mean traveling on site?',
        correctChoiceId: 'remote-can-deploy',
        choices: [
          {
            id: 'remote-can-deploy',
            label:
              'No. Remote deployment can be appropriate when it provides the needed capability.',
            feedback:
              'The Further Discussion says deployment is not necessarily physical. This depends on the environment; a remote connection that cannot perform the needed work is not equivalent.',
          },
          {
            id: 'physical-travel-always',
            label:
              'Yes. Every deployment requires every responder to travel onsite.',
            feedback:
              'The guide expressly describes remote deployment. It does not impose universal physical travel for every incident environment.',
          },
          {
            id: 'message-alone-deployment',
            label:
              'Sending an acknowledgement without response capability counts as deployment.',
            feedback:
              'The scenario’s remote access provides actual response capability. A message alone does not establish a team capable of performing the needed work.',
          },
        ],
      },
      {
        id: 'isolated-site-response',
        prompt:
          'The isolated environment has no appropriate remote response path. Which plan respects the guide’s stated limitation?',
        correctChoiceId: 'plan-needed-physical-access',
        choices: [
          {
            id: 'reuse-remote-assumption',
            label:
              'Assume the same remote-only plan works because it worked for the online service.',
            feedback:
              'The guide explicitly notes that some situations need physical presence, including physically isolated remote environments. One environment’s access path does not establish another’s capability.',
          },
          {
            id: 'plan-needed-physical-access',
            label:
              'Plan the people, travel and site access needed so the team can still deploy there within 24 hours.',
            feedback:
              'The guide says a physically isolated remote environment needs a team physically present, and the requirement’s 24 hours applies to deploying it there too. This is one way to keep the team deployable, not a universal travel checklist.',
          },
          {
            id: 'ignore-isolated-environment',
            label:
              'Treat isolation as proof that an incident-response capability is unnecessary.',
            feedback:
              'Physical isolation changes the access problem. It does not by itself establish that the team need not be capable of responding to that environment.',
          },
        ],
      },
      {
        id: 'deployment-not-resolution-deadline',
        prompt:
          'A colleague says, “This requirement guarantees every incident will be fully resolved within 24 hours.” Which correction preserves its exact timing statement?',
        correctChoiceId: 'deploy-not-finish',
        choices: [
          {
            id: 'new-reporting-deadline',
            label:
              'The 24 hours instead creates a universal deadline for every external incident report.',
            feedback:
              'The quoted requirement concerns deploying the response team. It does not state a universal external reporting deadline.',
          },
          {
            id: 'no-timing-parameter',
            label: 'The 24 hours is only an illustration and can be omitted.',
            feedback:
              'The 24 hours is part of the requirement’s own text and assessment objective [b]; it is not just an example.',
          },
          {
            id: 'deploy-not-finish',
            label:
              'The team must be capable of deployment within 24 hours; that is not a promise of complete resolution within that period.',
            feedback:
              'This preserves the stated capability and timing. Response, analysis, containment and recovery depend on the incident; a knowledge check does not establish real deployment readiness.',
          },
        ],
      },
    ],
    glossaryTermIds: ['information-system', 'cui'],
    disclaimer:
      'A fictional practice activity written from the September 2024 CMMC v2.13 snapshot. It illustrates selected ideas; it is not an assessment checklist, a compliance score, or a measure of assessment readiness. No real organizational information, evidence, credentials or CUI is needed.',
    teachingSource: {
      id: 'cmmc-assessment-l3-213-page-47',
      title: 'CMMC Assessment Guide – Level 3',
      url: 'https://dodcio.defense.gov/Portals/0/Documents/CMMC/AssessmentGuideL3.pdf#page=47',
      kind: 'official-publication',
      versionContext:
        'Version 2.13 · September 2024; PDF page 47 (printed page 43). Source text checked against a hash-pinned public PDF mirror; current official-host bytes and applicability have not been verified.',
    },
  },
  {
    id: 'level-three-software-integrity',
    lesson: {
      frameworkId: 'cmmc',
      editionId: 'cmmc-2-13-sep-2024',
      controlKey: 'si-l3-3-14-1e',
    },
    reviewStatus: 'draft',
    contentVersion: '2026-10-14.1',
    title: 'Practice: trust the check, not the download icon',
    learningObjective:
      'Identify the organization-defined security-critical/essential software scope and distinguish trusted integrity verification from an untrusted file/hash pair or a stale verification result.',
    introduction:
      'Follow a fictional team as it verifies a protected application and then handles an updated version.',
    plainEnglish:
      'Define which software is security-critical or essential, identify root-of-trust mechanisms or cryptographic signatures, and use them to verify that software’s integrity. A root of trust is a trusted starting point for verification; a cryptographic signature ties a check to a signing key. A matching value from an untrusted source is not automatically a trusted verification process.',
    commonMisunderstanding: {
      claim:
        '“Any matching hash proves a download is safe, and one check covers all later versions.”',
      correction:
        'The source names particular trusted verification mechanisms. Trust in the mechanism/reference matters, and changes require the relevant ongoing verification. Integrity and authenticity are not a guarantee that software has no defects.',
    },
    scenarioTitle: 'A verified application receives an update',
    scenario: [
      {
        id: 'define-scope-and-mechanism',
        title: 'Define the software and verification method',
        description:
          'Fictional Cedar Lab defines a CUI-processing application as essential and identifies an appropriate cryptographic-signature verification mechanism with its trusted verification context. These are the team’s choices, not a universal inventory of essential software.',
      },
      {
        id: 'verify-current-software',
        title: 'Verify the software to be executed',
        description:
          'Before running the application, the team validates its signature through the selected trusted mechanism. An icon saying “signed,” or a file and checksum from the same untrusted download page, would not by itself establish that check.',
      },
      {
        id: 'verify-update',
        title: 'Keep verification current',
        description:
          'When the application changes, the team checks the new version with the appropriate updated signature and ongoing verification process. The guide’s Further Discussion describes verification each time this software executes; the earlier version’s result is not reused as proof for changed bytes.',
      },
    ],
    questions: [
      {
        id: 'define-essential-software',
        prompt:
          'Which step supplies the source’s organization-defined software scope rather than assuming every application has the same role?',
        correctChoiceId: 'define-critical-essential',
        choices: [
          {
            id: 'all-downloads-essential',
            label:
              'Call every downloaded file essential without defining the organization’s software categories.',
            feedback:
              'The source includes an organization-defined statement about security-critical or essential software. A download event alone does not define those categories.',
          },
          {
            id: 'vendor-decides-everything',
            label:
              'Use the vendor’s product name as the entire organization-defined scope.',
            feedback:
              'A product name alone does not establish which software the organization defines as security-critical or essential. The source retains that definition step.',
          },
          {
            id: 'define-critical-essential',
            label:
              'Define which software is security-critical or essential for the organization.',
            feedback:
              'This reflects [ODP1]. The source’s scope should be retained separately from identifying the verification mechanisms and actually verifying software integrity.',
          },
        ],
      },
      {
        id: 'untrusted-file-and-hash',
        prompt:
          'A file and a matching unsigned checksum come from the same untrusted page. The team has not tied either to its trusted verification mechanism. What can it conclude?',
        correctChoiceId: 'matching-not-trusted',
        choices: [
          {
            id: 'matching-not-trusted',
            label:
              'The match alone does not establish the source’s trusted integrity verification.',
            feedback:
              'An attacker controlling an untrusted page could replace both. The question does not say hashes can never be part of a trusted process: the guide also describes an approved, controlled software-library example.',
          },
          {
            id: 'matching-proves-safe',
            label:
              'The matching value proves integrity, authenticity and freedom from malicious behavior.',
            feedback:
              'A match against an untrusted value does not establish trusted origin. Even an appropriate integrity/authenticity check is not a guarantee that software is defect-free.',
          },
          {
            id: 'tpm-only',
            label:
              'No verification is possible unless the organization purchases a TPM for every system.',
            feedback:
              'The exact requirement permits root-of-trust mechanisms or cryptographic signatures. It does not require that one specific device be purchased for every system.',
          },
        ],
      },
      {
        id: 'new-version-needs-check',
        prompt:
          'Version 1 was verified. Version 2 changes the executable. Which response fits the guide’s ongoing-verification discussion?',
        correctChoiceId: 'check-current-version',
        choices: [
          {
            id: 'old-check-covers-update',
            label:
              'Reuse version 1’s result because the application has the same name.',
            feedback:
              'The source discusses updated signatures and ongoing verification as critical software changes. The same name does not make changed software identical to the previously checked version.',
          },
          {
            id: 'check-current-version',
            label:
              'Verify the changed version using the appropriate current trusted mechanism and signature.',
            feedback:
              'The check must concern the software actually used. The Further Discussion describes verifying each execution and updating signatures as software changes; this fictional result is not proof of organizational compliance.',
          },
          {
            id: 'trusted-vendor-no-check',
            label:
              'Skip verification whenever an update claims to come from a trusted vendor.',
            feedback:
              'The claim of origin does not itself perform the identified verification. The source names integrity mechanisms and actual verification rather than reliance on a label.',
          },
        ],
      },
    ],
    glossaryTermIds: [
      'cui',
      'information-system',
      'malicious-code',
      'assessment-objective',
    ],
    disclaimer:
      'A fictional practice activity written from the September 2024 CMMC v2.13 snapshot. It illustrates selected ideas; it is not an assessment checklist, a compliance score, or a measure of assessment readiness. No real organizational information, evidence, credentials or CUI is needed.',
    teachingSource: {
      id: 'cmmc-assessment-l3-213-page-77',
      title: 'CMMC Assessment Guide – Level 3',
      url: 'https://dodcio.defense.gov/Portals/0/Documents/CMMC/AssessmentGuideL3.pdf#page=77',
      kind: 'official-publication',
      versionContext:
        'Version 2.13 · September 2024; PDF page 77 (printed page 73). Source text checked against a hash-pinned public PDF mirror; current official-host bytes and applicability have not been verified.',
    },
  },
] as const satisfies readonly LearningActivity[]

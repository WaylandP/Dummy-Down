const repositoryUrl = 'https://github.com/WaylandP/cipher-and-chalk'
export const disclaimerUpdated = 'October 14, 2026'

/** One page that states the limits of the site plainly; linked from every footer. */
export function DisclaimerPage() {
  return (
    <div className="about-page legal-page page">
      <section aria-labelledby="disclaimer-title">
        <p className="page-note">Disclaimer &amp; terms of use</p>
        <h1 id="disclaimer-title" className="chalk">
          Read this before
          <br /> you rely on anything here.
        </h1>
        <p>
          Cipher &amp; Chalk is a free, independent, open-source educational
          project. By using this site you agree to the terms below. Last updated{' '}
          {disclaimerUpdated}.
        </p>
      </section>

      <section aria-labelledby="advice-title">
        <h2 id="advice-title">This is education, not advice.</h2>
        <p>
          Everything on this site is provided for general educational purposes
          only. Nothing here is legal advice, compliance advice, assessment
          advice, or any other form of professional advice, and nothing here
          creates a professional or client relationship of any kind. Decisions
          about your organization’s security, contracts or compliance should be
          made with qualified professionals who know your situation.
        </p>
      </section>

      <section aria-labelledby="official-title">
        <h2 id="official-title">This is not an official source.</h2>
        <p>
          Cipher &amp; Chalk is not affiliated with, endorsed by, or certified
          by the U.S. Department of Defense, the National Institute of Standards
          and Technology, the Cyber AB, any certified assessor or assessment
          organization, or any other government agency or certification body.
        </p>
        <p>
          Quotations from government publications are reproduced from specific,
          dated editions that are identified beside each quotation. Those
          publications may have been updated, corrected or superseded since the
          snapshot was taken. The official publications and the applicable
          contract clauses always control; where anything here differs from
          them, they are right and this site is wrong.
        </p>
        <p>
          The explanations, examples, questions, practice activities, diagrams
          and definitions were written by the project to help people learn. They
          are interpretations, not official guidance, assessment objectives, or
          evidence requirements.
        </p>
      </section>

      <section aria-labelledby="warranty-title">
        <h2 id="warranty-title">No warranty.</h2>
        <p>
          The site and its content are provided “as is” and “as available”,
          without warranties of any kind, express or implied, including any
          warranty of accuracy, completeness, currency, merchantability, fitness
          for a particular purpose, or non-infringement. We do our best to keep
          the material accurate and clearly attributed, but we cannot promise it
          is free of errors or omissions, and we may change or remove any part
          of it at any time.
        </p>
      </section>

      <section aria-labelledby="results-title">
        <h2 id="results-title">No guarantee of any result.</h2>
        <p>
          Reading a lesson, completing a practice activity, or using any other
          part of this site does not mean an organization is compliant with any
          requirement, is ready for an assessment, will pass one, or will win,
          keep or perform any contract. Nothing here is a certification, score,
          attestation or assessment result.
        </p>
      </section>

      <section aria-labelledby="liability-title">
        <h2 id="liability-title">Limitation of liability.</h2>
        <p>
          To the fullest extent permitted by applicable law, the project, its
          maintainers and its contributors are not liable for any direct,
          indirect, incidental, consequential, special or other loss or damage
          of any kind arising from or related to your use of, or reliance on,
          this site or its content, including lost contracts, failed
          assessments, security incidents, or regulatory action. You use this
          site at your own risk and are solely responsible for verifying
          anything you act on against the official requirements that apply to
          you.
        </p>
      </section>

      <section aria-labelledby="links-title">
        <h2 id="links-title">Links to other sites.</h2>
        <p>
          The site links to government and third-party websites so you can read
          the originals. We do not control those sites and are not responsible
          for their content, availability or practices.
        </p>
      </section>

      <section aria-labelledby="data-title">
        <h2 id="data-title">Do not submit sensitive information.</h2>
        <p>
          The site has no accounts and never asks for information about your
          organization. Do not enter or submit Controlled Unclassified
          Information (CUI), Federal Contract Information (FCI), real evidence,
          credentials, personal data or any other protected information through
          this site, its repository, or its issue tracker. Optional learning
          progress stays in your own browser, and optional usage measurement
          never collects what you search for or answer; the “Usage &amp;
          privacy” panel at the bottom of every page explains both.
        </p>
      </section>

      <section aria-labelledby="ip-title">
        <h2 id="ip-title">Copyright and licenses.</h2>
        <p>
          The application code is released under the MIT License in the public
          repository. Works of the United States Government quoted on this site
          are in the public domain in the United States; their attribution is
          kept with each quotation, and nothing here grants rights in any
          third-party publication beyond what its owner allows. Bundled fonts
          carry their own open licenses, listed in the repository.
        </p>
      </section>

      <section aria-labelledby="changes-title">
        <h2 id="changes-title">Changes and contact.</h2>
        <p>
          These terms may change as the project evolves; the date at the top
          shows when they last did. Questions, corrections and concerns go
          through the project’s public issue tracker.
        </p>
        <a
          className="line-action"
          href={`${repositoryUrl}/issues`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open an issue on GitHub
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </section>
    </div>
  )
}

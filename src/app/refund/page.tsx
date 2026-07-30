import React from 'react';

export const metadata = {
  title: 'Refund & Cancellation Policy | VEDOXA',
  description: 'Refund, cancellation, and account-suspension terms governing the purchase and use of VEDOXA digital products.',
};

export default function RefundPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 min-h-screen text-gray-100">
      <h1 className="text-4xl font-bold mb-8 text-yellow-500">Refund & Cancellation Policy</h1>

      <div className="space-y-6 text-lg leading-relaxed text-gray-300">
        <p>Last updated: July 31, 2026</p>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-white">1. Definitions and Interpretation</h2>
          <p>
            For the purposes of this Refund and Cancellation Policy (the "Policy"), the expressions "Company," "VEDOXA," "we," "us," or "our" shall refer to VEDOXA, together with its authorized representatives, successors, and permitted assigns; the expressions "User," "you," or "your" shall refer to any natural or juristic person who accesses, browses, purchases, or otherwise avails of the Digital Products through the Platform; "Digital Product(s)" shall denote any downloadable, non-tangible electronic content, including without limitation portable document format files and electronic books, made available for purchase by the Company; and "Platform" shall denote the website, application, or other digital medium through which such Digital Products are offered, marketed, or delivered.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-white">2. Nature of Digital Products and Finality of Transactions</h2>
          <p>
            The User expressly acknowledges and agrees that all Digital Products offered by the Company are intangible in nature and are, by their inherent characteristics, incapable of physical return, exchange, or restitution in the manner customarily associated with tangible goods. Upon the successful completion of a transaction and the consequent generation, transmission, or availability of a download link or equivalent access mechanism, such transaction shall, without further act, deed, or notice, be deemed final, irrevocable, and non-cancellable in its entirety. Save and except as may be strictly and exhaustively provided under Clause 3 hereof, the Company shall be under no obligation whatsoever — whether contractual, equitable, statutory, or otherwise — to entertain, process, or honour any request for refund, reversal, chargeback, exchange, or cancellation arising subsequent to such deemed completion, howsoever such request may be characterized by the User.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-white">3. Exceptions: Limited and Exhaustive Grounds for Consideration</h2>
          <p>
            Notwithstanding the general prohibition articulated in Clause 2 above, the Company may, in its sole, absolute, and non-reviewable discretion, elect to consider a refund request where the User furnishes clear and verifiable evidence establishing one, and only one, of the following circumstances:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>
              <strong>Duplicate Deduction:</strong> the occurrence of multiple, materially identical monetary deductions in respect of the same Digital Product, processed within a temporal window not exceeding sixty (60) minutes of the originating transaction, provided that such duplication is attributable to a demonstrable technical or systemic malfunction and not to any voluntary or repeated act on the part of the User; or
            </li>
            <li>
              <strong>Non-Functional File:</strong> the delivered Digital Product is, upon diagnostic verification by the Company's technical personnel, conclusively determined to be corrupted or otherwise incapable of being accessed in its intended format, and the Company is unable, notwithstanding reasonable technical effort, to furnish a functional replacement within forty-eight (48) hours of the User's substantiated notification thereof.
            </li>
          </ul>
          <p className="mt-2">
            The burden of establishing either of the foregoing circumstances shall rest exclusively upon the User, and the Company's determination in this regard shall be final and binding.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-white">4. Suspension, Restriction, and Termination of Access</h2>
          <p>
            The Company reserves the unfettered and unilateral right, exercisable at any time, without prior notice, and without obligation to furnish reasons therefor, to suspend, restrict, disable, or permanently terminate a User's access to the Platform, any associated account, or any previously delivered Digital Product. This right may be exercised in circumstances including, without limitation, suspected fraudulent, unauthorized, or abusive conduct; violation of applicable law or of any policy promulgated by the Company; the initiation of a chargeback or payment dispute without prior recourse to the Company's support channel; or any conduct that the Company, in its reasonable commercial judgment, deems prejudicial to its interests, integrity, or operations. No refund, whether partial or in whole, shall accrue or become payable to the User as a consequence of any suspension, restriction, or termination effected pursuant to this Clause.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-white">5. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted under applicable law, the Company, together with its directors, officers, employees, and affiliates, shall not be liable for any indirect, incidental, special, consequential, or exemplary loss or damage — including, without limitation, loss of data or anticipated benefit — arising out of or in connection with the User's access to, purchase of, or inability to utilize any Digital Product, irrespective of whether the Company had been apprised of the possibility of such loss or damage.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-white">6. Governing Law and Jurisdiction</h2>
          <p>
            This Policy, and any dispute, controversy, or claim arising out of or in connection herewith, including any question regarding its existence, validity, or termination, shall be governed by and construed in accordance with the laws of India, and the courts of competent jurisdiction situated at rajasthan, India, shall have exclusive jurisdiction in relation thereto.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-white">7. Amendment of this Policy</h2>
          <p>
            The Company reserves the right to amend, revise, or supersede this Policy at any time and at its sole discretion, without prior notice to the User. Any such amendment shall take effect immediately upon publication on the Platform, and the User's continued access to or use of the Platform thereafter shall constitute deemed acceptance of the Policy as so amended.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-white">8. Severability</h2>
          <p>
            Should any provision of this Policy be held by a court or forum of competent jurisdiction to be invalid, illegal, or unenforceable, such provision shall be severed herefrom, and the remaining provisions shall continue in full force and effect, unaffected and unimpaired thereby.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-white">9. Grievance Redressal and Contact</h2>
          <p>
            For any query, grievance, or clarification pertaining to this Policy, the User may write to the Company's designated support desk at the electronic mail address indicated below, and the Company shall endeavour, on a reasonable-effort basis, to acknowledge and address such communication.
            <br />
            <strong>Email:</strong> vedoxa1@gmail.com
          </p>
        </section>
      </div>
    </div>
  );
}

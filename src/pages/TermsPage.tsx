import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Shield, AlertTriangle, CheckCircle, Users } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <FileText className="w-12 h-12 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Terms and Conditions</h1>
            <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <div className="text-gray-700 space-y-4">
                <p>
                  By accessing and using IDRHub ("the Service"), you accept and agree to be bound by 
                  the terms and provision of this agreement. If you do not agree to abide by the above, 
                  please do not use this service.
                </p>
                <p>
                  These Terms and Conditions ("Terms") govern your use of our real estate platform 
                  and services. By using our Service, you agree to these Terms in full.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="w-6 h-6 mr-2 text-blue-600" />
                2. User Accounts and Registration
              </h2>
              <div className="text-gray-700 space-y-4">
                <p>When you create an account with us, you must provide accurate and complete information:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>You are responsible for maintaining the security of your account</li>
                  <li>You must not share your account credentials with others</li>
                  <li>You are responsible for all activities that occur under your account</li>
                  <li>You must notify us immediately of any unauthorized use</li>
                  <li>We reserve the right to terminate accounts that violate these terms</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="w-6 h-6 mr-2 text-blue-600" />
                3. Acceptable Use
              </h2>
              <div className="text-gray-700 space-y-4">
                <p>You agree to use our Service only for lawful purposes and in accordance with these Terms:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Use the Service for legitimate real estate transactions</li>
                  <li>Provide accurate and truthful information</li>
                  <li>Respect the privacy and rights of other users</li>
                  <li>Comply with all applicable laws and regulations</li>
                  <li>Not engage in fraudulent or deceptive practices</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="w-6 h-6 mr-2 text-blue-600" />
                4. Prohibited Activities
              </h2>
              <div className="text-gray-700 space-y-4">
                <p>You agree not to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Use the Service for any illegal or unauthorized purpose</li>
                  <li>Harass, abuse, or harm other users</li>
                  <li>Upload or transmit viruses or malicious code</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Interfere with or disrupt the Service</li>
                  <li>Use automated systems to access the Service without permission</li>
                  <li>Post false, misleading, or fraudulent information</li>
                  <li>Violate any intellectual property rights</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Property Listings and Information</h2>
              <div className="text-gray-700 space-y-4">
                <p>Regarding property listings and information:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>We strive to provide accurate and up-to-date information</li>
                  <li>Property information is provided by agents and third parties</li>
                  <li>We do not guarantee the accuracy of all information</li>
                  <li>Users should verify information independently</li>
                  <li>We are not responsible for errors or omissions in listings</li>
                  <li>Property availability and pricing may change without notice</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Agent Services</h2>
              <div className="text-gray-700 space-y-4">
                <p>Our platform connects users with real estate agents:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Agents are independent professionals, not our employees</li>
                  <li>We do not guarantee agent performance or outcomes</li>
                  <li>Agent fees and commissions are separate from our service</li>
                  <li>We are not responsible for agent-client relationships</li>
                  <li>Users should conduct their own due diligence on agents</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Payment Terms</h2>
              <div className="text-gray-700 space-y-4">
                <p>For any paid services:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>All fees are non-refundable unless otherwise stated</li>
                  <li>Prices may change with 30 days notice</li>
                  <li>Payment is due immediately upon service activation</li>
                  <li>We use secure third-party payment processors</li>
                  <li>Failed payments may result in service suspension</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Intellectual Property</h2>
              <div className="text-gray-700 space-y-4">
                <p>Intellectual property rights:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>The Service and its content are owned by IDRHub</li>
                  <li>You may not copy, modify, or distribute our content</li>
                  <li>Property images belong to their respective owners</li>
                  <li>You retain rights to content you submit</li>
                  <li>You grant us license to use your submitted content</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Privacy and Data Protection</h2>
              <div className="text-gray-700 space-y-4">
                <p>
                  Your privacy is important to us. Our collection and use of personal information 
                  is governed by our Privacy Policy, which is incorporated into these Terms by reference.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Disclaimers</h2>
              <div className="text-gray-700 space-y-4">
                <p>The Service is provided "as is" without warranties of any kind:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>We do not guarantee uninterrupted service</li>
                  <li>We are not responsible for third-party content</li>
                  <li>We do not guarantee specific outcomes</li>
                  <li>Service may be modified or discontinued at any time</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Limitation of Liability</h2>
              <div className="text-gray-700 space-y-4">
                <p>
                  To the maximum extent permitted by law, IDRHub shall not be liable for any 
                  indirect, incidental, special, consequential, or punitive damages, including 
                  but not limited to loss of profits, data, or use, arising from your use of the Service.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Indemnification</h2>
              <div className="text-gray-700 space-y-4">
                <p>
                  You agree to indemnify and hold harmless IDRHub from any claims, damages, 
                  or expenses arising from your use of the Service or violation of these Terms.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Termination</h2>
              <div className="text-gray-700 space-y-4">
                <p>We may terminate or suspend your account at any time:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>For violation of these Terms</li>
                  <li>For fraudulent or illegal activity</li>
                  <li>At your request</li>
                  <li>For any other reason at our discretion</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Governing Law</h2>
              <div className="text-gray-700 space-y-4">
                <p>
                  These Terms shall be governed by and construed in accordance with the laws 
                  of the jurisdiction in which IDRHub operates, without regard to conflict of law principles.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. Changes to Terms</h2>
              <div className="text-gray-700 space-y-4">
                <p>
                  We reserve the right to modify these Terms at any time. We will notify users 
                  of material changes by posting the new Terms on this page. Your continued use 
                  of the Service after such changes constitutes acceptance of the new Terms.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">16. Contact Information</h2>
              <div className="text-gray-700 space-y-4">
                <p>If you have questions about these Terms, please contact us:</p>
                <div className="mt-4 space-y-2">
                  <p><strong>Email:</strong> legal@idrhub.com</p>
                  <p><strong>Phone:</strong> (555) 123-4567</p>
                  <p><strong>Address:</strong> 123 Real Estate Ave, City, ST 12345</p>
                </div>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}; 
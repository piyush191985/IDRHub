import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, Lock, Users, Database, Globe, Bell } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
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
              <Shield className="w-12 h-12 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Eye className="w-6 h-6 mr-2 text-blue-600" />
                Information We Collect
              </h2>
              <div className="space-y-4 text-gray-700">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Personal Information</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Name, email address, and phone number when you create an account</li>
                    <li>Property preferences and search criteria</li>
                    <li>Messages and inquiries sent to agents</li>
                    <li>Tour scheduling information</li>
                    <li>Payment information (processed securely through third-party providers)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Usage Information</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Property views and interactions</li>
                    <li>Search queries and filters used</li>
                    <li>Device information and browser type</li>
                    <li>IP address and location data</li>
                    <li>Cookies and similar tracking technologies</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Database className="w-6 h-6 mr-2 text-blue-600" />
                How We Use Your Information
              </h2>
              <div className="space-y-4 text-gray-700">
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide and maintain our real estate platform services</li>
                  <li>Connect you with agents and facilitate property tours</li>
                  <li>Send you relevant property listings and market updates</li>
                  <li>Process payments and transactions</li>
                  <li>Improve our services and user experience</li>
                  <li>Comply with legal obligations and prevent fraud</li>
                  <li>Send important service notifications and updates</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="w-6 h-6 mr-2 text-blue-600" />
                Information Sharing
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>We may share your information in the following circumstances:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>With Agents:</strong> Your contact information and property preferences may be shared with agents to facilitate property viewings and inquiries</li>
                  <li><strong>Service Providers:</strong> We work with trusted third-party services for payment processing, analytics, and customer support</li>
                  <li><strong>Legal Requirements:</strong> We may disclose information when required by law or to protect our rights and safety</li>
                  <li><strong>Business Transfers:</strong> In the event of a merger or acquisition, your information may be transferred to the new entity</li>
                </ul>
                <p className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <strong>We do not sell your personal information to third parties.</strong>
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Lock className="w-6 h-6 mr-2 text-blue-600" />
                Data Security
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>We implement appropriate security measures to protect your personal information:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security assessments and updates</li>
                  <li>Access controls and authentication measures</li>
                  <li>Secure hosting and infrastructure</li>
                  <li>Employee training on data protection</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Globe className="w-6 h-6 mr-2 text-blue-600" />
                Your Rights
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>Depending on your location, you may have the following rights:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Access:</strong> Request a copy of your personal information</li>
                  <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                  <li><strong>Portability:</strong> Receive your data in a portable format</li>
                  <li><strong>Objection:</strong> Object to certain processing activities</li>
                  <li><strong>Restriction:</strong> Limit how we process your information</li>
                </ul>
                <p className="mt-4">
                  To exercise these rights, please contact us at{' '}
                  <a href="mailto:privacy@idrhub.com" className="text-blue-600 hover:text-blue-700">
                    privacy@idrhub.com
                  </a>
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Bell className="w-6 h-6 mr-2 text-blue-600" />
                Cookies and Tracking
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>We use cookies and similar technologies to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Remember your preferences and settings</li>
                  <li>Analyze website usage and performance</li>
                  <li>Provide personalized content and recommendations</li>
                  <li>Ensure security and prevent fraud</li>
                </ul>
                <p className="mt-4">
                  You can control cookie settings through your browser preferences. 
                  Note that disabling certain cookies may affect website functionality.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Children's Privacy</h2>
              <div className="text-gray-700">
                <p>
                  Our services are not intended for children under 13 years of age. 
                  We do not knowingly collect personal information from children under 13. 
                  If you believe we have collected information from a child under 13, 
                  please contact us immediately.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to This Policy</h2>
              <div className="text-gray-700">
                <p>
                  We may update this Privacy Policy from time to time. We will notify you 
                  of any material changes by posting the new policy on this page and updating 
                  the "Last updated" date. Your continued use of our services after such 
                  changes constitutes acceptance of the updated policy.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
              <div className="text-gray-700">
                <p>If you have any questions about this Privacy Policy, please contact us:</p>
                <div className="mt-4 space-y-2">
                  <p><strong>Email:</strong> privacy@idrhub.com</p>
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
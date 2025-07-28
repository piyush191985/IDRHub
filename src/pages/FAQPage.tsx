import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, HelpCircle, Search, MessageCircle, Calendar, DollarSign, Shield } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export const FAQPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const faqData: FAQItem[] = [
    // General Questions
    {
      question: "How do I create an account on IDRHub?",
      answer: "Creating an account is simple! Click the 'Sign Up' button in the top right corner, fill in your details including name, email, and password, and you'll be ready to start browsing properties in minutes.",
      category: "general"
    },
    {
      question: "Is IDRHub free to use?",
      answer: "Yes, IDRHub is completely free for buyers and renters. You can browse properties, save favorites, contact agents, and schedule tours at no cost. Some premium features may have associated fees.",
      category: "general"
    },
    {
      question: "How do I search for properties?",
      answer: "Use our advanced search filters to find properties by location, price range, number of bedrooms/bathrooms, property type, and more. You can also save your search criteria for future use.",
      category: "general"
    },

    // Property Tours
    {
      question: "How do I schedule a property tour?",
      answer: "On any property page, click the 'Schedule Tour' button. You'll be able to select a date and time that works for you. The agent will be notified and can confirm the appointment.",
      category: "tours"
    },
    {
      question: "Can I cancel or reschedule a tour?",
      answer: "Yes, you can cancel or reschedule tours through your account dashboard. We recommend giving at least 24 hours notice to the agent out of courtesy.",
      category: "tours"
    },
    {
      question: "What should I bring to a property tour?",
      answer: "Bring a valid ID, a list of questions for the agent, and any relevant documents if you're seriously considering the property. You may also want to take photos and notes during the tour.",
      category: "tours"
    },

    // Agents and Communication
    {
      question: "How do I contact an agent?",
      answer: "You can contact agents directly through our messaging system, by phone, or email. Each property page shows the listing agent's contact information and preferred communication method.",
      category: "agents"
    },
    {
      question: "Are all agents on IDRHub verified?",
      answer: "All agents on IDRHub are verified and licensed. You can read reviews from previous clients, check their credentials, and see their transaction history to make an informed decision.",
      category: "agents"
    },
    {
      question: "How do I know if an agent is trustworthy?",
      answer: "All agents on IDRHub are verified and licensed. You can read reviews from previous clients, check their credentials, and see their transaction history to make an informed decision.",
      category: "agents"
    },

    // Buying Process
    {
      question: "What documents do I need to buy a house?",
      answer: "You'll typically need proof of income, bank statements, tax returns, and identification. Your agent can provide a complete list based on your specific situation and financing method.",
      category: "buying"
    },
    {
      question: "How much should I save for a down payment?",
      answer: "Traditional mortgages typically require 20% down, but there are programs available for as little as 3-5% down. Your agent can help you explore different financing options.",
      category: "buying"
    },
    {
      question: "What are closing costs?",
      answer: "Closing costs typically range from 2-5% of the home price and include fees for appraisal, title insurance, loan origination, and other services. Your agent can provide a detailed breakdown.",
      category: "buying"
    },

    // Selling Process
    {
      question: "How do I list my property for sale?",
      answer: "Contact an IDRHub agent to list your property. They'll help you determine the right price, prepare your home for sale, and market it effectively to potential buyers.",
      category: "selling"
    },
    {
      question: "How long does it take to sell a house?",
      answer: "The time to sell varies based on market conditions, property condition, and pricing strategy. On average, homes sell within 30-60 days, but this can vary significantly by location and market.",
      category: "selling"
    },
    {
      question: "What are the costs of selling a house?",
      answer: "Selling costs typically include agent commissions (5-6%), closing costs, repairs, and staging. Your agent can provide a detailed estimate based on your specific situation.",
      category: "selling"
    },

    // Technical Support
    {
      question: "I forgot my password. How do I reset it?",
      answer: "Click the 'Forgot Password' link on the sign-in page. Enter your email address and we'll send you a secure link to reset your password.",
      category: "technical"
    },
    {
      question: "How do I update my profile information?",
      answer: "Go to your account settings by clicking on your profile picture in the top right corner. You can update your contact information, preferences, and account settings there.",
      category: "technical"
    },
    {
      question: "The website isn't working properly. What should I do?",
      answer: "Try refreshing the page or clearing your browser cache. If the problem persists, contact our support team at support@idrhub.com with details about the issue you're experiencing.",
      category: "technical"
    }
  ];

  const categories = [
    { key: 'all', label: 'All Questions', icon: HelpCircle },
    { key: 'general', label: 'General', icon: HelpCircle },
    { key: 'tours', label: 'Property Tours', icon: Calendar },
    { key: 'agents', label: 'Agents', icon: MessageCircle },
    { key: 'buying', label: 'Buying', icon: DollarSign },
    { key: 'selling', label: 'Selling', icon: Shield },
    { key: 'technical', label: 'Technical', icon: Shield },
  ];

  const filteredFAQs = faqData.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-gray-900 mb-4"
            >
              Frequently Asked Questions
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-gray-600 max-w-2xl mx-auto"
            >
              Find answers to common questions about our real estate platform, 
              property tours, agents, and the buying/selling process.
            </motion.p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category.key}
                onClick={() => setActiveCategory(category.key)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeCategory === category.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <category.icon className="w-4 h-4" />
                <span>{category.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* FAQ Items */}
        <div className="max-w-4xl mx-auto">
          <AnimatePresence>
            {filteredFAQs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 mb-4 overflow-hidden"
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </h3>
                  {openItems.has(index) ? (
                    <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                <AnimatePresence>
                  {openItems.has(index) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-4 text-gray-600 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* No Results */}
          {filteredFAQs.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
              <p className="text-gray-600">
                Try adjusting your search terms or browse all questions to find what you're looking for.
              </p>
            </motion.div>
          )}
        </div>

        {/* Contact Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <div className="bg-blue-50 rounded-xl p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Still have questions?
            </h3>
            <p className="text-gray-600 mb-6">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@idrhub.com"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Contact Support</span>
              </a>
              <a
                href="/contact"
                className="inline-flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                <span>Visit Contact Page</span>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}; 
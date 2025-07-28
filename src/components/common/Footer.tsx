import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Home className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">IDRHub</span>
            </Link>
            <p className="text-gray-400 text-sm">
              Your trusted partner in finding the perfect property. 
              Connecting buyers, sellers, and agents with cutting-edge technology.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/properties" className="text-gray-400 hover:text-white transition-colors">
                  Browse Properties
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-gray-400 hover:text-white transition-colors">
                  Advanced Search
                </Link>
              </li>
              <li>
                <Link to="/agents" className="text-gray-400 hover:text-white transition-colors">
                  Find Agents
                </Link>
              </li>
              <li>
                <Link to="/calculator" className="text-gray-400 hover:text-white transition-colors">
                  Mortgage Calculator
                </Link>
              </li>
              <li>
                <Link to="/market-trends" className="text-gray-400 hover:text-white transition-colors">
                  Market Trends
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/buy" className="text-gray-400 hover:text-white transition-colors">
                  Buy Property
                </Link>
              </li>
              <li>
                <Link to="/sell" className="text-gray-400 hover:text-white transition-colors">
                  Sell Property
                </Link>
              </li>
              <li>
                <Link to="/rent" className="text-gray-400 hover:text-white transition-colors">
                  Rent Property
                </Link>
              </li>
              <li>
                <Link to="/valuation" className="text-gray-400 hover:text-white transition-colors">
                  Property Valuation
                </Link>
              </li>
              <li>
                <Link to="/investment" className="text-gray-400 hover:text-white transition-colors">
                  Investment Analysis
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400 text-sm">
                  123 Real Estate Ave, City, ST 12345
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400 text-sm">
                  (555) 123-4567
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400 text-sm">
                  info@idrhub.com
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 IDRHub. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
              Terms of Service
            </Link>
            <Link to="/faq" className="text-gray-400 hover:text-white text-sm transition-colors">
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, Tag, ArrowRight, Search, Filter } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  category: string;
  image: string;
  readTime: number;
}

export const BlogPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const blogPosts: BlogPost[] = [
    {
      id: '1',
      title: 'First-Time Homebuyer Guide: Everything You Need to Know',
      excerpt: 'Buying your first home can be overwhelming. This comprehensive guide covers everything from saving for a down payment to closing the deal.',
      content: 'Full article content would go here...',
      author: 'Sarah Johnson',
      publishedAt: '2024-01-15',
      category: 'buying',
      image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
      readTime: 8
    },
    {
      id: '2',
      title: '2024 Real Estate Market Trends: What to Expect',
      excerpt: 'Stay ahead of the curve with our analysis of the latest real estate market trends and predictions for the coming year.',
      content: 'Full article content would go here...',
      author: 'Michael Chen',
      publishedAt: '2024-01-10',
      category: 'market',
      image: 'https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg?auto=compress&cs=tinysrgb&w=800',
      readTime: 6
    },
    {
      id: '3',
      title: 'How to Stage Your Home for Maximum Appeal',
      excerpt: 'Learn professional staging techniques that can help your home sell faster and for more money.',
      content: 'Full article content would go here...',
      author: 'Emily Rodriguez',
      publishedAt: '2024-01-08',
      category: 'selling',
      image: 'https://images.pexels.com/photos/1571461/pexels-photo-1571461.jpeg?auto=compress&cs=tinysrgb&w=800',
      readTime: 5
    },
    {
      id: '4',
      title: 'Understanding Mortgage Rates: A Complete Guide',
      excerpt: 'Mortgage rates can significantly impact your home buying power. Learn how rates work and when to lock in your rate.',
      content: 'Full article content would go here...',
      author: 'David Wilson',
      publishedAt: '2024-01-05',
      category: 'financing',
      image: 'https://images.pexels.com/photos/1571462/pexels-photo-1571462.jpeg?auto=compress&cs=tinysrgb&w=800',
      readTime: 7
    },
    {
      id: '5',
      title: 'Investment Properties: Building Wealth Through Real Estate',
      excerpt: 'Discover strategies for building a real estate investment portfolio and generating passive income.',
      content: 'Full article content would go here...',
      author: 'Lisa Thompson',
      publishedAt: '2024-01-03',
      category: 'investment',
      image: 'https://images.pexels.com/photos/1571463/pexels-photo-1571463.jpeg?auto=compress&cs=tinysrgb&w=800',
      readTime: 10
    },
    {
      id: '6',
      title: 'Neighborhood Spotlight: Downtown Living',
      excerpt: 'Explore the benefits and lifestyle of downtown living, from walkability to amenities and community.',
      content: 'Full article content would go here...',
      author: 'Alex Martinez',
      publishedAt: '2024-01-01',
      category: 'lifestyle',
      image: 'https://images.pexels.com/photos/1571464/pexels-photo-1571464.jpeg?auto=compress&cs=tinysrgb&w=800',
      readTime: 4
    }
  ];

  const categories = [
    { key: 'all', label: 'All Articles' },
    { key: 'buying', label: 'Buying' },
    { key: 'selling', label: 'Selling' },
    { key: 'market', label: 'Market Trends' },
    { key: 'financing', label: 'Financing' },
    { key: 'investment', label: 'Investment' },
    { key: 'lifestyle', label: 'Lifestyle' }
  ];

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
              Real Estate Blog & News
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-gray-600 max-w-2xl mx-auto"
            >
              Stay informed with the latest real estate insights, market trends, 
              and expert advice from our team of professionals.
            </motion.p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.key}
                  onClick={() => setSelectedCategory(category.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Post */}
        {filteredPosts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="relative h-64 lg:h-full">
                  <img
                    src={filteredPosts[0].image}
                    alt={filteredPosts[0].title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-8">
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                      {filteredPosts[0].category.charAt(0).toUpperCase() + filteredPosts[0].category.slice(1)}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(filteredPosts[0].publishedAt)}
                    </span>
                    <span className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {filteredPosts[0].author}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {filteredPosts[0].title}
                  </h2>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {filteredPosts[0].excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {filteredPosts[0].readTime} min read
                    </span>
                    <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium">
                      <span>Read More</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.slice(1).map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="relative h-48">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                    {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(post.publishedAt)}
                  </span>
                  <span className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    {post.author}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {post.readTime} min read
                  </span>
                  <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium">
                    <span>Read More</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* No Results */}
        {filteredPosts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-600">
              Try adjusting your search terms or browse all articles to find what you're looking for.
            </p>
          </motion.div>
        )}

        {/* Newsletter Signup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 bg-blue-50 rounded-xl p-8 text-center"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Stay Updated with Our Newsletter
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Get the latest real estate insights, market updates, and expert advice 
            delivered directly to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Subscribe
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}; 
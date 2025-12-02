'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import api from '../../../lib/api';

// Dynamically import components with SSR disabled
const StarsWrapper = dynamic(
  () => import('@/components/canvas/StarsWrapper'),
  { ssr: false, loading: () => <div className="fixed inset-0 bg-black z-0" /> }
);

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ success: null, message: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await api.post('/api/contact', formData);
      const data = response.data;
      
      setSubmitStatus({
        success: true,
        message: data.message || 'Your message has been sent successfully! We\'ll get back to you soon.'
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus({ success: null, message: '' });
      }, 5000);
      
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send message. Please try again later or contact us directly at quincin2000@planetqproductions.com';
      setSubmitStatus({
        success: false,
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <StarsWrapper />
      
      <div className="relative z-10 container mx-auto px-4 py-16">
        <motion.header 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600">
            Contact Us
          </h1>
          <p className="text-xl text-gray-300">
            Have questions? We'd love to hear from you.
          </p>
        </motion.header>

        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="grid md:grid-cols-2 gap-12 mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div>
              <h2 className="text-2xl font-bold mb-6 text-cyan-400">Get in Touch</h2>
              <p className="text-gray-300 mb-8">
                Whether you have questions about our radio stations, want to submit your music, or just want to say hello, we're here to help. Fill out the form or use the contact information below.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-cyan-900/50 flex items-center justify-center text-cyan-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-white">Email</h3>
                    <p className="text-gray-400">quincin2000@planetqproductions.com</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-cyan-900/50 flex items-center justify-center text-cyan-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-white">Location</h3>
                    <p className="text-gray-400">USA</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-cyan-900/50 flex items-center justify-center text-cyan-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-white">Business Hours</h3>
                    <p className="text-gray-400">Monday - Friday: 9:00 AM - 6:00 PM EST</p>
                    <p className="text-gray-400">Saturday: 10:00 AM - 4:00 PM EST</p>
                    <p className="text-gray-400">Sunday: Closed</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <h3 className="text-lg font-medium text-white mb-4">Follow Us</h3>
                <div className="flex space-x-4">
                  {[
                    { name: 'Twitter', icon: '🐦', url: '#' },
                    { name: 'Instagram', icon: '📸', url: '#' },
                    { name: 'Facebook', icon: '👍', url: '#' },
                    { name: 'YouTube', icon: '▶️', url: '#' },
                  ].map((social, index) => (
                    <a 
                      key={index} 
                      href={social.url} 
                      className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-xl hover:bg-cyan-900/50 hover:text-cyan-400 transition-colors"
                      aria-label={social.name}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-gray-900 bg-opacity-70 backdrop-blur-md p-8 rounded-xl border border-gray-800">
              <h2 className="text-2xl font-bold mb-6 text-cyan-400">Send Us a Message</h2>
              
              {submitStatus.message && (
                <div className={`p-4 mb-6 rounded-lg ${submitStatus.success ? 'bg-green-900/50 border border-green-800' : 'bg-red-900/50 border border-red-800'}`}>
                  {submitStatus.message}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-gray-500"
                    placeholder="Your name"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-gray-500"
                    placeholder="your.email@example.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-1">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-gray-500"
                    placeholder="What's this about?"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-gray-500"
                    placeholder="Your message here..."
                  ></textarea>
                </div>
                
                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : 'Send Message'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>

        {/* Navigation */}
        <nav className="mt-12 flex justify-center gap-8">
          <a href="/radio" className="text-gray-300 hover:text-cyan-400 transition-colors">Home</a>
          <a href="/radio/faqs" className="text-gray-300 hover:text-cyan-400 transition-colors">FAQs</a>
          <a href="/radio/about" className="text-gray-300 hover:text-cyan-400 transition-colors">About</a>
        </nav>
      </div>
    </div>
  );
};

export default ContactPage;

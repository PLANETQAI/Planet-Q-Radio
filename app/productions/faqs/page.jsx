'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const FAQItem = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className="border-b border-gray-800 last:border-0">
      <button
        onClick={onClick}
        className="w-full text-left py-6 px-4 focus:outline-none group"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg md:text-xl font-medium text-white group-hover:text-cyan-400 transition-colors">
            {question}
          </h3>
          <div className="ml-4">
            <svg
              className={`w-6 h-6 text-cyan-500 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="py-4 text-gray-300">
                {answer}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
};

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: 'What is Planet Q Radio?',
      answer: 'Planet Q Radio is the Sci-Fi Channel of Hip Hop and R&B, bringing you the latest and greatest in urban music with a futuristic twist. We feature a curated selection of tracks from both established and emerging artists.',
    },
    {
      question: 'How can I listen to Planet Q Radio?',
      answer: 'You can listen to Planet Q Radio directly on our website or through our mobile app (coming soon). Just visit our homepage and click play on your favorite station.',
    },
    {
      question: 'Is Planet Q Radio free to listen to?',
      answer: 'Yes, Planet Q Radio is completely free to listen to. We may introduce premium features in the future, but the core listening experience will always remain free.',
    },
    {
      question: 'Can I request songs on Planet Q Radio?',
      answer: 'Currently, we don\'t take individual song requests, but we do take genre and artist suggestions into consideration for our programming. Follow us on social media for updates on potential request features.',
    },
    {
      question: 'How can I get my music played on Planet Q Radio?',
      answer: 'We\'re always looking for fresh talent! You can submit your music through our contact form with "Music Submission" as the subject. Our team reviews all submissions and will get back to you if we\'re interested in featuring your work.',
    },
    {
      question: 'What makes Planet Q Radio different from other online radio stations?',
      answer: 'Planet Q Radio combines cutting-edge urban music with a sci-fi aesthetic, creating a unique listening experience. Our carefully curated playlists and high-quality streams set us apart from the competition.',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div 
        className="text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600">
          Frequently Asked Questions
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Everything you need to know about Planet Q Radio. Can't find the answer you're looking for?{' '}
          <Link href="/radio/contact" className="text-cyan-400 hover:text-cyan-300 transition-colors">
            Contact us!
          </Link>
        </p>
      </motion.div>

      <motion.div 
        className="max-w-4xl mx-auto bg-gray-900 bg-opacity-70 backdrop-blur-md rounded-xl overflow-hidden border border-gray-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {faqs.map((faq, index) => (
          <FAQItem
            key={index}
            question={faq.question}
            answer={faq.answer}
            isOpen={openIndex === index}
            onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
          />
        ))}
      </motion.div>
    </div>
  );
};

export default FAQPage;

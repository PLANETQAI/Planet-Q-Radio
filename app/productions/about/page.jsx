'use client';

import RotatingCoin from '../_components/RotatingCoin';
import { motion } from 'framer-motion';
import Link from 'next/link';

const AboutPage = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600">
            About Planet Q Productions
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            The Birth of Futuristic Hip Hop
          </p>
        </motion.div>

        <motion.div
          className="max-w-5xl mx-auto"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.section className="mb-20" variants={fadeIn}>
            <h2 className="text-3xl font-bold mb-6 text-cyan-400">The Past</h2>
            <div className="bg-gray-900 bg-opacity-70 backdrop-blur-md p-8 rounded-xl border border-gray-800">
              <p className="mb-6 text-lg">
                In 2006, a new universe opened its doors to the music world: Planet Q Productions, founded by the trailblazing producer Quincin "Que" Williams.
              </p>
              <p className="mb-6 text-lg">
                At a time when only a few artists dared to glance into the future through their lyrics, Que saw a bigger destiny — one that would fuse hip hop and science fiction into a brand-new genre: Futuristic Hip Hop.
              </p>
              <blockquote className="border-l-4 border-cyan-500 pl-6 my-8 italic text-cyan-300">
                "He didn't just write about the future — he built it into the music."
              </blockquote>
              <p className="mb-6 text-lg">
                The inspiration struck while Que was staring at the cover of a Neptunes album (featuring Pharrell Williams and Chad Hugo) and listening to Nas's "A New World". A vision crystalized: music could be a vehicle for time travel.
              </p>
              <p className="mb-6 text-lg">
                From 2001 until the devastation of Hurricane Katrina in 2005, Que worked tirelessly to create what would become the platinum-selling album, Soul Cries — an emotional, forward-looking masterpiece.
              </p>
              <p className="mb-6 text-lg">
                Armed with nothing but talent, hustle, and an 18-wheeler, Que crisscrossed the country, selling CDs at truck stops. His gritty DIY ethic laid the foundation for a loyal following and an unstoppable movement.
              </p>
              <p className="text-lg">
                Today, Soul Cries remains a streaming staple on Spotify and other major platforms — a timeless echo of one man's dream to hear the echoes of the future now.
              </p>
            </div>
          </motion.section>

          <motion.section className="mb-20" variants={fadeIn}>
            <h2 className="text-3xl font-bold mb-6 text-cyan-400">The Present: Welcome to Artificial Intelligence</h2>
            <h3 className="text-2xl font-semibold mb-4 text-purple-400">Building the Blueprint for AI</h3>
            <div className="bg-gray-900 bg-opacity-70 backdrop-blur-md p-8 rounded-xl border border-gray-800">
              <p className="mb-6 text-lg">
                By 2012, while social media crumbled and MySpace faded into digital memory, Que was quietly mastering a new craft: coding.
              </p>
              <p className="mb-6 text-lg">
                Using Bryce, Maya, Unreal Engine and the Unity game engine, he engineered the early algorithms that would form the bedrock of today's artificial intelligence revolution.
              </p>
              <blockquote className="border-l-4 border-purple-500 pl-6 my-8 italic text-purple-300">
                "He didn't wait for the future. He created it."
              </blockquote>
              <p className="mb-6 text-lg">
                Through his experiments, Que gave birth to an AI audio player capable of learning and evolving on its own. It wasn't long before he realized he was onto something groundbreaking.
              </p>
              <p className="mb-6 text-lg">
                Hiring a network of developers across the globe, some of whom would later work at Google, OpenAI and Suno, Que's influence quietly seeped into the mainstream. He built the blueprint before the world even had a name for it.
              </p>
              <p className="text-lg">
                Although fame eluded him, the satisfaction of changing the world in silence is a badge of honor he wears with pride.
              </p>
            </div>
          </motion.section>

          <motion.section variants={fadeIn}>
            <h2 className="text-3xl font-bold mb-6 text-cyan-400">The Future: A Forever Broadcast</h2>
            <div className="bg-gray-900 bg-opacity-70 backdrop-blur-md p-8 rounded-xl border border-gray-800">
              <p className="mb-6 text-lg">
                Looking beyond today's horizon, Quincin "Que" Williams dreams of a forever radio station powered by solar and lunar energy, manned by AI DJs who generate their own music, stories, and holographic shows.
              </p>
              <p className="mb-6 text-lg">
                Using hologram technology, this eternal station will broadcast futuristic hip hop to any civilization that calls Earth home — now or millions of years into the future.
              </p>
              <p className="mb-8 text-lg">
                Planet Q Productions is not just about music anymore — it's about legacy, innovation, and the never-ending pursuit of a sound not yet heard by human ears.
              </p>
              
              <div className="text-center my-12">
                <blockquote className="text-2xl font-bold text-yellow-400 mb-8">
                  "As long as the Sun and Moon exist, Planet Q will sing on."
                </blockquote>
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                    Be Part Of The Future
                  </h3>
                  
                  {/* Rotating Coin */}
                  <RotatingCoin 
                    src="/images/coin.gif" 
                    alt="Planet Q Crypto Coin" 
                  />
                  
                  <button className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-full hover:opacity-90 transition-all transform hover:scale-105">
                    Invest In Our Crypto Coin
                  </button>
                </div>
              </div>
            </div>
          </motion.section>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutPage;

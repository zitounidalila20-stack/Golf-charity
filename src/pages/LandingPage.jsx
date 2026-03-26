import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, Trophy, Users, TrendingUp } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-indigo-50">
      {/* Hero Section - Emotional Impact First */}
      <section className="relative overflow-hidden">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-7xl mx-auto px-4 py-20"
        >
          <div className="text-center">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 mb-8"
            >
              <Heart className="w-5 h-5 text-rose-500" />
              <span className="text-sm font-medium">Making Golf Matter</span>
            </motion.div>
            
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-rose-600 to-indigo-600 bg-clip-text text-transparent"
            >
              Turn Your Game Into
              <br />
              Life-Changing Impact
            </motion.h1>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
            >
              Every swing helps a cause. Every score enters you to win. 
              Golf with purpose, win with impact.
            </motion.p>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex gap-4 justify-center"
            >
              <Link 
                to="/pricing"
                className="px-8 py-4 bg-gradient-to-r from-rose-600 to-indigo-600 text-white rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
              >
                Start Making Impact →
              </Link>
              <Link 
                to="/how-it-works"
                className="px-8 py-4 bg-white text-gray-800 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
              >
                How It Works
              </Link>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Impact Stats */}
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Heart, label: "Charity Impact", value: "$2.3M+", desc: "Donated to causes" },
              { icon: Trophy, label: "Monthly Prizes", value: "$50K+", desc: "Awarded to winners" },
              { icon: Users, label: "Active Golfers", value: "5,000+", desc: "Making a difference" }
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 + idx * 0.1 }}
                className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 text-center"
              >
                <stat.icon className="w-12 h-12 mx-auto text-rose-500 mb-4" />
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-gray-600">{stat.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Featured Charity Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            Featured <span className="text-rose-600">Charity</span>
          </h2>
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-r from-rose-50 to-indigo-50 rounded-3xl p-8"
          >
            {/* Charity spotlight content */}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
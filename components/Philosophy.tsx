'use client'

import { motion } from 'framer-motion'
import { Brain, Sparkles, Zap } from 'lucide-react'

const philosophies = [
  {
    icon: Brain,
    title: 'Product Sense',
    description: 'Deep understanding of user needs, market dynamics, and business goals to build products that matter.',
    color: 'from-cyan-400 to-cyan-600'
  },
  {
    icon: Sparkles,
    title: 'Prompt Engineering',
    description: 'Mastering AI tools and LLMs to accelerate development, enhance creativity, and unlock new possibilities.',
    color: 'from-purple-400 to-purple-600'
  },
  {
    icon: Zap,
    title: 'Vibe Execution',
    description: 'Rapid prototyping, aesthetic excellence, and flawless delivery—turning vision into reality with style.',
    color: 'from-pink-400 to-pink-600'
  }
]

export const Philosophy = () => {
  return (
    <section id="philosophy" className="py-24 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
              Vibe Coding
            </span>
            <span className="text-white"> Philosophy</span>
          </h2>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
            Three pillars that define how I build products at the intersection of AI and human creativity.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {philosophies.map((philosophy, index) => (
            <PhilosophyCard
              key={philosophy.title}
              {...philosophy}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

const PhilosophyCard = ({
  icon: Icon,
  title,
  description,
  color,
  index
}: {
  icon: any
  title: string
  description: string
  color: string
  index: number
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.2 }}
      whileHover={{ y: -8 }}
      className="group relative"
    >
      <div className={`absolute inset-0 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-20 rounded-3xl blur-xl transition-opacity duration-500`} />
      
      <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 h-full transition-all duration-300 group-hover:border-white/20">
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-8 h-8 text-white" />
        </div>

        <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
        <p className="text-neutral-400 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  )
}

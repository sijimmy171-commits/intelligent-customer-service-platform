'use client'

import { motion } from 'framer-motion'
import { ArrowRight, MousePointerClick, Image, Code, Terminal } from 'lucide-react'

const projects = [
  {
    title: 'AI Design Studio',
    description: 'An AI-powered design tool that generates UI components from natural language descriptions.',
    tags: ['Cursor', 'Midjourney', 'React'],
    icon: Image,
    size: 'large'
  },
  {
    title: 'Prompt Master',
    description: 'A prompt engineering platform with real-time LLM response visualization.',
    tags: ['GPT-4', 'Tailwind', 'Next.js'],
    icon: Terminal,
    size: 'small'
  },
  {
    title: 'Product Mind',
    description: 'AI-assisted product strategy and roadmap generation tool.',
    tags: ['Claude', 'Framer', 'TypeScript'],
    icon: MousePointerClick,
    size: 'small'
  },
  {
    title: 'Code Vibe',
    description: 'AI-powered code generation with aesthetically pleasing UI templates.',
    tags: ['GitHub Copilot', 'React', 'Tailwind'],
    icon: Code,
    size: 'large'
  }
]

export const Projects = () => {
  return (
    <section id="projects" className="py-24 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-white">Selected</span>
            <span className="bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
              {' '}Projects
            </span>
          </h2>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
            A curated collection of products built with AI-powered creativity and engineering excellence.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[300px]">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.title}
              {...project}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

const ProjectCard = ({
  title,
  description,
  tags,
  icon: Icon,
  size,
  index
}: {
  title: string
  description: string
  tags: string[]
  icon: any
  size: 'large' | 'small'
  index: number
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.15 }}
      className={`group relative ${
        size === 'large' ? 'md:col-span-2 md:row-span-2' : ''
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-600 opacity-0 group-hover:opacity-20 rounded-3xl blur-xl transition-opacity duration-500" />
      
      <div className="relative h-full bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 transition-all duration-300 group-hover:border-white/20 flex flex-col overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-cyan-400/10 to-purple-600/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
        
        <div className="relative z-10">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-400 to-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <Icon className="w-6 h-6 text-white" />
          </div>

          <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
            {title}
          </h3>
          
          <p className="text-neutral-400 mb-6 flex-grow">{description}</p>

          <div className="flex flex-wrap gap-2 mb-6">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-neutral-300"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="font-medium">查看详情</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

'use client'

import { motion } from 'framer-motion'
import { Github, Linkedin, Twitter, Copy, Check } from 'lucide-react'
import { useState } from 'react'

export const Footer = () => {
  const [copied, setCopied] = useState(false)

  const copyEmail = () => {
    navigator.clipboard.writeText('hello@vibecoder.com')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <footer id="footer" className="py-24 px-6 relative">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            Let's build the
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
              future together.
            </span>
          </h2>

          <p className="text-xl text-neutral-400 mb-12 max-w-2xl mx-auto">
            Looking for an AI Product Manager who can turn ideas into reality with style and speed? Let's connect.
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={copyEmail}
            className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl overflow-hidden mb-12"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-600 opacity-20 group-hover:opacity-30 transition-opacity" />
            <div className="absolute inset-0 border border-cyan-400/50 rounded-2xl" />
            <div className="relative flex items-center gap-3">
              <span className="font-semibold text-white">hello@vibecoder.com</span>
              {copied ? (
                <Check className="w-5 h-5 text-green-400" />
              ) : (
                <Copy className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors" />
              )}
            </div>
          </motion.button>

          <div className="flex items-center justify-center gap-6">
            <SocialLink icon={Github} href="#" label="GitHub" />
            <SocialLink icon={Linkedin} href="#" label="LinkedIn" />
            <SocialLink icon={Twitter} href="#" label="X" />
          </div>

          <div className="mt-16 pt-8 border-t border-white/10">
            <p className="text-neutral-500 text-sm">
              © {new Date().getFullYear()} Vibe Coder. Built with AI &amp; love.
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}

const SocialLink = ({ icon: Icon, href, label }: { icon: any; href: string; label: string }) => (
  <motion.a
    href={href}
    whileHover={{ y: -4, color: '#22d3ee' }}
    whileTap={{ scale: 0.95 }}
    className="text-neutral-400 hover:text-white transition-colors"
  >
    <Icon className="w-6 h-6" />
    <span className="sr-only">{label}</span>
  </motion.a>
)

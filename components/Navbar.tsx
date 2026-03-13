'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useState, useEffect } from 'react'

export const Navbar = () => {
  const { scrollY } = useScroll()
  const [isScrolled, setIsScrolled] = useState(false)

  const opacity = useTransform(scrollY, [0, 100], [1, 0.8])
  const scale = useTransform(scrollY, [0, 100], [1, 0.95])

  useEffect(() => {
    const unsubscribe = scrollY.onChange((latest) => {
      setIsScrolled(latest > 50)
    })
    return () => unsubscribe()
  }, [scrollY])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <motion.nav
      style={{ opacity, scale }}
      className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300 ${
        isScrolled ? 'py-2' : 'py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-3 flex items-center justify-between">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent cursor-pointer"
            onClick={() => scrollToSection('hero')}
          >
            Vibe.Coder
          </motion.div>

          <div className="hidden md:flex items-center gap-8">
            <NavLink onClick={() => scrollToSection('about')} label="关于" />
            <NavLink onClick={() => scrollToSection('philosophy')} label="理念" />
            <NavLink onClick={() => scrollToSection('projects')} label="项目" />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-purple-600 text-white font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all"
          >
            简历
          </motion.button>
        </div>
      </div>
    </motion.nav>
  )
}

const NavLink = ({ onClick, label }: { onClick: () => void; label: string }) => (
  <motion.button
    whileHover={{ color: '#22d3ee' }}
    onClick={onClick}
    className="text-neutral-400 hover:text-white transition-colors"
  >
    {label}
  </motion.button>
)

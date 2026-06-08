'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface QuestionStepProps {
  children: ReactNode
  stepKey: string
}

export function QuestionStep({ children, stepKey }: QuestionStepProps) {
  return (
    <motion.div
      key={stepKey}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      {children}
    </motion.div>
  )
}

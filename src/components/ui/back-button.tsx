'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from './button'

interface BackButtonProps {
  href?: string
}

export function BackButton({ href }: BackButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    if (href) {
      router.push(href)
    } else {
      router.back()
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      className="hidden md:flex"
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="sr-only">Go back</span>
    </Button>
  )
} 
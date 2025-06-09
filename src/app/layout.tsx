import { type Metadata } from 'next'
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'    

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

import { MobileLayout } from '@/components/layout/mobile-layout'
 

export const metadata: Metadata = {
  title: 'HomeNest - Smart Family Organizer',
  description: 'Manage your family household efficiently with AI-powered meal planning',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {  

  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          
            <MobileLayout> 
              {children}
          </MobileLayout> 
        </body>
      </html>
    </ClerkProvider>
  )
}
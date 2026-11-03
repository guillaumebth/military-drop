import { Geist, Geist_Mono, Inter, Source_Serif_4 } from "next/font/google"

import "./globals.css"
import { Toaster } from "sonner"

import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'})

// Textes de la maquette
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

// Titre : la maquette utilise New York (police Apple, non diffusable sur le web).
// Source Serif prend le relais sur les appareils où elle n'est pas installée (voir globals.css).
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["500", "700"],
  variable: "--font-serif",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", geist.variable, inter.variable, sourceSerif.variable)}
    >
      <body>
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

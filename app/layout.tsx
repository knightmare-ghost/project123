import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from 'next-themes'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'STC Ghana Dashboard', 
  description: 'STC Ghana Dashboard',
  generator: 'STC Ghana Dashboard',
}

const inter = Inter({ subsets: ['latin'] })
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} antialiased min-h-screen`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light" 
          enableSystem={false}  
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}

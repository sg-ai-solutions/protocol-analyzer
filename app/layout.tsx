import type { Metadata } from 'next';
import './globals.css';
import { Newsreader, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import { TooltipProvider } from '@/components/ui/tooltip';

// Display: editorial serif with journal/regulatory authority, used with restraint.
const display = Newsreader({
  subsets: ['latin'],
  variable: '--ff-display',
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
});

// UI / body: engineered humanist sans, reads as clinical documentation.
const sans = IBM_Plex_Sans({
  subsets: ['latin'],
  variable: '--ff-sans',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

// Manuscript + data + clause citations: the typed-protocol voice.
const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--ff-mono',
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Clinical Protocol Analyzer',
  description:
    'Reads a clinical trial protocol, maps every section to ICH-GCP E6(R3) Annex 1 Appendix B, and marks what is missing, with the clause cited for each finding. A demonstration on synthetic protocols.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <body className="min-h-screen antialiased">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}

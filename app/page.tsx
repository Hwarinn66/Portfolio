import { statSync } from 'node:fs';
import { join } from 'node:path';
import Portfolio from '@/components/portfolio';

/** File size of a public document, read at build time (static export), e.g. "117 KB". */
function size(file: string) {
  try { return `${Math.round(statSync(join(process.cwd(), 'public', file)).size / 1000)} KB`; } catch { return ''; }
}

export default function Page() {
  return <Portfolio year={new Date().getFullYear()} cvSize={size('documents/CV-Efriza-Taufiqurrohman.pdf')} portfolioSize={size('documents/Portfolio-Efriza-Taufiqurrohman.pdf')} />;
}

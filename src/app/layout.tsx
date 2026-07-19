import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MotoPhD Online — Motorcycle Performance Education',
  description: 'Premium online motorcycle education by MotoPhD.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}

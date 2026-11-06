import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Penny",
  description:
    "Personal finance in iMessage. Ask about spending, log expenses, and see mock budgets — just text Penny.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      style={{ colorScheme: "light" }}
    >
      <body className={`${inter.className} flex min-h-full flex-col bg-background text-foreground`}>
        {children}
      </body>
    </html>
  );
}

import { Space_Mono } from "next/font/google";
import localFont from "next/font/local";
import { Providers } from "./providers";
import "./globals.css";

const sansFont = localFont({
  src: [
    {
      path: "../../public/fonts/Satoshi-Variable.woff2",
      weight: "300 900",
      style: "normal",
    },
    {
      path: "../../public/fonts/Satoshi-VariableItalic.woff2",
      weight: "300 900",
      style: "italic",
    },
  ],
  display: "swap",
  variable: "--font-sans",
});

const monoFont = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "optional",
  variable: "--font-mono",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full font-sans font-normal antialiased ${sansFont.variable} ${monoFont.variable}`}>
      <body className="h-full">
        {/* 👇 Context providers and service initializers should be added into `<Providers>` component */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter, Josefin_Sans } from "next/font/google";
import "./globals.scss";
import clsx from "clsx";

import { InitSounds } from "./init-sounds";
import { ThemeProvider } from "next-themes";
import { THEMES } from "@/lib/game/utils";
import { GameSessionProvider } from "@/contexts/game-session";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });
const josefinSans = Josefin_Sans({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["300", "400"],
  variable: "--font-josefin-sans",
});

export const metadata: Metadata = {
  title: "Tic Tac Toe",
  description: "Play, Earn and Have Fun",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={clsx(inter.className, josefinSans.variable)}>
        <ThemeProvider
          enableColorScheme={false}
          defaultTheme="electricBlue"
          themes={THEMES}
          attribute="class"
          disableTransitionOnChange
        >
          <GameSessionProvider>
            <InitSounds />
            {children}
            <Toaster theme="dark" pauseWhenPageIsHidden />
          </GameSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

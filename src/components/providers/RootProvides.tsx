"use client";

import { ThemeProvider } from "next-themes";

type props = {
  children: React.ReactNode;
};

function RootProvider({ children }: props) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
export default RootProvider;

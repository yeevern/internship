"use client";

import { MeetingProvider, lightTheme, GlobalStyles } from "amazon-chime-sdk-component-library-react";
import { ThemeProvider } from "styled-components";
import { AlertProvider } from "@/context/alertProvider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={lightTheme}>
      <GlobalStyles />
      <MeetingProvider>
        <AlertProvider>{children}</AlertProvider>
      </MeetingProvider>
    </ThemeProvider>
  );
}

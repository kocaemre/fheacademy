"use client"

import { ConnectButton, darkTheme } from "thirdweb/react"
import { thirdwebClient } from "@/lib/thirdweb-client"

const zamaTheme = darkTheme({
  colors: {
    modalBg: "#13131A",
    primaryButtonBg: "#F5C518",
    primaryButtonText: "#0A0A0F",
    accentButtonBg: "#8B5CF6",
    accentButtonText: "#F1F1F3",
    accentText: "#F5C518",
    borderColor: "#1E1E2E",
    separatorLine: "#1E1E2E",
    primaryText: "#F1F1F3",
    secondaryText: "#9191A4",
    connectedButtonBg: "#1A1A24",
    connectedButtonBgHover: "#252540",
    tertiaryBg: "#0A0A0F",
  },
})

export function HeaderWallet() {
  return <ConnectButton client={thirdwebClient} theme={zamaTheme} />
}

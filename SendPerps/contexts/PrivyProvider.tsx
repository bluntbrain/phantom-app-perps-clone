import { PrivyProvider } from "@privy-io/expo";
import { PrivyElements } from "@privy-io/expo/ui";
import Constants from "expo-constants";
import { ReactNode } from "react";

interface PrivyWrapperProps {
  children: ReactNode;
}

export default function PrivyWrapper({ children }: PrivyWrapperProps) {
  const appId = process.env.EXPO_PUBLIC_PRIVY_APP_ID || Constants.expoConfig?.extra?.privyAppId || "";
  const clientId = process.env.EXPO_PUBLIC_PRIVY_CLIENT_ID || Constants.expoConfig?.extra?.privyClientId || "";
  
  console.log('Privy credentials loaded:', { 
    appId: appId ? appId.substring(0, 8) + '...' : 'missing',
    clientId: clientId ? clientId.substring(0, 15) + '...' : 'missing'
  });
  
  return (
    <PrivyProvider
      appId={appId}
      clientId={clientId}
      config={{
        loginMethods: ["email", "wallet", "google", "apple", "github"],
        appearance: {
          theme: "dark",
          accentColor: "#676FFF",
          logo: "https://your-domain.com/logo.png",
        },
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
          noPromptOnSignature: true,
        },
        mfa: {
          noPromptOnMfaRequired: false,
        },
      }}
    >
      {children}
      <PrivyElements />
    </PrivyProvider>
  );
}
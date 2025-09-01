import { PrivyProvider } from "@privy-io/expo";
import { PrivyElements } from "@privy-io/expo/ui";
import { ReactNode } from "react";
import { View, Text } from "react-native";

interface PrivyWrapperProps {
  children: ReactNode;
}

export default function PrivyWrapper({ children }: PrivyWrapperProps) {
  const appId = process.env.EXPO_PUBLIC_PRIVY_APP_ID || "";
  const clientId = process.env.EXPO_PUBLIC_PRIVY_CLIENT_ID || "";

  if (!appId || !clientId) {
    console.error("Missing Privy credentials!", {
      appId: !!appId,
      clientId: !!clientId,
    });
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#000000",
        }}
      >
        <Text
          style={{
            color: "#ef4444",
            fontSize: 18,
            textAlign: "center",
            margin: 20,
          }}
        >
          Missing Privy Configuration{"\n"}
          Check your .env file
        </Text>
        {children}
      </View>
    );
  }

  return (
    <PrivyProvider
      appId={appId}
      clientId={clientId}
      config={{
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
        } as any,
      } as any}
    >
      {children}
      <PrivyElements />
    </PrivyProvider>
  );
}

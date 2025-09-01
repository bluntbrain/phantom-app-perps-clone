import { Button, ScrollView, Text, View } from "react-native";
import { usePrivy, User } from "@privy-io/expo";

export default function UserScreen() {
  const { user, logout, linkWallet, unlinkWallet, exportWallet } = usePrivy();

  const handleLogout = async () => {
    try {
      await logout();
      console.log("User logged out");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleLinkWallet = async () => {
    try {
      await linkWallet();
      console.log("Wallet linked");
    } catch (error) {
      console.error("Link wallet error:", error);
    }
  };

  const handleExportWallet = async () => {
    try {
      await exportWallet();
      console.log("Wallet export initiated");
    } catch (error) {
      console.error("Export wallet error:", error);
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <View style={{ gap: 15 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold" }}>
          SendPerps Dashboard
        </Text>
        
        <View>
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>User Info:</Text>
          <Text>ID: {user?.id}</Text>
          <Text>Email: {user?.email?.address}</Text>
          <Text>Created: {new Date(user?.createdAt || 0).toLocaleDateString()}</Text>
        </View>

        <View>
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>Wallets:</Text>
          {user?.linkedAccounts?.map((account, index) => (
            <View key={index} style={{ marginTop: 10 }}>
              <Text>Type: {account.type}</Text>
              <Text>Address: {account.address}</Text>
              {account.type === "wallet" && (
                <Button
                  title={`Unlink ${account.walletClient}`}
                  onPress={() => unlinkWallet(account.address)}
                />
              )}
            </View>
          ))}
        </View>

        <View>
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>Embedded Wallets:</Text>
          {user?.wallet && (
            <View style={{ marginTop: 10 }}>
              <Text>Address: {user.wallet.address}</Text>
              <Text>Chain Type: {user.wallet.chainType}</Text>
              <Text>Wallet Client: {user.wallet.walletClient}</Text>
            </View>
          )}
        </View>

        <View style={{ gap: 10, marginTop: 20 }}>
          <Button title="Link External Wallet" onPress={handleLinkWallet} />
          <Button title="Export Wallet" onPress={handleExportWallet} />
          <Button title="Logout" onPress={handleLogout} color="red" />
        </View>
      </View>
    </ScrollView>
  );
}
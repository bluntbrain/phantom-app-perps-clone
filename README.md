# SendAI Perps

A React Native trading application for Hyperliquid perpetual futures with Privy wallet authentication.


https://github.com/user-attachments/assets/b1970535-4acc-4c6e-84d4-2ad3f5482e58


## Prerequisites

- Node.js 18+
- iOS Simulator (Xcode) or Android emulator
- Expo CLI

## Installation & Setup

1. **Clone and install dependencies**

   ```bash
   cd SendPerps
   npm install
   ```

2. **Environment setup**

   ```bash
   cp .env.example .env
   # Add your Privy App ID and Client ID to .env
   ```

3. **Run the application**

   ```bash
   # iOS
   npm run ios

   # Android
   npm run android
   ```

## Features

- Live Hyperliquid perpetuals data with 200+ trading pairs
- Privy embedded wallet with seamless authentication
- Advanced charts, position management (Long/Short)
- HyperUnit integration for asset bridging

## Project Structure

```
SendPerps/
├── app/                        # Expo Router file-based routing
│   ├── _layout.tsx            # Root layout
│   ├── +not-found.tsx         # 404 page
│   ├── splash.tsx             # App splash screen
│   ├── home.tsx               # Main perps list with real Hyperliquid data
│   ├── trading.tsx            # Trading screen with charts & positions
│   ├── longshort.tsx          # Position entry (Long/Short)
│   ├── addfunds.tsx           # Fund deposit interface
│   ├── autoclosesettings.tsx  # Auto-close settings
│   └── revieworder.tsx        # Order review screen
│
├── components/                 # Reusable UI components
│   ├── PerpsCard.tsx          # Trading pair cards with crypto icons
│   ├── AdvancedTradingChart.tsx # SVG-based candlestick charts
│   ├── BridgeComponent.tsx    # HyperUnit bridge interface
│   ├── LoginScreen.tsx        # Privy authentication UI
│   ├── BottomNavigation.tsx   # App navigation
│   ├── TimePeriodSelector.tsx # Chart timeframe selector
│   ├── LeverageBottomSheet.tsx # Leverage selection modal
│   └── Keypad.tsx             # Custom numeric keypad
│
├── services/                   # API integrations & business logic
│   ├── HyperliquidService.ts  # Direct REST/WebSocket API calls
│   └── HyperUnitService.ts    # Cross-chain bridging service
│
├── constants/                  # App configuration
│   ├── colors.ts              # Theme colors
│   └── spacing.ts             # Layout constants
│
├── contexts/                   # React contexts
│   └── PrivyProvider.tsx      # Privy authentication provider
│
├── utils/                      # Utility functions
│   └── haptics.ts             # Haptic feedback
│
└── assets/                     # Static assets
    ├── images/                 # App icons, logos
    └── fonts/                  # Custom fonts
```

## API Documentation

### Trading Data

- **Hyperliquid API**: [https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api)
  - REST API: `https://api.hyperliquid.xyz/info`
  - WebSocket: `wss://api.hyperliquid.xyz/ws`
  - Used for: Real-time perps data, prices, user positions

### Wallet Authentication

- **Privy SDK**: [https://docs.privy.io/](https://docs.privy.io/)
  - Expo integration: [https://docs.privy.io/guide/react-native/expo](https://docs.privy.io/guide/react-native/expo)
  - Used for: Embedded wallet, user authentication, transaction signing

### Cross-chain Bridging

- **HyperUnit**: [https://docs.hyperunit.xyz/](https://docs.hyperunit.xyz/)
  - API: Bridge assets from Solana/Bitcoin/Ethereum to Hyperliquid
  - Used for: Deposit address generation, bridge fee estimation

### Additional APIs

- **CoinGecko**: [https://www.coingecko.com/en/api](https://www.coingecko.com/en/api)
  - Used for: Cryptocurrency icons and metadata

## Environment Variables

```bash
# .env file
EXPO_PUBLIC_PRIVY_APP_ID=your_privy_app_id
EXPO_PUBLIC_PRIVY_CLIENT_ID=your_privy_client_id
```

## Development Commands

```bash
# Linting
npm run lint

# Type checking
npm run typecheck

# Reset project (removes example code)
npm run reset-project

# iOS development build
npm run ios

# Android development build
npm run android
```

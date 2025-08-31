# SendAI Perps - Source Code Structure

## Overview
This React Native app replicates the Phantom Perps trading experience with integration to Hyperliquid for real trading functionality.

## Folder Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.tsx      # Haptic-enabled button component
│   ├── Header.tsx      # Reusable header component
│   ├── PerpsCard.tsx   # Trading pair list item
│   └── index.ts        # Component exports
├── constants/          # App constants and theme
│   ├── colors.ts       # Color scheme (dark theme)
│   ├── spacing.ts      # Spacing, border radius, font sizes
│   └── index.ts        # Constants exports
├── hooks/              # Custom React hooks (future)
├── screens/            # Application screens
│   ├── HomeScreen.tsx  # Main perps list screen
│   └── TradingScreen.tsx # Trading interface (template)
├── services/           # API services and integrations (future)
├── utils/              # Utility functions
│   ├── haptics.ts      # Haptic feedback utilities
│   ├── formatters.ts   # Number/currency formatting
│   └── index.ts        # Utils exports
└── README.md           # This file
```

## Development Commands

```bash
# Run iOS app
npm run ios

# Run Android app
npm run android

# Start Metro bundler
npm start

# Lint code
npm run lint

# Type check
npm run typecheck
```


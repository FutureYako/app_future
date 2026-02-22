# Future Yako

A fintech app for automatic savings (BOOM for students, salary for employees), goal-based saving, stock market investing, and bill payments.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment** (optional)
   ```bash
   cp .env.example .env
   # Edit .env with your auth/upload URLs when ready
   ```

3. **Run the app**
   ```bash
   npx expo start
   ```
   - Press `w` for web
   - Press `a` for Android
   - Press `i` for iOS

## Project structure

```
src/
├── app/              # Expo Router screens
│   ├── (tabs)/       # Dashboard, Bills, Goals, Invest, Profile
│   └── onboarding/   # Bank account, deduction settings, FYW account
├── components/
└── utils/            # Auth, theme, upload helpers
polyfills/            # Web/native polyfills
```

## Building

- **Web**: `npx expo export:web`
- **Native**: `npx expo prebuild` then build with Xcode/Android Studio, or use EAS Build

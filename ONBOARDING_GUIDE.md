# Onboarding Implementation Guide

## Overview

I have created a simplified onboarding system for your React Native application, Quizzly Bears. The system includes:

1. **Simple onboarding screen** – a single screen with the same design as the original Welcome
2. **State management** via AsyncStorage
3. **Context provider** for global state management
4. **Automatic navigation** for new users
5. **Component reuse** – the root index now shows PlayScreen for authorized users

## Components

### 1. OnboardingScreen (`/app/onboarding.tsx`)

- Simple screen with a "Get Started" button
- Uses the shared WelcomeGuide component
- Saves state in AsyncStorage

### 2. WelcomeGuide (`/components/WelcomeGuide.tsx`)

- Reusable component with the design of the original welcome screen
- Accepts props for button customization and callback

### 3. OnboardingProvider (`/providers/OnboardingProvider.tsx`)

- Checks onboarding state on startup
- Context for accessing onboarding state
- Functions to reset onboarding (for testing)

### 4. Updated navigation

- Root `index.tsx` now shows PlayScreen for authorized users
- Automatic onboarding check for new users
- Provider added to the main layout

## How to use

### For users

1. On first launch, the onboarding screen is shown automatically
2. Pressing "Get Started" completes onboarding and navigates to the main app
3. After completion, the state is saved and onboarding is not shown again

### For developers

#### Reset onboarding (for testing)

There is a "Show Onboarding" button in the profile for testing

Or programmatically:

```typescript
import { resetOnboarding } from "@/providers/OnboardingProvider";

const handleResetOnboarding = async () => {
  await resetOnboarding();
  // Then restart the app or navigate to onboarding
};
```

#### Using the WelcomeGuide component

```typescript
import WelcomeGuide from "@/components/WelcomeGuide";

<WelcomeGuide onNext={handleNext} buttonText="Custom Button Text" />;
```

## File structure

### New/modified files:

1. `app/onboarding.tsx` – Onboarding screen (uses WelcomeGuide)
2. `components/WelcomeGuide.tsx` – Reusable welcome component
3. `providers/OnboardingProvider.tsx` – State provider
4. `app/_layout.tsx` – OnboardingProvider added
5. `app/index.tsx` – Now shows PlayScreen for authorized users
6. `app/(tabs)/profile/index.tsx` – Button added for testing

### Logic:

1. **First launch**: New users see onboarding
2. **After onboarding**: User is taken to the main app
3. **Authorized user**: Immediately sees PlayScreen (skipping intermediate screen)
4. **Unauthorized user**: Redirected to the login screen

## Styling

All styles use your existing theme:

- `Colors` from `@/styles/theme`
- `FontSizes` and `Gaps` for consistency
- `NotoSans` fonts from your design system

## Testing

1. **First launch**: Delete and reinstall the app
2. **Programmatic reset**: Use the "Show Onboarding" button in the profile
3. **Manual reset**: In DevTools, remove the `@onboarding_completed` key from AsyncStorage

## Features

- ✅ Simple single-page onboarding
- ✅ Reuses existing design
- ✅ Root screen now shows PlayScreen for authorized users
- ✅ Fully typed with TypeScript
- ✅ Uses existing design system
- ✅ Optimized for performance
- ✅ Supports automatic navigation
- ✅ Saves state locally
- ✅ Easily customizable

Onboarding is ready to use! 🎉

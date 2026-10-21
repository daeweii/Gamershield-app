// ---------------------------------------------------------------
// 2FA SETUP GUIDES
// Pure data, so adding a platform never means touching UI code.
// ---------------------------------------------------------------

export const PLATFORMS = ['PlayStation', 'Xbox', 'Discord', 'Steam', 'Epic Games', 'Roblox'] as const;

export type Platform = (typeof PLATFORMS)[number];

export interface TwoFactorGuide {
  steps: readonly string[];
  /** The platform's official help site. Fixed here, never built from user input. */
  helpUrl: string;
}

// Record<Platform, ...> makes TypeScript refuse to compile if a platform in
// PLATFORMS is missing a guide, so the list and the guides can't drift apart.
export const TWO_FA_GUIDES: Readonly<Record<Platform, TwoFactorGuide>> = {
  PlayStation: {
    steps: [
      'Sign in at the PlayStation website or open Settings on your console.',
      'Go to Account Management, then Security.',
      'Turn on 2-Step Verification.',
      'Pick an authenticator app (best) or text message.',
      'Save your backup codes somewhere safe, not on the same device.',
    ],
    helpUrl: 'https://www.playstation.com/support/account/',
  },
  Xbox: {
    steps: [
      'Sign in to your Microsoft account at account.microsoft.com.',
      'Go to Security, then Advanced security options.',
      'Turn on Two-step verification.',
      'Use the Microsoft Authenticator app if you can.',
      'Save your recovery code somewhere safe.',
    ],
    helpUrl: 'https://support.microsoft.com/account-billing',
  },
  Discord: {
    steps: [
      'Open Discord, then User Settings (the gear icon).',
      'Go to My Account.',
      'Click Enable Two-Factor Auth.',
      'Scan the QR code with an authenticator app.',
      'Download your backup codes and store them safely.',
    ],
    helpUrl: 'https://support.discord.com/',
  },
  Steam: {
    steps: [
      'Install the Steam Mobile app on your phone.',
      'Sign in, then open the Steam Guard section.',
      'Add the authenticator to your account.',
      'Write down your recovery code. You need it if you lose your phone.',
    ],
    helpUrl: 'https://help.steampowered.com/',
  },
  'Epic Games': {
    steps: [
      'Sign in at epicgames.com.',
      'Open your Account, then go to Password & Security.',
      'Find Two-Factor Authentication.',
      'Turn on the authenticator app option (best), or text or email.',
      'Save your backup codes somewhere safe.',
      'Bonus: Epic often gives free Fortnite items for turning on 2FA.',
    ],
    helpUrl: 'https://www.epicgames.com/help/',
  },
  Roblox: {
    steps: [
      'Open Roblox and go to Settings (the gear icon).',
      'Go to the Security tab.',
      'Turn on 2-Step Verification.',
      'Pick an authenticator app (best) or email.',
      'Save your backup codes somewhere safe.',
    ],
    helpUrl: 'https://en.help.roblox.com/',
  },
};

export const MENUS_CHANGE_NOTE = 'Menus change sometimes. If a step looks different, look for ‘Security’ or ‘2-Step’.';

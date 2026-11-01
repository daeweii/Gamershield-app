// Every piece of interface text for the generator page lives here, apart from
// the UI logic, so the page can be translated by swapping this one file.
// The project has no localization library, so this is a plain object.

import type { CharType, CopyFormat, GeneratorSettings, Mode, PassphraseSeparator, PresetId, Problem, StrengthVerdict } from '@/lib/security';

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export const strings = {
  pageTitle: 'Password Generator',
  brand: 'Sentrix',
  backToSite: 'Back to Sentrix',
  onDevice: 'Generated on this device',
  tourButton: 'Quick tour',

  nav: {
    label: 'Generator sections',
    generate: 'Generate',
    customize: 'Customize',
    strength: 'Strength',
    privacy: 'Privacy & How It Works',
  },

  modes: { random: 'Random', passphrase: 'Passphrase', pin: 'PIN', site: 'Site rules' } satisfies Record<Mode, string>,
  modeHints: {
    random: 'Random characters. Strongest per character. Best with a password manager.',
    passphrase: 'Random words. Easier to remember and to type on a controller or TV.',
    pin: 'Digits only. For phones, consoles, and apps that lock after wrong tries.',
    site: 'Optional. Match a website’s exact password rules. These rules apply only in this mode.',
  } satisfies Record<Mode, string>,

  types: { lower: 'Lowercase (a–z)', upper: 'Uppercase (A–Z)', digits: 'Numbers (0–9)', symbols: 'Symbols' } satisfies Record<CharType, string>,
  typeNames: { lower: 'lowercase letters', upper: 'uppercase letters', digits: 'numbers', symbols: 'symbols' } satisfies Record<CharType, string>,
  typesShort: { lower: 'a-z', upper: 'A-Z', digits: '0-9', symbols: '!@#' } satisfies Record<CharType, string>,

  presets: {
    'random-everyday': 'Everyday · 16',
    'random-strong': 'Strong · 24',
    'random-max': 'Maximum · 64',
    'random-easy-read': 'Easy to read · 20',
    'passphrase-short': 'Short · 4 words',
    'passphrase-strong': 'Strong · 6 words',
    'passphrase-long': 'Long · 10 words',
    'pin-4': '4 digits',
    'pin-6': '6 digits',
    'pin-8': '8 digits',
  } satisfies Record<PresetId, string>,

  separators: { '-': 'Dash (-)', '.': 'Dot (.)', '_': 'Underscore (_)', ' ': 'Space', '': 'None' } satisfies Record<PassphraseSeparator, string>,

  summary(settings: GeneratorSettings): string {
    switch (settings.mode) {
      case 'random': {
        const types = (Object.keys(settings.random.types) as CharType[]).filter((t) => settings.random.types[t]).map((t) => strings.typesShort[t]);
        return `Random · ${plural(settings.random.length, 'character', 'characters')} · ${types.join(' ') || 'no characters'}`;
      }
      case 'passphrase':
        return `Passphrase · ${plural(settings.passphrase.wordCount, 'word', 'words')} · ${strings.separators[settings.passphrase.separator]}`;
      case 'pin':
        return `PIN · ${plural(settings.pin.length, 'digit', 'digits')}`;
      case 'site':
        return `Site rules · ${plural(settings.site.length, 'character', 'characters')}`;
    }
  },

  generate: {
    heading: 'Your choices',
    intro: 'Pick any one. A new batch replaces these, and they disappear when you close the page.',
    button: 'Generate new batch',
    change: 'Change settings',
    howMany: 'How many choices',
    revealAll: 'Reveal all',
    hideAll: 'Hide all',
    reveal: 'Reveal',
    hide: 'Hide',
    choice: (n: number) => `Choice ${n}`,
    length: (n: number) => plural(n, 'character', 'characters'),
    seeStrength: 'Strength',
    stale: 'Your settings changed. Generate a new batch to use them.',
    perChoice: (bits: number) => `Each choice: about ${Math.round(bits)} bits (estimate)`,
    announced: (n: number) => `New batch of ${n} passwords generated.`,
    blocked: 'Can’t generate with these settings yet.',
    hiddenValue: 'Hidden. Press Reveal to show it.',
  },

  copy: {
    formatLabel: 'Copy format',
    formats: { plain: 'Plain text', json: 'JSON string', env: '.env line' } satisfies Record<CopyFormat, string>,
    envName: 'Variable name',
    envNameError: 'Use letters, numbers, and underscores, starting with a letter or underscore.',
    previewLabel: 'Copies as',
    button: (format: string) => `Copy · ${format}`,
    done: 'Copied',
    failed: 'Couldn’t copy automatically. Reveal it, then select and copy it by hand.',
    announced: (n: number, format: string) => `Choice ${n} copied as ${format}.`,
  },

  customize: {
    heading: 'Customize',
    modeLabel: 'Mode',
    presetsLabel: 'Quick presets',
    length: 'Length',
    characters: 'Characters to use',
    excludeAmbiguous: 'Exclude look-alike characters (I l 1 O 0 o)',
    more: 'More options',
    requireEach: 'Require at least one of each selected type',
    requireEachNote: 'Off by default. Current NIST guidance says sites shouldn’t force character mixes. Length matters more. Turn this on only if a site demands it.',
    words: 'Number of words',
    separator: 'Separator',
    capitalize: 'Capitalize each word',
    addNumber: 'Add a 2-digit number',
    wordList: (n: number) => `Words come from a built-in list of ${n} words.`,
    pinLength: 'PIN length',
    pinNote: 'PINs are only safe where the device or app locks after a few wrong tries. Never use one as an account password.',
    site: {
      limits: 'Length limits',
      min: 'Minimum length',
      max: 'Maximum length',
      length: 'Length to generate',
      allowed: 'Characters the site allows',
      allowedSymbols: 'Symbols the site allows',
      required: 'Must include at least one',
      excluded: 'Characters the site rejects',
      excludedHint: 'Type each character, e.g. <>"\'',
    },
    apply: 'Generate with these settings',
    problemsHeading: 'Fix these to generate',
  },

  strength: {
    heading: 'Strength',
    estimateLabel: 'Estimated strength',
    pick: 'Which choice',
    bits: (bits: number) => `about ${Math.round(bits)} bits`,
    verdicts: { WEAK: 'Weak', OKAY: 'Okay', STRONG: 'Strong' } satisfies Record<StrengthVerdict, string>,
    bitsExplainer: 'Bits count how many passwords your settings could make. Each extra bit doubles the guesses an attacker would need.',
    considersHeading: 'What this estimate considers',
    considers: {
      characters: (length: number, pool: number) => `${plural(length, 'character', 'characters')}, each picked from ${plural(pool, 'possible character', 'possible characters')}.`,
      required: (n: number) => `Your rule that ${plural(n, 'character type must', 'character types must')} appear, which slightly lowers the count.`,
      words: (count: number, list: number) => `${plural(count, 'word', 'words')} picked from a list of ${list}, with no word repeated.`,
      number: 'A 2-digit number on the end (90 options).',
      fixed: 'Capitals and separators follow a fixed pattern, so they add no strength.',
      pin: (length: number) => `${plural(length, 'digit', 'digits')}, each 0–9.`,
    },
    limitsHeading: 'What it doesn’t tell you',
    limits: [
      'It’s an estimate of the method, assuming an attacker knows your exact settings. That’s the honest worst case.',
      'It can’t say how long cracking takes. That depends on how each website stores passwords, which no one outside the site can see.',
      'It doesn’t cover reuse, phishing, or where you keep the password. A strong password still needs to be unique and stored safely.',
    ],
    nistHeading: 'What NIST recommends',
    nist: [
      'Length is the biggest factor. NIST SP 800-63B asks sites to require at least 15 characters when a password is the only login step.',
      'Sites should accept at least 64 characters and shouldn’t force mixes of character types.',
      'Sites should block passwords found in data breaches. Sentrix’s Password Strength Checker can test for that.',
    ],
    nistLink: 'Read NIST SP 800-63B',
    pinWarning: 'PINs are short by design. They’re fine where a device locks after a few wrong tries, but never for an online account.',
    none: 'Generate a batch to see its strength here.',
  },

  privacy: {
    heading: 'Privacy & How It Works',
    madeHeading: 'How passwords are made',
    made: [
      'Your browser’s secure random number generator, crypto.getRandomValues(), picks every character and word. Math.random() is never used.',
      'Random numbers are mapped to characters without bias: values that would make some characters more likely are thrown away and drawn again.',
      'When a rule requires certain characters, whole passwords that miss them are thrown away and remade, so every valid password is equally likely.',
    ],
    leavesHeading: 'What leaves your device',
    leaves: [
      'Nothing. This page makes no network requests with your passwords or settings. It has no analytics, no tracking, and no account.',
      'Your batch lives only in this tab’s memory. Reloading, generating again, or closing the page erases it. There is no history.',
    ],
    clipboard: 'Copying puts the password on your clipboard. Some systems keep clipboard history or sync it to other devices, so paste it, then copy something else.',
    savedHeading: 'What’s saved',
    saved: 'To remember your choices between visits, this page saves only your preferences in this browser: mode, lengths, character choices, site rules, batch size, copy format, variable name, and whether you’ve seen the tour. Passwords are never saved.',
    reset: 'Reset preferences',
    resetDone: 'Preferences reset to defaults and removed from this browser.',
    offlineHeading: 'Offline and install',
    offline: {
      ready: 'Ready to work offline. This page is saved on this device and works without internet.',
      pending: 'Offline support is setting up. Reload once while online to finish.',
      dev: 'Offline support turns on in the published site, not in this development preview.',
      unsupported: 'This browser can’t save the page for offline use.',
    },
    install: 'Install as an app',
    tourHeading: 'Walkthrough',
    replay: 'Replay the walkthrough',
  },

  tour: {
    label: 'Walkthrough',
    step: (n: number, total: number) => `Step ${n} of ${total}`,
    next: 'Next',
    back: 'Back',
    done: 'Done',
    close: 'Close walkthrough',
    steps: [
      { title: 'Change a rule', body: 'Pick a mode or preset, then adjust length or characters here. Your choices are remembered on this device.' },
      { title: 'Generate', body: 'Press this to make a fresh batch of choices. A new batch replaces the old one.' },
      { title: 'Copy', body: 'Copy any choice as plain text, a JSON string, or a .env line. The preview shows exactly what you’ll get.' },
    ],
  },

  problem(problem: Problem): { message: string; fix: string } {
    switch (problem.code) {
      case 'random-no-types':
        return { message: 'No character types are selected.', fix: 'Turn on at least one of lowercase, uppercase, numbers, or symbols.' };
      case 'length-out-of-range':
        return { message: `Length must be a whole number from ${problem.min} to ${problem.max}.`, fix: `Set a length between ${problem.min} and ${problem.max}.` };
      case 'too-short-for-required':
        return { message: `The length (${problem.length}) is too short to fit ${problem.needed} required character types.`, fix: `Make it at least ${problem.needed} long, or require fewer types.` };
      case 'words-out-of-range':
        return { message: `Word count must be from ${problem.min} to ${problem.max}.`, fix: `Pick between ${problem.min} and ${problem.max} words.` };
      case 'separator-invalid':
        return { message: 'That separator isn’t supported.', fix: 'Choose a separator from the list.' };
      case 'site-limits-out-of-range':
        return { message: `Minimum and maximum must be whole numbers from ${problem.min} to ${problem.max}.`, fix: 'Check both length limit boxes.' };
      case 'site-min-over-max':
        return { message: `The minimum (${problem.min}) is bigger than the maximum (${problem.max}).`, fix: 'Lower the minimum or raise the maximum.' };
      case 'site-length-outside-limits':
        return { message: `Length to generate (${problem.length}) is outside the site’s limits of ${problem.min}–${problem.max}.`, fix: `Pick a length from ${problem.min} to ${problem.max}.` };
      case 'site-no-allowed-types':
        return { message: 'The site rules don’t allow any characters.', fix: 'Allow at least one character type.' };
      case 'site-required-not-allowed':
        return { message: `${capitalize(strings.typeNames[problem.type])} are required but not allowed.`, fix: `Allow ${strings.typeNames[problem.type]}, or stop requiring them.` };
      case 'site-required-all-excluded':
        return { message: `${capitalize(strings.typeNames[problem.type])} are required, but none are left after the rejected characters${problem.type === 'symbols' ? ' and allowed-symbols list' : ''}.`, fix: `Remove some ${strings.typeNames[problem.type]} from the rejected characters${problem.type === 'symbols' ? ', or add symbols to the allowed list' : ''}.` };
      case 'site-symbols-invalid':
        return { message: `The allowed-symbols list contains letters, numbers, or spaces: ${JSON.stringify(problem.characters)}.`, fix: 'List only symbols there. Letters and numbers have their own checkboxes.' };
      case 'site-everything-excluded':
        return { message: 'Every allowed character is also rejected.', fix: 'Remove some characters from the rejected list, or allow more types.' };
    }
  },
};

function capitalize(text: string) {
  return text[0].toUpperCase() + text.slice(1);
}

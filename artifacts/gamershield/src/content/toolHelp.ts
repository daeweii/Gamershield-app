// "How it works" and privacy notes shown under each tool page.
// Kept apart from the components so the text is easy to edit or translate.

export interface ToolHelp {
  howItWorks: string[];
  privacy: string;
}

export const TOOL_HELP: Record<string, ToolHelp> = {
  'strength-checker': {
    howItWorks: [
      'The strength estimate scores length and character variety from 0 to 6, and subtracts points for common words and game names attackers try first.',
      'The optional breach check uses Have I Been Pwned’s k-anonymity API: your browser hashes the password with SHA-1 and sends only the first 5 of 40 hex characters. It gets back hundreds of possible matches and checks for yours locally.',
    ],
    privacy: 'Your password never leaves this page. Only a 5-character hash prefix is sent, and only if you press the button.',
  },
  'two-factor-guides': {
    howItWorks: [
      'Two-factor authentication (2FA) means a login needs your password and a second proof, usually a code from an app on your phone. A stolen password alone is no longer enough.',
      'Authenticator apps are the best option. Text messages work, but SIM-swap attacks can intercept them.',
    ],
    privacy: 'These are static guides. Links go to each platform’s official help site.',
  },
  'link-checker': {
    howItWorks: [
      'The link is parsed as text with the browser’s URL parser, which also exposes look-alike letters (punycode). The domain is compared to official gaming sites, and look-alikes are scored with the same algorithm as Python’s difflib.',
      'It also flags URL shorteners, risky domain endings, raw IP addresses, plain http, bait words, and the @ trick that hides the real destination.',
      'No checker can promise a link is safe. Treat “no red flags” as “nothing obvious,” and type addresses yourself when you can.',
    ],
    privacy: 'The link is only read as text. Sentrix never opens, fetches, or sends it.',
  },
  'message-checker': {
    howItWorks: [
      'The message is matched against phrases common in gaming scams and phishing: fake gifts, “I accidentally reported you,” urgency, fake staff, and requests for codes or passwords.',
      'A match means “be suspicious,” not proof. No match doesn’t mean safe: never share codes or click links if something feels off.',
    ],
    privacy: 'The message stays in this page. Nothing is saved or sent.',
  },
  'account-checkup': {
    howItWorks: [
      'Seven yes-or-no questions cover the habits that stop most account takeovers. The fixes are ordered by impact, so the top one matters most.',
    ],
    privacy: 'Your answers stay on this page and disappear when you leave it.',
  },
};

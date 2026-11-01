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
  'password-guide': {
    howItWorks: ['A practical guide to strong passwords, why reuse is the biggest risk, multifactor authentication, password managers, and passkeys, aligned with NIST SP 800-63B.'],
    privacy: 'A static guide. Nothing is collected.',
  },
  'hash-generator': {
    howItWorks: [
      'A hash function turns any input into a fixed-length fingerprint. The same input always gives the same hash, and changing a single character changes the whole thing.',
      'Hashing is one-way: you can’t turn a hash back into the text. Encryption is two-way: anyone with the key can decrypt. Websites should store password hashes (made with slow, salted algorithms like Argon2 or bcrypt), never encrypted or plain passwords.',
      'This tool uses the browser’s Web Crypto API (crypto.subtle.digest).',
    ],
    privacy: 'Hashing happens on this device. Your text is never sent or saved.',
  },
  'base64': {
    howItWorks: [
      'Base64 rewrites any data using 64 safe characters (A–Z, a–z, 0–9, + and /) so it can travel through systems that only handle text, like email or JSON. Every 3 bytes become 4 characters.',
      'It’s encoding, not encryption: there’s no key, and anyone can reverse it. Attackers often Base64-encode malicious scripts to slip past simple filters, so decoding is a common analysis skill.',
    ],
    privacy: 'Encoding and decoding happen on this device. Nothing is sent or saved.',
  },
  'encryption': {
    howItWorks: [
      'Your passphrase and a random salt go through PBKDF2-SHA-256 with 600,000 iterations (the OWASP recommendation) to make a 256-bit key. The iterations make each password guess slow for an attacker.',
      'The message is encrypted with AES-256-GCM using a random 12-byte IV. GCM also authenticates the data, so any tampering is detected and decryption fails.',
      'The output packs the salt, IV, and ciphertext together. Encrypting the same message twice gives different output because the salt and IV are random each time.',
      'Limits: security depends entirely on the passphrase’s strength, there is no recovery, and the key exists in browser memory while you use the page.',
    ],
    privacy: 'Encryption happens on this device with Web Crypto. Messages and passphrases are never sent or saved.',
  },
  'file-hash': {
    howItWorks: [
      'The file is read in the browser and hashed with Web Crypto. Compare the result with the hash the publisher lists on their official download page.',
      'A match proves the file is byte-for-byte identical to what the publisher hashed: not corrupted, not swapped. A mismatch means don’t open it.',
      'A hash proves integrity, not trustworthiness. If an attacker controls the download page, they can change the listed hash too, which is why signed installers add another layer.',
    ],
    privacy: 'The file never leaves your device. It is read locally and nothing is uploaded or saved.',
  },
  'ip-info': {
    howItWorks: [
      'Addresses are parsed and checked against the IANA special-purpose registries: private ranges (10/8, 172.16/12, 192.168/16), loopback, link-local, carrier-grade NAT, documentation, multicast, and their IPv6 equivalents.',
      'An IP address alone reveals roughly which provider and region a connection comes from, not your name or exact location. Your home devices share your router’s public address through NAT.',
    ],
    privacy: 'Analysis runs on this device. Only the optional “Show my public IP” button contacts api.ipify.org, which returns just your IP.',
  },
  'dns-lookup': {
    howItWorks: [
      'Your browser asks Cloudflare’s public resolver over DNS-over-HTTPS (DoH), so the lookup is encrypted between you and Cloudflare. The resolver follows the chain from the root servers to the domain’s own name servers.',
      'NXDOMAIN means the domain doesn’t exist. “No records” means it exists but has none of the chosen type. DNSSEC validated means the answer’s digital signatures checked out.',
      'Security uses: check a suspicious domain exists, see who handles a site’s email (MX), or read SPF and DMARC policies (TXT on the domain and on _dmarc.domain).',
    ],
    privacy: 'Pressing Look up sends the domain name to Cloudflare (cloudflare-dns.com). Nothing else is sent, and nothing is saved.',
  },
  'subnet-calculator': {
    howItWorks: [
      'A prefix like /24 means the first 24 bits of the address identify the network and the remaining 8 bits number the hosts. The mask (255.255.255.0) writes the same thing in dotted form.',
      'The network address (all host bits 0) and broadcast address (all host bits 1) can’t be assigned to devices, so a /24 has 256 addresses but 254 usable hosts.',
      'Subnetting matters for security: separating devices into subnets lets firewalls control traffic between them and limits how far an attacker can spread.',
    ],
    privacy: 'Calculated on this device. Nothing is sent or saved.',
  },
  'network-terms': {
    howItWorks: ['A quick reference for core networking terms and well-known ports, each with a security angle. Use the filter to find a term or port number.'],
    privacy: 'A static reference. Nothing is collected.',
  },
  'url-inspector': {
    howItWorks: [
      'The browser’s URL parser splits the link into scheme, login part (before @), subdomain, registered domain, port, path, query, and fragment, exactly the way your browser would.',
      'Only the registered domain (the part right before the ending, like example.com) tells you who controls the site. Scammers stuff real brand names into the subdomain or path to fool quick glances.',
    ],
    privacy: 'The link is read as text on this device and never opened or sent.',
  },
  'security-checklist': {
    howItWorks: ['Twenty everyday protections across six areas, each with the reason it matters. Tick what you’ve done; your progress is remembered on this device so you can come back to it.'],
    privacy: 'Only the IDs of ticked items are saved, in this browser. Nothing is sent. Settings can erase it.',
  },
  'file-safety': {
    howItWorks: ['How malware hides in files, which extensions can run code, safe download habits, and how to verify a download with a SHA-256 hash.'],
    privacy: 'A static guide. Nothing is collected.',
  },
  'account-checkup': {
    howItWorks: [
      'Seven yes-or-no questions cover the habits that stop most account takeovers. The fixes are ordered by impact, so the top one matters most.',
    ],
    privacy: 'Your answers stay on this page and disappear when you leave it.',
  },
};

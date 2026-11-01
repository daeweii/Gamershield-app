// ---------------------------------------------------------------
// SCAM MESSAGE CHECKER
// Looks for phrases common in scam DMs. The message is never sent anywhere.
// ---------------------------------------------------------------

const SCAM_PATTERNS: Readonly<Record<string, string>> = {
  'free nitro': 'Free Nitro offers are almost always scams.',
  'accidentally reported': 'The ‘I accidentally reported you’ scam. They want your login.',
  'steam gift': 'Fake Steam gift. Real gifts show up in your Steam inventory, not DMs.',
  'verify your account': 'Real platforms don’t ask you to verify through a DM.',
  'send me your code': 'Never share a code sent to your phone or email. That’s your 2FA.',
  'login code': 'Never share a login code with anyone.',
  'free skins': 'Free skins sites steal accounts.',
  'free vbucks': 'Free V-Bucks don’t exist. This is a scam.',
  'free v-bucks': 'Free V-Bucks don’t exist. This is a scam.',
  'free robux': 'Free Robux don’t exist. Robux only come from Roblox itself.',
  'robux generator': 'Robux generators are scams that steal accounts.',
  'giveaway': 'Random giveaways in DMs are usually scams.',
  'trade': 'Be careful with trade offers. Check the profile and the item value.',
  'urgent': 'Scammers rush you so you don’t think.',
  'your account will be banned': 'Fake ban threats are used to scare you into clicking.',
  'staff': 'Real game staff don’t DM you randomly.',
  'qr code': 'Scanning a QR code can log someone into YOUR account.',
  'password': 'No real person or company needs your password. Ever.',
};

/** Return the reason for every scam pattern found in the message (empty if none). */
export function checkMessage(message: string): string[] {
  const lowered = message.toLowerCase();
  // Two patterns share a reason (the V-Bucks spellings), so a Set removes repeats.
  const reasons = Object.entries(SCAM_PATTERNS)
    .filter(([phrase]) => lowered.includes(phrase))
    .map(([, reason]) => reason);
  return [...new Set(reasons)];
}

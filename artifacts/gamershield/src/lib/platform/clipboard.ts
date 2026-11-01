/**
 * Copy text to the clipboard. Tries the modern Clipboard API first. Some
 * browsers and embedded views deny it, so fall back to the older copy command
 * on a temporary off-screen text box, which is removed immediately.
 * Styles are set through the DOM (not a style attribute) so pages with a
 * strict Content Security Policy allow it.
 */
export async function writeClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    return;
  } catch {
    // Fall through to the legacy method.
  }
  const box = document.createElement('textarea');
  box.value = text;
  box.setAttribute('readonly', '');
  box.setAttribute('aria-hidden', 'true');
  Object.assign(box.style, { position: 'fixed', top: '0', left: '-9999px', opacity: '0' });
  const focused = document.activeElement;
  document.body.appendChild(box);
  box.select();
  const copied = document.execCommand('copy');
  box.remove();
  if (focused instanceof HTMLElement) focused.focus();
  if (!copied) throw new Error('Copy was blocked');
}

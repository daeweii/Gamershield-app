import { createRoot } from 'react-dom/client';
import { GeneratorApp } from './GeneratorApp';
import './generator.css';

createRoot(document.getElementById('root')!).render(<GeneratorApp />);

// Offline support: a service worker saves this page's files on the device.
// Only in the built site; in development it would cache files that keep changing.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  const scope = `${import.meta.env.BASE_URL}generator/`;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${scope}sw.js`, { scope }).catch(() => {
      // Registration can fail (private mode, blocked storage). The page still works online.
    });
  });
}

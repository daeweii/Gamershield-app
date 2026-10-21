---
name: GamerShield privacy
description: Privacy constraints for future GamerShield tools and integrations.
---

GamerShield must not send user-entered passwords, links, or messages to its own server or persist or log those inputs. Password checks run in the browser. The optional Have I Been Pwned password lookup may send only the first five characters of a locally computed SHA-1 hash, then compare returned suffixes in the browser. Scam links are analyzed as text and never visited.

**Why:** The user explicitly made privacy the product's most important rule and specified browser-only processing.

**How to apply:** Keep future tools client-side; avoid accounts, databases, analytics, tracking cookies, and input persistence. Clearly disclose any narrowly scoped external request before it runs.

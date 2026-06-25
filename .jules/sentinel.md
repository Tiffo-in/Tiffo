## 2024-06-12 - [XSS Vulnerability in Blog Editor]
**Vulnerability:** [Cross-Site Scripting (XSS) vulnerability in BlogEditor.jsx where formData.content was directly rendered using dangerouslySetInnerHTML.]
**Learning:** [User input containing HTML was not being sanitized before being rendered to the DOM, exposing users to malicious scripts.]
**Prevention:** [Always sanitize user-provided HTML content using a library like DOMPurify before rendering it with dangerouslySetInnerHTML.]
## 2025-06-14 - Unescaped Regex Injection (ReDoS)

**Vulnerability:** Unescaped search parameters were passed directly to `$regex` query fields in `deliveryController.js` and `adminUserController.js`.
**Learning:** This issue existed because developers assume that a dynamic value can be passed into a regex query string securely. If user input contains regex special characters, attackers could leverage this for a Regular Expression Denial of Service (ReDoS) or use regex to query for unintended user information.
**Prevention:** Always escape user input before applying it to `$regex` using a utility function such as `escapeRegex(string)` that replaces special regex operators.
## 2026-06-25 - Unescaped RegExp Constructor Injection (ReDoS)
**Vulnerability:** The `cuisine` query parameter was passed directly to the `new RegExp(cuisine, 'i')` constructor in `tiffinController.js` without sanitization.
**Learning:** Even when not using `$regex` directly, dynamically constructing regular expressions in Node.js with unsanitized user input poses a critical ReDoS vulnerability. Attackers can provide overly complex expressions that freeze the event loop.
**Prevention:** Always sanitize/escape user input using the `escapeRegex` utility before passing it dynamically to the `RegExp` constructor.
## 2024-06-16 - Secure random password generation
**Vulnerability:** Insecure random password generation using Math.random() in Google login fallback.
**Learning:** Math.random() is not cryptographically secure and can be predicted, posing a risk when generating temporary passwords.
**Prevention:** Always use the built-in `crypto` module (e.g., `crypto.randomBytes()`) for generating secure random tokens or passwords.

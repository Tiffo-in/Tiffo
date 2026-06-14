## 2024-06-12 - [XSS Vulnerability in Blog Editor]
**Vulnerability:** [Cross-Site Scripting (XSS) vulnerability in BlogEditor.jsx where formData.content was directly rendered using dangerouslySetInnerHTML.]
**Learning:** [User input containing HTML was not being sanitized before being rendered to the DOM, exposing users to malicious scripts.]
**Prevention:** [Always sanitize user-provided HTML content using a library like DOMPurify before rendering it with dangerouslySetInnerHTML.]
## 2025-06-14 - Unescaped Regex Injection (ReDoS)

**Vulnerability:** Unescaped search parameters were passed directly to `$regex` query fields in `deliveryController.js` and `adminUserController.js`.
**Learning:** This issue existed because developers assume that a dynamic value can be passed into a regex query string securely. If user input contains regex special characters, attackers could leverage this for a Regular Expression Denial of Service (ReDoS) or use regex to query for unintended user information.
**Prevention:** Always escape user input before applying it to `$regex` using a utility function such as `escapeRegex(string)` that replaces special regex operators.

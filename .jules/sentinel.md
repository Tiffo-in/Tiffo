## 2026-07-20 - Enforce Tenant Isolation in CSV Exports
**Vulnerability:** Insecure Direct Object Reference (IDOR) in `exportOrdersCSV` allowed partners to export other partners' data by manipulating the `partnerId` query parameter.
**Learning:** `req.query` was trusted for authorization scoping instead of relying solely on the authenticated session (`req.user`).
**Prevention:** Always derive the tenant ID (`req.user.id`) from the verified token for data access scoping and enforce Role-Based Access Control (RBAC) before applying filters.

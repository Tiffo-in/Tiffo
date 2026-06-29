## 2025-06-29 - Use Promise.all and .lean() for independent backend reads
**Learning:** Sequential awaited database queries without `.lean()` block each other and consume more memory by hydrating full Mongoose documents for read-only data.
**Action:** When making multiple independent database queries in a controller to fetch read-only data, group them with `Promise.all` for concurrency and append `.lean()` to reduce memory footprint and execution time.

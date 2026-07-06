## 2024-05-18 - TiffinCard Re-renders and Image Flickering
**Learning:** Found that `TiffinCard`, heavily used in list views (`Tiffins.jsx`, `Home.jsx`), was redefining a static fallback array, calculating random images synchronously on every render, and lacking memoization. This led to unnecessary re-renders when parent components updated, and more importantly, caused the random placeholder image to visibly flicker or change on every re-render.
**Action:** Extract static arrays outside React components. Use `React.memo()` for list item components. Use `useMemo` with an empty dependency array (`[]`) for stable random values (like placeholder images) so they don't change and cause visual flickering on re-renders.## 2024-05-18 - DB Pagination Optimization
**Learning:** The organic browsing query in `getTiffins` fetched all active tiffins into memory and used `.sort().slice()` on the result array, causing a memory footprint bottleneck and an N+1 issue due to population. While memory pagination is necessary for geospatial requests, it is inefficient for standard filtering.
**Action:** Always check array pagination operations like `.slice()` in controllers. For non-geospatial requests, use database-level pagination like `.skip().limit()` directly at the query level.

## 2024-06-13 - N+1 Query in Subscription Delivery Stats
**Learning:** The `fetchUserSubscriptions` and `fetchOrderHistory` methods in the subscription service were looping over subscriptions with a `Promise.all` and querying the `Delivery` collection inside the loop. This resulted in an N+1 query problem that significantly impacted backend performance as the number of subscriptions grew.
**Action:** Always prefer using a single MongoDB aggregation (`aggregate` with `$match` and `$group`) instead of making multiple queries within loops like `Promise.all`.

## 2023-10-27 - [Avoid N+1 Queries in Map Loops]
**Learning:** Found an N+1 performance bottleneck in `getUsers` where `Promise.all` inside a `.map` loop caused `2N` database queries for subscription counts and payment aggregates per paginated user list. This severely impacts load times on larger sets.
**Action:** Replace `map(async (...) => { await Promise.all(...) })` loops querying DB with batched aggregation queries using `$in`, followed by mapping results using an O(1) hash map lookup. This reduces total DB queries from `2N+2` to exactly 4. Always use `$in` aggregation and hash maps for listing related stats.
## 2026-06-15 - Batched Queries over Promise.all
**Learning:** Nested `await User.findById` in `Promise.all(map(...))` creates an N+1 query problem, heavily degrading performance when lists grow large (like message conversations).
**Action:** Replace `Promise.all` with a single batched query using `$in` and an O(1) hash map lookup whenever iterating over an array to fetch related database records.

## 2026-06-16 - Promise.all and MongoDB Aggregation in Dashboard Stats
**Learning:** Sequential `await` database queries in dashboard statistics endpoints (like `getPartnerStats`) create a waterfall effect blocking the event loop. Furthermore, fetching full document arrays just to `reduce` them in Node.js consumes excessive memory and CPU.
**Action:** Replace sequential queries with concurrent execution using `Promise.all`. Offload calculations (sums, averages) to MongoDB using `.aggregate()` rather than fetching documents and using `.reduce()` in Node.js.
## 2024-05-24 - Parallel Database Queries for Pagination
**Learning:** Sequential execution of `.find()` and `.countDocuments()` is a common but unnecessary performance bottleneck in paginated APIs. These operations are independent and can be executed simultaneously.
**Action:** Always wrap independent Mongoose queries in `Promise.all` to execute them concurrently, reducing total query latency.
## 2026-06-27 - Grouping Independent Queries
**Learning:** Controller functions (`getEarnings`, `getCustomerDetails`, `getAnalytics`) were making independent MongoDB queries sequentially (e.g., fetching `Payment.find`, then `Review.find`, then `Delivery.find`). This caused unnecessary latency due to sequential round-trips to the DB.
**Action:** Always group independent read operations using `Promise.all()` to execute them concurrently when they don't depend on each other's outputs.

## 2025-06-29 - Use Promise.all and .lean() for independent backend reads
**Learning:** Sequential awaited database queries without `.lean()` block each other and consume more memory by hydrating full Mongoose documents for read-only data.
**Action:** When making multiple independent database queries in a controller to fetch read-only data, group them with `Promise.all` for concurrency and append `.lean()` to reduce memory footprint and execution time.

## 2026-06-28 - Replacing Sequential Queries with Concurrency in Blog Controller
**Learning:** Sequential database queries inside API endpoints act as unnecessary bottlenecks. In `backend/src/controllers/blogController.js` for the `getBlogStats` route, multiple queries (e.g., aggregation and `.find()` operations) were chained after an initial `Promise.all` block. This resulted in delayed response times because subsequent queries waited for previous ones to resolve, despite having no dependencies on them. Mongoose supports concurrently executing independent queries and aggregation pipelines. Also added `.lean()` when calling `.find()` to skip hydrating Mongoose documents.
**Action:** Consolidate all independent database queries (both `.countDocuments`, `.aggregate`, and `.find`) into a single `Promise.all` array to execute them concurrently whenever they do not have data dependencies on one another. Make sure to call `.lean()` on `.find()` queries where possible to avoid the overhead of full Mongoose document hydration.

## 2026-07-02 - Sequential DB Queries in DeliveryStats Controller
**Learning:** Sequential Mongoose operations like `Delivery.aggregate` and `Delivery.countDocuments` in `getDeliveryStats` act as an unnecessary bottleneck and add latency when their inputs do not depend on each other.
**Action:** Always inspect controllers for independent database queries and execute them concurrently using `Promise.all` to reduce overall API latency.

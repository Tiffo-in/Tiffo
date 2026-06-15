## 2024-05-18 - Convert O(N) Array Lookups to O(1) Lookups in Loops
**Learning:** Calling `.find()` inside a loop over an array (especially with operations like `toISOString()`) creates a significant O(N * M) performance bottleneck.
**Action:** When filtering or finding related data across iterations, use `.reduce()` before the loop to convert arrays into constant-time lookup objects (hash maps), transforming O(N * M) to O(N + M).

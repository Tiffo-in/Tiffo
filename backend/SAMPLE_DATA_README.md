# Sample Tiffin Data with Coordinates for Testing Nearby Feature

This JSON file contains sample partner and tiffin data with real coordinates from different locations in India.

## Partner Locations

1. **Delhi Home Kitchen** - Connaught Place, Delhi
   - Coordinates: 28.6139, 77.2090
   - Tiffins: North Indian Thali, Punjabi Breakfast

2. **South Delhi Tiffin Service** - Hauz Khas, Delhi
   - Coordinates: 28.5494, 77.2001
   - Tiffins: Gujarati Thali

3. **Mumbai Dabba Service** - Andheri, Mumbai
   - Coordinates: 19.1136, 72.8697
   - Tiffins: Mumbai Special Lunch

4. **Bangalore South Indian Kitchen** - Koramangala, Bangalore
   - Coordinates: 12.9352, 77.6245
   - Tiffins: South Indian Breakfast, Karnataka Meals

5. **Dwarka Homemade Tiffin** - Dwarka, Delhi
   - Coordinates: 28.5921, 77.0460
   - Tiffins: Dinner Special

## Testing Instructions

### Test Case 1: Delhi Center (Connaught Place)
**User Location:** 28.6139, 77.2090
**Radius:** 10 km
**Expected Results:** Should show 3 partners:
- Delhi Home Kitchen (0 km - same location)
- South Delhi Tiffin Service (~7.5 km away)
- Dwarka Homemade Tiffin (~25 km away - outside 10km radius, won't show)

### Test Case 2: South Delhi (Hauz Khas)
**User Location:** 28.5494, 77.2001
**Radius:** 15 km
**Expected Results:** Should show 2 partners:
- South Delhi Tiffin Service (0 km - same location)
- Delhi Home Kitchen (~7.5 km away)

### Test Case 3: Mumbai
**User Location:** 19.1136, 72.8697
**Radius:** 20 km
**Expected Results:** Should show 1 partner:
- Mumbai Dabba Service (0 km - same location)

### Test Case 4: Bangalore
**User Location:** 12.9352, 77.6245
**Radius:** 20 km
**Expected Results:** Should show 1 partner:
- Bangalore South Indian Kitchen (0 km - same location)

## Manual Testing Steps

1. Open http://localhost:3000/tiffins
2. Click "Use My Current Location" (or manually set coordinates)
3. Adjust radius slider
4. Observe filtered tiffins with distance badges
5. Try different locations and radii

## Note

Since the database is not connected, you can use the frontend mock data approach or manually add these coordinates to existing partners in your database when it's available.

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'partner' | 'admin';
  isVerified: boolean;
  avatar?: string;
}

export interface TiffinRating {
  average: number;
  count: number;
}

export interface PartnerInfo {
  _id?: string;
  businessName: string;
  rating?: number | TiffinRating;
  verified?: boolean;
}

export interface TiffinPrice {
  daily?: number;
  weekly?: number;
  monthly?: number;
}

export type Dietary = 'vegetarian' | 'vegan' | 'non-vegetarian' | 'jain' | 'gluten-free';

export interface TiffinDiscount {
  /** Percentages off the respective plan, 0–70. */
  weekly?: number;
  monthly?: number;
  isActive?: boolean;
  label?: string;
  expiresAt?: string | null;
}

export interface Tiffin {
  _id: string;
  /** The API field. `name` is not returned by GET /tiffins. */
  title: string;
  description?: string;
  price: number | TiffinPrice;
  /** The API returns `cuisine` + `mealType`; there is no `category` field. */
  cuisine?: string;
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  dietary?: Dietary[];
  images?: string[];
  menuItems?: unknown[];
  discount?: TiffinDiscount;
  /** Only present on location-filtered list responses; km from the user. */
  distance?: number;
  rating?: TiffinRating;
  /**
   * Mongoose virtual derived from `dietary`. Absent on list responses because
   * the controller uses `.lean()`, which drops virtuals — derive from
   * `dietary` instead of relying on this.
   */
  isVeg?: boolean;
  partner?: PartnerInfo;
  partnerInfo?: PartnerInfo;
  availablePlans?: string[];
  tags?: string[];
  slug?: string;
  /** Legacy names still read by some screens; not sent by the API. */
  name?: string;
  category?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  tiffin?: T;
}

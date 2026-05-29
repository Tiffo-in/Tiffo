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
  businessName: string;
  rating?: number;
}

export interface TiffinPrice {
  daily?: number;
  weekly?: number;
  monthly?: number;
}

export interface Tiffin {
  _id: string;
  name: string;
  description?: string;
  price: number | TiffinPrice;
  category: string;
  images?: string[];
  rating?: TiffinRating;
  isVeg?: boolean;
  partner?: PartnerInfo;
  partnerInfo?: PartnerInfo;
  availablePlans?: string[];
  tags?: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  tiffin?: T;
}

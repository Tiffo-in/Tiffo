export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'partner' | 'admin';
  isVerified: boolean;
  avatar?: string;
}

export interface Stats {
  activeSubscriptions: number;
  todayDeliveries: number;
  completedToday: number;
  monthlyRevenue: number;
  pendingPayouts: number;
}

export interface TiffinMinimal {
  name?: string;
}

export interface UserMinimal {
  name?: string;
  phone?: string;
}

export interface SubscriptionMinimal {
  deliveryAddress?: string;
  user?: UserMinimal;
  tiffin?: TiffinMinimal;
}

export interface Delivery {
  _id: string;
  status: 'scheduled' | 'preparing' | 'out_for_delivery' | 'delivered' | 'failed';
  deliveryDate: string;
  deliveryTime: string;
  subscription?: SubscriptionMinimal;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

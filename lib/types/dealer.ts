export interface DealerProfile {
  uid: string;
  businessName: string;
  email: string;
  phone: string;
  dealerLogoURL: string;
  dealerBannerURL?: string;
  address: string;
  city: string;
  country: string;
  description: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface DealerProfileValidation {
  isComplete: boolean;
  profile: DealerProfile | null;
  missingFields?: string[];
}

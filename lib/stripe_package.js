// Normal credit packages
export const NORMAL_CREDIT_PACKAGES = [
  { 
    id: "prod_SQkShxszzVfSea", 
    name: "Small Pack (Normal Credits)", 
    credits: 400, 
    price: 5,
    type: 'normal',
    description: '400 Normal Credits for AI Music Generation'
  },
  { 
    id: "prod_SQkSMOMbFVZIqD", 
    name: "Medium Pack (Normal Credits)", 
    credits: 1000, 
    price: 12,
    type: 'normal',
    description: '1000 Normal Credits for AI Music Generation'
  },
  { 
    id: "prod_SQkSemW9YYNuto", 
    name: "Large Pack (Normal Credits)", 
    credits: 2000, 
    price: 25,
    type: 'normal',
    description: '2000 Normal Credits for AI Music Generation'
  },
  { 
    id: "prod_SQkSmmaeLkOgSY", 
    name: "Extra Large Pack (Normal Credits)", 
    credits: 5000, 
    price: 45,
    type: 'normal',
    description: '5000 Normal Credits for AI Music Generation'
  },
];


export const RADIO_SUBSCRIPTION_PLANS = [
  { 
    id: "price_1SZPNHLEbBbuiNy4psf7oX4h", 
    name: "1 Month Radio Subscription", 
    price: 5,
    interval: 'month',
    credits: 400, 
    interval_count: 1,
    description: '1 month of unlimited radio access'
  },
  { 
    id: "price_1SZPOBLEbBbuiNy4PTRBJ6Xq", 
    name: "3 Month Radio Subscription", 
    price: 12,
    interval: 'month',
    interval_count: 3,
    description: '3 months of unlimited radio access'
  },
  { 
    id: "price_1SZPP1LEbBbuiNy4QDUTdTUz", 
    name: "6 Month Radio Subscription", 
    price: 25,
    interval: 'month',
    interval_count: 6,
    description: '6 months of unlimited radio access'
  },
  { 
    id: "price_1SZPPZLEbBbuiNy4WGAQoT2R", 
    name: "12 Month Radio Subscription", 
    price: 45,
    interval: 'month',
    interval_count: 12,
    description: '1 year of unlimited radio access'
  }
];

// Subscription plans (apply to both normal and radio credits)
export const SUBSCRIPTION_PLANS = [
  { 
    id: "prod_SQkSzKD1bvmB7e", 
    name: "Starter Plan", 
    credits: 20000, 
    price: 10, 
    isSubscription: true,
    type: 'normal',
    description: 'Monthly subscription for 20,000 Normal Credits'
  },
  { 
    id: "prod_SQkSDQBT6vs18R", 
    name: "Pro Plan", 
    credits: 40000, 
    price: 20, 
    isSubscription: true,
    type: 'normal',
    description: 'Monthly subscription for 40,000 Normal Credits'
  },
  { 
    id: "prod_SQkSPecauChp8L", 
    name: "Premium Plan", 
    credits: 80000, 
    price: 30, 
    isSubscription: true,
    type: 'normal',
    description: 'Monthly subscription for 80,000 Normal Credits'
  },
  // Radio-specific subscriptions can be added here when needed
];

// Helper function to get all packages of a specific type
export const getPackagesByType = (type) => {
  switch (type) {
    case 'normal':
      return NORMAL_CREDIT_PACKAGES;
    case 'radio':
      return RADIO_SUBSCRIPTION_PLANS;
    case 'subscription':
      return SUBSCRIPTION_PLANS;
    default:
      return [...NORMAL_CREDIT_PACKAGES, ...RADIO_SUBSCRIPTION_PLANS, ...SUBSCRIPTION_PLANS];
  }
};

// For backward compatibility
export const CREDIT_PACKAGES = NORMAL_CREDIT_PACKAGES;
export const ALL_PACKAGES = [...NORMAL_CREDIT_PACKAGES, ...RADIO_SUBSCRIPTION_PLANS, ...SUBSCRIPTION_PLANS];
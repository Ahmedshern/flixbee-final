export const plans = [
  {
    name: "Mobile",
    price: 89,
    description: "1 Month Package",
    features: [
      "Unlimited Movies & TV Shows",
      "Ad-Free Streaming",
      "Watch on 1 Device (Mobile or Tablet)",
      "480p Streaming",
      "Personalized Watchlist",
    ],
    deviceLimit: 1,
    specialOffers: {
      3: 87,
      6: 87,
    },
    popular: false,
    mobileOnly: true
  },
  {
    name: "Basic",
    price: 149,
    description: "1 Month Package",
    features: [
      "Unlimited Movies & TV Shows",
      "Ad-Free Streaming",
      "Watch on 2 Devices Simultaneously",
      "Full HD Streaming",
      "Personalized Watchlist",
      
    ],
    deviceLimit: 2,
    specialOffers: {
      3: 145,
      6: 145,
    },
    popular: true
  },
  {
    name: "Standard",
    price: 179,
    description: "1 Month Package",
    features: [
      "Unlimited Movies & TV Shows",
      "Ad-Free Streaming",
      "Watch on 3 Devices Simultaneously",
      "Full HD Streaming",
      "Personalized Watchlist",
      "Offline Viewing",
      
    ],
    deviceLimit: 3,
    specialOffers: {
      3: 175,
      6: 175,
    },
    popular: false
  },
  {
    name: "Premium",
    price: 219,
    description: "1 Month Package",
    features: [
      "Unlimited Movies & TV Shows",
      "Ad-Free Streaming",
      "Watch on 4 Devices Simultaneously",
      "Full HD Streaming",
      "Personalized Watchlist",
      "Offline Viewing",
      
    ],
    deviceLimit: 4,
    specialOffers: {
      3: 213,
      6: 214,
    },
    popular: false
  },
]; 
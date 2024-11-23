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
      3: 84,
      6: 79,
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
      "Parental Controls",
    ],
    deviceLimit: 2,
    specialOffers: {
      3: 144,
      6: 139,
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
      "Parental Controls",
    ],
    deviceLimit: 3,
    specialOffers: {
      3: 174,
      6: 169,
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
      "Parental Controls",
    ],
    deviceLimit: 4,
    specialOffers: {
      3: 214,
      6: 209,
    },
    popular: false
  },
]; 
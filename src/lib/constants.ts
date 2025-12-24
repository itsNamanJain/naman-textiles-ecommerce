// Static store information - update these values directly in code when needed

export const STORE_INFO = {
  name: "Naman Textiles",
  tagline: "Premium Fabrics for Every Occasion",
  description:
    "Your trusted destination for premium quality fabrics since 1990. We offer a wide range of textiles from Cotton to Banarsi Brocade.",
  phone: "+91 87429 09296",
  email: "contact@namantextiles.com",
  whatsapp: "+918742909296",
  address: {
    line1: "9/5152, Main Road, Shanti Mohalla",
    line2: "Gandhi Nagar, Delhi - 110031",
    city: "Delhi",
    state: "Delhi",
    pincode: "110031",
    country: "India",
    googleMapsUrl: "https://maps.app.goo.gl/dQShTscf3NCWPnVf6",
    googleMapsEmbed:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3501.0876036498584!2d77.26633897620795!3d28.66051648240036!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfdbcfad7e8d5%3A0x8a2e993f7655af81!2sNaman%20Textile!5e0!3m2!1sen!2sin!4v1703419200000!5m2!1sen!2sin",
  },
  businessHours: {
    open: "10:00 AM - 8:00 PM",
    closedDay: "Monday",
  },
  social: {
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
    twitter: "https://x.com",
    youtube: "https://youtube.com",
  },
} as const;

// Default settings for dynamic values (fallback if DB is empty)
// Note: Keys use snake_case to match database storage format
export const DEFAULT_SETTINGS = {
  shippingFreeThreshold: "1000",
  shippingBaseRate: "99",
  orderMinAmount: "500",
  codEnabled: "true",
  onlinePaymentEnabled: "false",
} as const;

export interface Place {
    id: string
    name: string
    category: string
    rating: number
    reviewCount: number
    distance: string
    image: string
    price: string
    isOpen: boolean
    address?: string
    phone?: string
    website?: string
    hours?: string
    description?: string
    images?: string[]
    amenities?: string[]
}

export const featuredPlaces: Place[] = [
    {
        id: "1",
        name: "Café Madras",
        category: "South Indian Cafe",
        rating: 4.8,
        reviewCount: 1234,
        distance: "0.8 km",
        image: "https://images.unsplash.com/photo-1630409774334-e2d1c85bf6e7?w=800&h=600&fit=crop",
        price: "₹₹",
        isOpen: true,
        address: "15/218-1, Linking Road, Bandra West, Mumbai, Maharashtra 400050",
        phone: "+91 98765 43210",
        website: "www.cafemadras.in",
        hours: "Mon-Sun: 7:00 AM - 11:00 PM",
        description: "An authentic South Indian cafe serving traditional filter coffee, freshly made dosas, idlis, and vadas. Experience the taste of Chennai in the heart of Mumbai with our family recipes passed down through generations.",
        images: [
            "https://images.unsplash.com/photo-1630409774334-e2d1c85bf6e7?w=1200&h=800&fit=crop",
            "https://images.unsplash.com/photo-1589301773859-bb024d3f2e03?w=1200&h=800&fit=crop",
            "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=1200&h=800&fit=crop",
            "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1200&h=800&fit=crop"
        ],
        amenities: ["WiFi", "AC", "Outdoor Seating", "Wheelchair Accessible", "Parking", "UPI/Cards Accepted"]
    },
    {
        id: "2",
        name: "Punjabi Tadka",
        category: "North Indian Restaurant",
        rating: 4.6,
        reviewCount: 2567,
        distance: "1.5 km",
        image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop",
        price: "₹₹₹",
        isOpen: true,
        address: "Plot No. 12, Sector 18, Vashi, Navi Mumbai, Maharashtra 400703",
        phone: "+91 98765 12345",
        website: "www.punjabitadka.com",
        hours: "Mon-Sun: 11:00 AM - 11:00 PM",
        description: "Authentic North Indian cuisine with rich flavors and traditional spices. Famous for our Butter Chicken and Dal Makhani.",
        images: [
            "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1200&h=800&fit=crop",
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=800&fit=crop",
            "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200&h=800&fit=crop"
        ],
        amenities: ["AC", "Family Seating", "Home Delivery", "Valet Parking"]
    },
    {
        id: "3",
        name: "Ayurveda Wellness Spa",
        category: "Spa & Ayurveda",
        rating: 4.9,
        reviewCount: 892,
        distance: "1.2 km",
        image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&h=600&fit=crop",
        price: "₹₹₹₹",
        isOpen: true,
        address: "Road No. 12, Juhu Scheme, Mumbai, Maharashtra 400049",
        phone: "+91 98765 67890",
        website: "www.ayurvedawellness.com",
        hours: "Mon-Sun: 8:00 AM - 9:00 PM",
        description: "Rejuvenate your body and mind with our traditional Ayurvedic treatments and modern spa therapies.",
        images: [
            "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200&h=800&fit=crop",
            "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=1200&h=800&fit=crop",
            "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200&h=800&fit=crop"
        ],
        amenities: ["Steam Room", "Massage", "Yoga Classes", "Organic Products"]
    },
    {
        id: "4",
        name: "Gold's Gym Mumbai",
        category: "Gym & Fitness",
        rating: 4.5,
        reviewCount: 1432,
        distance: "2.0 km",
        image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop",
        price: "₹₹",
        isOpen: true,
        address: "Landmark Building, Pali Hill, Bandra West, Mumbai, Maharashtra 400050",
        phone: "+91 98765 54321",
        website: "www.goldsgym.in",
        hours: "Mon-Sat: 6:00 AM - 10:00 PM, Sun: 8:00 AM - 2:00 PM",
        description: "World-class fitness facility with state-of-the-art equipment and certified trainers.",
        images: [
            "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=800&fit=crop",
            "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1200&h=800&fit=crop",
            "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=1200&h=800&fit=crop"
        ],
        amenities: ["Cardio Zone", "Weight Training", "Personal Training", "Steam & Sauna", "Lockers"]
    },
    {
        id: "5",
        name: "The Bombay Canteen",
        category: "Modern Indian Bistro",
        rating: 4.7,
        reviewCount: 3321,
        distance: "1.8 km",
        image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&h=600&fit=crop",
        price: "₹₹₹",
        isOpen: false,
        address: "Unit-1, Process House, Kamala Mills, Lower Parel, Mumbai, Maharashtra 400013",
        phone: "+91 98765 98765",
        website: "www.thebombaycanteen.com",
        hours: "Mon-Sun: 12:00 PM - 1:00 AM",
        description: "A celebration of India's diverse culinary heritage with a modern twist. Enjoy innovative dishes and cocktails in a vibrant setting.",
        images: [
            "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200&h=800&fit=crop",
            "https://images.unsplash.com/photo-1514362545857-3bc16549766b?w=1200&h=800&fit=crop",
            "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&h=800&fit=crop"
        ],
        amenities: ["Full Bar", "Live Music", "Valet Parking", "Outdoor Seating"]
    },
    {
        id: "6",
        name: "Maharaja Palace Hotel",
        category: "Heritage Hotel",
        rating: 4.8,
        reviewCount: 1445,
        distance: "2.5 km",
        image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&h=600&fit=crop",
        price: "₹₹₹₹",
        isOpen: true,
        address: "Apollo Bunder, Colaba, Mumbai, Maharashtra 400001",
        phone: "+91 98765 11111",
        website: "www.maharajapalace.com",
        hours: "24 Hours",
        description: "Experience royal luxury at Mumbai's most iconic heritage hotel. Stunning sea views and impeccable service.",
        images: [
            "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1200&h=800&fit=crop",
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop",
            "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&h=800&fit=crop"
        ],
        amenities: ["Swimming Pool", "Spa", "Fine Dining", "Concierge", "Sea View Rooms"]
    }
]

export function getPlaceById(id: string): Place | undefined {
    return featuredPlaces.find(place => place.id === id)
}

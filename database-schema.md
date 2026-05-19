# Ethical Fashion Platform - Database Schema

## MongoDB Schema Design

```
┌─────────────────────────────────────────────────────────────────┐
│                        DATABASE SCHEMA                          │
├─────────────────────────────────────────────────────────────────┤

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│      USERS      │    │     BRANDS      │    │    PRODUCTS     │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ _id: ObjectId   │    │ _id: ObjectId   │    │ _id: ObjectId   │
│ username: String│    │ name: String    │    │ name: String    │
│ email: String   │    │ description:    │    │ description:    │
│ password: String│    │   String        │    │   String        │
│ role: String    │    │ website: String │    │ price: Number   │
│ points: Number  │    │ approved:       │    │ material: String│
│ level: String   │    │   Boolean       │    │ materials:      │
│ badges: Array   │    │ sustainability: │    │   [String]      │
│ achievements:   │    │   Number        │    │ category: String│
│   Array         │    │ certifications: │    │ sustainability: │
│ streak: Number  │    │   [String]      │    │   Number        │
│ preferences:    │    │ imageUrl: String│    │ imageUrls:      │
│   Object        │    │ uploader:       │    │   [String]      │
│ createdAt: Date │    │   ObjectId      │    │ sizes: [String] │
│ updatedAt: Date │    │ createdAt: Date │    │ colors: [String]│
└─────────────────┘    │ updatedAt: Date │    │ brand: ObjectId │
                       └─────────────────┘    │ approved:       │
                                              │   Boolean       │
                                              │ uploader:       │
                                              │   ObjectId      │
                                              │ views: Number   │
                                              │ rating: Number  │
                                              │ createdAt: Date │
                                              │ updatedAt: Date │
                                              └─────────────────┘
                                                       │
                                                       │ references
                                                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     ORDERS      │    │  NOTIFICATIONS  │    │    REVIEWS      │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ _id: ObjectId   │    │ _id: ObjectId   │    │ _id: ObjectId   │
│ user: ObjectId  │    │ user: ObjectId  │    │ user: ObjectId  │
│ items: Array    │    │ type: String    │    │ product:        │
│ total: Number   │    │ title: String   │    │   ObjectId      │
│ status: String  │    │ message: String │    │ rating: Number  │
│ createdAt: Date │    │ read: Boolean   │    │ review: String  │
│ updatedAt: Date │    │ createdAt: Date │    │ helpful: Number │
└─────────────────┘    │ updatedAt: Date │    │ createdAt: Date │
                       └─────────────────┘    │ updatedAt: Date │
                                              └─────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GAMIFICATION  │    │   ANALYTICS     │    │   ACTIVITIES    │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ _id: ObjectId   │    │ _id: ObjectId   │    │ _id: ObjectId   │
│ user: ObjectId  │    │ type: String    │    │ user: ObjectId  │
│ points: Number  │    │ data: Object    │    │ activity: String│
│ level: String   │    │ timestamp: Date │    │ data: Object    │
│ badges: Array   │    │ createdAt: Date │    │ timestamp: Date │
│ achievements:   │    └─────────────────┘    │ createdAt: Date │
│   Array         │                           └─────────────────┘
│ streak: Number  │
│ leaderboard:    │
│   Number        │
│ createdAt: Date │
│ updatedAt: Date │
└─────────────────┘
```

## Key Relationships:

### One-to-Many Relationships:
- **User → Products**: One user can upload many products
- **User → Orders**: One user can have many orders
- **User → Reviews**: One user can write many reviews
- **Brand → Products**: One brand can have many products
- **Product → Reviews**: One product can have many reviews

### Many-to-Many Relationships:
- **Users ↔ Products**: Through reviews, favorites, cart
- **Users ↔ Brands**: Through preferences, following

## Indexes for Performance:
```javascript
// Users Collection
db.users.createIndex({ "username": 1 }, { unique: true })
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "role": 1 })

// Products Collection
db.products.createIndex({ "name": "text", "description": "text", "material": "text" })
db.products.createIndex({ "brand": 1 })
db.products.createIndex({ "category": 1 })
db.products.createIndex({ "sustainabilityScore": -1 })
db.products.createIndex({ "price": 1 })

// Brands Collection
db.brands.createIndex({ "name": 1 })
db.brands.createIndex({ "approved": 1 })

// Orders Collection
db.orders.createIndex({ "user": 1 })
db.orders.createIndex({ "status": 1 })

// Reviews Collection
db.reviews.createIndex({ "product": 1 })
db.reviews.createIndex({ "user": 1 })
```

## Data Validation Rules:
- **Username**: Unique, 3-20 characters
- **Email**: Valid email format, unique
- **Password**: Minimum 8 characters, hashed
- **Price**: Positive number
- **Sustainability Score**: 0-10 range
- **Rating**: 1-5 stars
- **Required Fields**: Name, description, price for products 
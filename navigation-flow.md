graph TD
    A[Landing Page] --> B[Browse Products]
    A --> C[Login/Register]
    B --> D[Product Details]
    B --> E[Cart]
    D --> E
    E --> F[Checkout]
    F --> G[Order Confirmation]
    
    C --> H[User Dashboard]
    H --> I[Profile Management]
    H --> J[Order History]
    H --> K[Sustainability Impact]
    H --> L[Community Features]
    
    B --> M[Search & Filters]
    M --> D
    
    D --> N[Add to Wishlist]
    D --> O[Write Review]
    
    style A fill:#14532d,stroke:#ffd166,stroke-width:4px,color:#ffffff
    style H fill:#e07a5f,stroke:#ffd166,stroke-width:3px,color:#ffffff
    style F fill:#ffd166,stroke:#14532d,stroke-width:3px,color:#14532d 
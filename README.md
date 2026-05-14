# Pet and Found 🐾

A high-performance, serverless social impact platform for rescuing and locating lost pets. 

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Database/Auth:** Firebase (Firestore + Firebase Auth)
- **Infrastructure:** Vercel (ISR for Pet Profiles)
- **Maps:** Leaflet.js & OpenStreetMap
- **Containerization:** Docker (Dev environment with Firebase Emulators)

## Architectural Highlights
- **ISR (Incremental Static Regeneration):** Pet profile pages are cached and updated every 60 seconds to optimize SEO and performance.
- **Geospatial Indexing:** Implementation of Geohashes for efficient Firestore proximity queries.
- **Serverless Architecture:** Zero-cost maintenance for low traffic.

## Getting Started

### Prerequisites
- Docker & Docker Compose
- Firebase Project Credentials

### Local Development
1. Clone the repository:
   ```bash
   git clone [https://github.com/your-user/pet-and-found.git](https://github.com/your-user/pet-and-found.git)

2. Set up environment variables:
Copy .env.example to .env.local and fill in your Firebase/Cloudinary keys.

Spin up the environment:
    ```bash
    docker-compose up```

- App: `http://localhost:3000`
- Firebase Emulator UI: `http://localhost:4000`

## License
MIT
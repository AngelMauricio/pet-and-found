# Pet and Found 🐾

A high-performance, serverless social impact platform for rescuing and locating lost pets. 

## Tech Stack
- **Framework:** Next.js 14+ (App Router)
- **Database & Auth:** Firebase (Firestore + Firebase Auth)
- **Storage:** Cloudflare R2 (S3-compatible API)
- **Maps:** Leaflet.js & OpenStreetMap
- **Styling:** Tailwind CSS

## Architectural Highlights
- **Direct-to-Bucket Uploads:** Utilizes presigned URLs via AWS SDK. Images are uploaded directly from the client's browser to Cloudflare R2, entirely bypassing Vercel's serverless function payload limits.
- **Secure File Deletion:** Backend API validates Firebase Admin Auth tokens to ensure users can only delete their own images.
- **ISR (Incremental Static Regeneration):** Pet profile pages are cached and updated to optimize SEO and performance.
- **Serverless Architecture:** Highly scalable and zero-cost maintenance for low-to-medium traffic.

## Getting Started

### Prerequisites
- Node.js 18+
- A Firebase Project (with Auth and Firestore enabled)
- A Cloudflare Account (with R2 enabled)

### 1. Clone the repository
```bash
git clone [https://github.com/your-user/pet-and-found.git](https://github.com/your-user/pet-and-found.git)
cd pet-and-found
npm install
```

### 2. Environment Variables
Create a .env.local file in the root directory. You will need credentials from both Firebase and Cloudflare R2:

```bash
# --- PUBLIC FIREBASE (Client-side) ---
NEXT_PUBLIC_FIREBASE_API_KEY="your_api_key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your_project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your_project_id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your_project.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
NEXT_PUBLIC_FIREBASE_APP_ID="your_app_id"

# --- PRIVATE FIREBASE ADMIN (Server-side) ---
FIREBASE_PROJECT_ID="your_project_id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-...@your_project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# --- CLOUDFLARE R2 (Server-side & Client URL) ---
R2_ACCOUNT_ID="your_cloudflare_account_id"
R2_ACCESS_KEY_ID="your_r2_access_key"
R2_SECRET_ACCESS_KEY="your_r2_secret_key"
R2_BUCKET_NAME="pet-and-found-uploads"
NEXT_PUBLIC_R2_PUBLIC_URL="[https://pub-your-custom-r2-url.r2.dev](https://pub-your-custom-r2-url.r2.dev)"
```

### 3. Cloudflare R2 CORS Configuration
To allow direct uploads from the browser, you must configure CORS on your R2 bucket. Go to your Cloudflare Dashboard -> R2 -> Settings -> CORS Policy, and add the following JSON:

```JSON
[
  {
    "AllowedOrigins": [
      "http://localhost:3000"
    ],
    "AllowedMethods": ["PUT", "GET", "DELETE", "POST"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": []
  }
]
```

### 4. Firestore Security Rules
To ensure data security while allowing public map visualization, update your Firestore rules in the Firebase Console:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /reports/{reportId} {
      allow read: if true;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

### 5. Run the Application
Start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## License
This project is licensed under the MIT License.

## Credits
* **Icons:** [Flaticon](https://www.flaticon.com/)
* **Map Data:** [OpenStreetMap](https://www.openstreetmap.org/)
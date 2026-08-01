# GreenCart

A full-stack grocery e-commerce application featuring separate customer and seller workflows. Built using React (Vite) for the frontend and Node.js/Express with MongoDB for the backend.

## Features

### Customer
* **Product Catalog:** Browse items by category with detailed product views.
* **Persistent Cart:** Cart state syncs directly to the user account.
* **Address Management:** Save and manage multiple delivery addresses.
* **Checkout:** Supports Cash on Delivery (COD) and Stripe card payments.
* **Order Tracking:** Access complete order history.

### Seller
* **Inventory Management:** Add, update, or toggle stock status for products.
* **Cloudinary Uploads:** Seamless media management for product listings.
* **AI Product Generation:** Auto-generate titles, descriptions, categories, and tags using Google Gemini.
* **Order Processing:** Monitor and manage incoming customer orders.

### Authentication
* **JWT-Based Auth:** Separate cookie-based sessions for customers and sellers.
* **Graceful Session Handling:** Automatic redirection to login on seller session expiration.

---

## Tech Stack

* **Frontend:** React 19, Vite, React Router v6, Tailwind CSS v4, Axios
* **Backend:** Node.js, Express, MongoDB (Mongoose), JWT, bcryptjs
* **Third-Party Services:** Stripe, Cloudinary, Google Gemini API

---

## Repository Structure

```
.
├── grocery/            # React frontend
│   └── src/
│       ├── components/  # Navigation, UI components, modals
│       ├── pages/        # Customer and seller views
│       ├── context/       # Global state and API config
│       └── assets/         # Static assets
└── server/              # Express backend
    ├── configs/           # DB, Cloudinary, and Gemini configurations
    ├── controllers/        # Route handlers
    ├── middlewares/         # Authentication logic
    ├── models/               # Mongoose schemas
    └── routes/                # API endpoints
```

---

## Quick Start

### 1. Server Setup

Navigate to the backend directory and install dependencies:

```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:

```dotenv
PORT=4000
MONGODB_URI="your-mongodb-connection-string"
JWT_SECRET="your-jwt-secret"

SELLER_EMAIL="admin@example.com"
SELLER_PASSWORD="your-seller-password"

CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

GEMINI_API_KEY="your-gemini-key"
```

Start the development server:

```bash
npm run server
```

### 2. Client Setup

Navigate to the frontend directory and install dependencies:

```bash
cd grocery
npm install
```

Create a `.env` file in the `grocery/` directory:

```dotenv
VITE_BACKEND_URL="http://localhost:4000"
VITE_CURRENCY="₹"
```

Start the Vite development server:

```bash
npm run dev
```

App accessible at `http://localhost:5173`. Seller login available at `/seller`.

---

## Local Payment Testing (Stripe)

Webhooks can be forwarded locally using the Stripe CLI:

```bash
stripe login
stripe listen --forward-to localhost:4000/stripe
```

Update `STRIPE_WEBHOOK_SECRET` in `server/.env` with the signature key printed by the CLI.

Alternatively, the application includes a fallback verification endpoint (`/api/order/verify-stripe`) for basic local testing without webhooks.

---

## Deployment

1. **Backend:** Deploy `server/` as a standalone web service (e.g., Vercel, Render). Configure all environment variables in your project settings.
2. **Webhooks:** Register your production backend URL (`https://your-backend-domain.com/stripe`) in the Stripe Dashboard to obtain your live webhook secret.
3. **Frontend:** Deploy `grocery/` (e.g., Vercel, Netlify). Set `VITE_BACKEND_URL` to point to your live backend domain.
4. **CORS:** Ensure your frontend URL is included in `allowedOrigins` within `server/server.js`.

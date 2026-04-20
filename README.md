# Admin Dashboard - Dhia Store

A separate admin panel for managing the Dhia Store e-commerce platform.

## Features

- **Authentication**: Secure login with email and password
- **Dashboard**: Overview of key metrics and recent activity
- **Product Management**: Full CRUD operations for products
- **Order Management**: View and manage customer orders
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **State Management**: Redux Toolkit
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Backend server running on port 4000

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Default Admin Credentials

- **Email**: admin@dhiastore.com
- **Password**: admin123

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Navigation.tsx   # Main navigation component
├── pages/              # Page components
│   ├── LoginPage.tsx   # Admin login page
│   ├── DashboardPage.tsx # Dashboard overview
│   ├── ProductsPage.tsx # Product management
│   └── OrdersPage.tsx  # Order management
├── store/              # Redux store configuration
│   ├── index.ts        # Store setup
│   └── authSlice.ts    # Authentication state
├── types/              # TypeScript type definitions
│   └── index.ts        # Shared types
└── utils/              # Utility functions
    └── api.ts          # API service functions
```

## API Endpoints

The admin panel communicates with the backend through these endpoints:

### Authentication

- `POST /api/admin/login` - Admin login

### Dashboard

- `GET /api/admin/dashboard/stats` - Get dashboard statistics

### Products

- `GET /api/admin/products` - Get all products
- `GET /api/admin/products/:id` - Get product by ID
- `POST /api/admin/products` - Create new product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product

### Orders

- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/orders/:id` - Get order by ID
- `PATCH /api/admin/orders/:id/status` - Update order status
- `DELETE /api/admin/orders/:id` - Delete order

## Features Overview

### Dashboard

- Total products count
- Total orders count
- Pending orders count
- Total revenue
- Recent orders and products

### Product Management

- View all products with images
- Create new products with variants and images
- Edit existing products
- Delete products
- Manage product variants (colors, sizes, stock)

### Order Management

- View all customer orders
- Update order status (Pending → Confirmed → Shipped → Delivered)
- View detailed order information
- Delete orders
- Customer contact information

## Security

- JWT-based authentication
- Protected routes require valid admin token
- Password hashing with bcrypt
- Token expiration (24 hours)

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Environment Variables

Create a `.env` file in the project root with:

```env
VITE_API_URL=http://localhost:4000/api
```

Vite only exposes environment variables that start with `VITE_`, so `API_BASE_URL` will not be available in `import.meta.env`.

## Deployment

1. Build the project:

```bash
npm run build
```

2. Serve the `dist` folder with a web server like nginx or Apache

3. Ensure the backend API is accessible from the deployed frontend

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the Dhia Store e-commerce platform.

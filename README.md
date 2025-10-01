# AXIO QR Code Platform

A modern QR code generator platform with authentication, analytics, and advanced customization features.

## Features

- 🔐 User authentication with NextAuth.js
- 🎨 Advanced QR code customization (colors, logos, styles)
- 📊 Comprehensive analytics dashboard
- 🌙 Dark/light theme support
- 📱 Responsive design
- 🚀 Deployed on Vercel

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Deployment**: Vercel
- **QR Generation**: qrcode, qr-code-styling

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Run database migrations: `npx prisma migrate dev`
5. Start development server: `npm run dev`

## Environment Variables

```
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
```

## Deployment

The app is automatically deployed to Vercel when changes are pushed to the main branch.

## License

MIT

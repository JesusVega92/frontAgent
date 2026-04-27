# frontAgent - AGENTS.md

## Tech Stack
- Next.js 16 (App Router)
- Tailwind CSS v4
- MongoDB + Mongoose
- NextAuth.js (Credentials + OAuth)

## Developer Commands
```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Project Structure
```
app/
├── api/
│   ├── auth/[...nextauth]/   # NextAuth handlers
│   ├── chat/                 # AI chat proxy
│   └── spaces/              # Space management
│       ├── route.ts           # GET, POST spaces
│       └── [id]/route.ts    # GET, PUT, DELETE single space
├── (auth)/                  # Public auth routes (login, register)
├── (dashboard)/            # Protected routes (dashboard, chat, users, spaces)
│   ├── dashboard/           # Main analytics dashboard
│   ├── chat/              # AI chat interface
│   ├── users/            # User management (admin only)
│   └── spaces/           # Space management (admin/dev)
components/                  # Reusable React components
│   └── SpaceCard.tsx       # Space card with toggle states
lib/                        # Utilities (db, auth config)
models/                     # Mongoose schemas
│   ├── User.ts             # User with roles: admin/dev/aux/guest
│   └── Space.ts           # Space model (title, description, occupancy)
scripts/                    # Seed scripts
│   └── seed.ts            # DB seeding (admin user + initial spaces)
```

## Key Conventions
- **Routing**: Use route groups `(auth)` and `(dashboard)` for route splitting
- **AI API**: Proxy through `/api/chat` - configure `AI_API_URL` in .env
- **Auth**: NextAuth with MongoDB adapter for session storage
- **Styling**: Tailwind v4 uses `@import "tailwindcss"` in globals.css (not @tailwind directives)
- **Dark mode**: CSS variables in `:root` with `prefers-color-scheme`
- **Space management**: `/dashboard/spaces` - admin/dev only
- **Roles**: admin, dev, aux, guest (defined in models/User.ts)
- **Space toggle**: Click to occupy/release spaces (owner or admin can release)

## Environment Variables
Copy `.env.example` to `.env.local` and fill in:
- `MONGODB_URI` - MongoDB connection string
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `AI_API_URL` - Your AI backend endpoint

## Important Notes
- Next.js 16+ uses React 19 - check for breaking changes
- Tailwind v4 config is in CSS via `@theme` - no separate tailwind.config.ts
- Route groups use parentheses: `(groupName)` 
- API routes in `(dashboard)` need session check (protected)
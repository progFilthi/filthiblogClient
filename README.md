# FilthiBlog

A modern, full-stack blogging platform built with Next.js, TypeScript, and Spring Boot. FilthiBlog delivers a smooth writing and reading experience with clean API design, JWT-based authentication, and a production-ready architecture.

## ✨ Features

- **Fully Responsive Design** - Optimized experience across all devices
- **Rich Text Editor** - Custom editor powered by React Quill for enhanced content creation
- **Secure Authentication** - JWT-based auth with role-based access control
- **Interactive Features** - Commenting system with pagination
- **SEO-Ready** - Optimized blog pages for search engines
- **Modern Stack** - Built with Next.js App Router and TypeScript
- **Docker-Ready** - Containerized backend for easy deployment
- **Clean Architecture** - Modular component structure designed for scalability

## 🛠️ Tech Stack

### Frontend
- **Next.js** (App Router) - React framework with server components
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **React Query / SWR** - Data fetching and state management
- **React Quill** - Rich text editing
- **Geist Font** - Modern typography via Vercel

### Backend
- **Spring Boot 3+** - Java-based REST API
- **Spring Security** - Authentication and authorization
- **JWT** - Stateless token-based auth
- **PostgreSQL** - Relational database
- **Docker** - Containerization

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm/yarn/pnpm/bun
- Java 17+ (for backend)
- PostgreSQL
- Docker (optional)

### Frontend Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/filthblog.git
cd filthblog
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Configure environment variables**

Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

4. **Run the development server**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

5. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

### Development
Start editing by modifying `app/page.tsx`. The page will auto-update as you save changes.

## 📁 Project Structure

```
filthblog/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard pages
│   ├── posts/             # Blog post pages
│   ├── api/               # API routes (if any)
│   └── globals.css        # Global styles
├── components/            # Reusable React components
│   ├── rich-text/         # Rich text editor components
│   └── ui/                # UI components
├── lib/                   # Utility functions and configs
├── hooks/                 # Custom React hooks
├── public/                # Static assets
└── .env.local            # Environment variables (create this)
```

## 🔌 API Endpoints

The frontend communicates with a Spring Boot backend. Key endpoints include:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | User authentication |
| POST | `/auth/register` | New user registration |
| GET | `/posts` | Fetch paginated posts |
| POST | `/posts` | Create new post (authenticated) |
| GET | `/posts/{id}` | Fetch single post details |
| POST | `/posts/{id}/comments` | Add comment to post |

## 🔐 Authentication

FilthiBlog uses JWT (JSON Web Tokens) for secure, stateless authentication. Role-based access control ensures proper permissions for different user types.

## 🎨 Styling

The project uses Tailwind CSS for styling with custom configurations. The design is fully responsive and optimized for modern browsers.

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js Learn Tutorial](https://nextjs.org/learn)
- [Next.js GitHub Repository](https://github.com/vercel/next.js)
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)

## 🚢 Deployment

### Frontend (Recommended: Vercel)

The easiest way to deploy FilthiBlog is using [Vercel](https://vercel.com/):

1. Push your code to GitHub
2. Import your repository in Vercel
3. Configure environment variables
4. Deploy!

See the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

### Backend Deployment Options

- **Render** - Simple cloud hosting
- **Railway** - Developer-friendly platform
- **Fly.io** - Global application platform
- **DigitalOcean** - Droplets or App Platform
- **AWS / GCP / Azure** - Enterprise cloud solutions
- **Any Docker-compatible host**

### Pre-Deployment Checklist
- [ ] Configure CORS settings for your frontend domain
- [ ] Set production environment variables
- [ ] Update `NEXT_PUBLIC_API_URL` to production backend URL
- [ ] Configure database connection for production
- [ ] Set up SSL certificates
- [ ] Configure authentication secrets

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👤 Author

Your Name - [@progFilthi](https://github.com/progFilthi)

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Spring Boot](https://spring.io/projects/spring-boot)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

---

**FilthiBlog** - Modern blogging made simple.

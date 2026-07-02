# UFFI Solutions - Technical Documentation

## 1. Executive Summary
**Project Overview**: UFFI Solutions is a digital platform for selling and managing infoproducts, courses, and premium content. The application provides a seamless learning experience, supporting multiple languages, secure authentication, and robust administrative tools for content management.
**Tech Stack**: 
- **Frontend**: React 18 (Vite)
- **Styling**: TailwindCSS, Radix UI (shadcn/ui), Framer Motion (animations)
- **Routing**: React Router v6
- **State Management**: React Context API (Auth, Translations, Notifications, Favorites)
- **Backend/BaaS**: Supabase (PostgreSQL, Auth, Storage)

## 2. Component Architecture
### Component Hierarchy & Data Flow
- **App (Root)**
  - `AuthProvider`, `I18nProvider`, `ThemeProvider`, `NotificationProvider`, `FavoritesProvider`
  - **Router**
    - **Public Pages** (`UffiSolutions`, `Catalog`, `CourseDetailPage`, `Login`, `Register`)
      - `Header` / `Footer`
      - `CourseCard`, `CategoryFilter`, `PremiumContentModal`
    - **Protected Pages** (`DashboardPage`, `CourseLearningPage`, `ProfilePage`)
      - Context Consumers: `useAuth`, `useI18n`
      - Features: Video playback, PDF viewing, Progress tracking
    - **Admin Pages** (`AdminPage`, `AdminProductsPage`, `AdminCourseContentPage`)
      - `useSuperAdminCheck` (Role-based access)
      - CRUD Operations via Modals and Supabase queries

**State Management Pattern**:
- Global state managed via modular Contexts (`AuthContext` for user session, `I18nContext` for localization).
- Component-level state via `useState` and `useEffect` for local UI behavior and data fetching.
- Async state handling with `loading` and `error` flags, integrated with `toast` notifications.

## 3. Database Schema (Supabase)
### Core Tables & Relationships
- **profiles**: `id` (PK, Auth UUID), `email`, `full_name`, `whatsapp`, `xp`, `level`, `created_at`.
- **categories**: `id` (PK), `slug`, `icon`, `color`, `sort_order`, `active`.
- **category_translations**: `id` (PK), `category_id` (FK), `language`, `name`.
- **products**: `id` (PK), `category_id` (FK), `slug`, `price`, `is_free`, `image_url`, `stripe_link`, `drive_link`, `content_url`, `active`.
- **product_translations**: `id` (PK), `product_id` (FK), `language`, `name`, `description`.
- **course_content**: `id` (PK), `course_id` (FK), `title`, `description`, `type` (video, pdf, text, link), `url`, `is_preview`, `order_index`.
- **purchases**: `id` (PK), `product_id` (FK), `buyer_email`, `status`, `created_at`.
- **user_progress**: `id` (PK), `user_id` (FK), `lesson_id` (FK), `completed`, `completed_at`.

## 4. Data Flow Diagrams
- **User Authentication Flow**:
  User enters credentials -> `supabase.auth.signInWithPassword()` / `signUp()` -> Token stored securely -> `onAuthStateChange` triggered -> `AuthContext` updates user/profile -> App rerenders protected routes.
- **Course Enrollment Flow (Free)**:
  User clicks "Acessar Grátis" -> Redirected to `/courses/:slug` -> Checks `is_free` flag -> Grants immediate access to `CourseLearningPage`.
- **Product Purchase Flow (Paid)**:
  User clicks "Comprar" -> Redirected to `stripe_link` -> Webhook triggers insert into `purchases` table mapping to `buyer_email` -> User returns -> Dashboard fetches purchases matching email -> Unlocks content.
- **Admin Management Flow**:
  Admin accesses `/admin/*` -> `useSuperAdminCheck` verifies email against `ADMIN_EMAILS` array -> Fetches data (e.g., `products` + `translations`) -> Form updates sent to Supabase -> Local state updated on success.

## 5. Route Mapping
### Public Routes
- `/` - Home Page (`UffiSolutions.jsx`)
- `/catalog` - Full Course/Product Catalog (`Catalog.jsx`)
- `/courses/:slug` - Course Sales / Detail Page (`CourseDetailPage.jsx`)
- `/curso/:id` - Legacy Checkout Redirect (`CourseCheckoutPage.jsx`)
- `/login`, `/register`, `/password-reset` - Authentication
- `/termos`, `/privacidade`, `/contato` - Legal & Info

### Protected Routes (Require Login)
- `/dashboard` - User's purchased and free courses (`DashboardPage.jsx`)
- `/profile` - User Profile settings (`ProfilePage.jsx`)
- `/courses/:slug/learn` - Active learning environment (`CourseLearningPage.jsx`)
- `/notifications`, `/favorites`, `/my-products` - User engagement pages

### Admin Routes (Require Admin Email)
- `/admin` - Admin Hub (`AdminPage.jsx`)
- `/admin/products` - Multi-language product management (`AdminProductsPage.jsx`)
- `/admin/course-content` - Modules/Lessons management (`AdminCourseContentPage.jsx`)
- `/admin/courses` - Legacy course structurer (`AdminCoursesPage.jsx`)

## 6. File Structure
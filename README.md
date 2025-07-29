# 🏠 IDRHub - Real Estate Platform

A modern, full-featured real estate platform built with React, TypeScript, and Supabase. IDRHub connects buyers, agents, and property seekers with a comprehensive suite of tools for property management, search, and communication.

## ✨ Features Overview

### 🔐 **User Authentication & Profiles**
- **Multi-Role System**: Buyers, Agents, and Admin roles
- **Secure Authentication**: Email/password with Supabase Auth
- **Profile Management**: Editable user profiles with avatar upload
- **Role-Based Access**: Different features and dashboards per role
- **Session Management**: Automatic session handling and persistence

### 🏘️ **Property Management**
- **Property Listings**: Comprehensive property details with images
- **Advanced Search**: Filter by location, price, bedrooms, bathrooms, etc.
- **Property Categories**: House, Condo, Apartment, Townhouse
- **Status Tracking**: Available, Pending, Sold, Rented
- **Image Galleries**: Multiple property images with carousel
- **Property Details**: Full property information with amenities

### 👥 **Agent Features**
- **Agent Dashboard**: Complete agent management interface
- **Property Management**: Add, edit, delete properties
- **Statistics & Analytics**: Performance metrics and insights
- **Review System**: Agent ratings and reviews from buyers
- **Verification System**: Admin approval for agent accounts
- **Commission Tracking**: Sales and commission management

### 💬 **Communication System**
- **Messaging System**: Direct communication between buyers and agents
- **Property Inquiries**: Send inquiries about specific properties
- **Real-time Updates**: Live messaging with Supabase subscriptions
- **Message History**: Complete conversation history
- **Notification System**: Real-time notifications with badges

### ❤️ **Favorites & Wishlist**
- **Save Properties**: Add properties to favorites
- **Favorites Page**: View all saved properties
- **Quick Actions**: Easy add/remove from favorites
- **Favorites Count**: Track number of saved properties
- **Cross-device Sync**: Favorites sync across devices

### 🔍 **Search & Discovery**
- **Advanced Filters**: Multiple search criteria
- **Location Search**: City, state, and address-based search
- **Price Range**: Filter by price range
- **Property Type**: Filter by property category
- **Grid/List View**: Toggle between view modes
- **Sort Options**: Sort by price, date, popularity

### 📊 **Analytics & Statistics**
- **Agent Dashboard**: Performance metrics for agents
- **Property Views**: Track property view counts
- **Likes & Favorites**: Monitor property popularity
- **Inquiry Tracking**: Track buyer interest
- **Review Analytics**: Agent rating breakdowns
- **Sales Statistics**: Commission and sales tracking

### ⭐ **Review System**
- **Agent Reviews**: Buyers can review agents
- **Property Reviews**: Reviews for specific properties
- **Rating Display**: Star ratings and review counts
- **Review Management**: Agents can view and respond to reviews
- **Review Analytics**: Detailed review breakdowns

### 🎯 **Admin Panel**
- **User Management**: Manage all users and roles
- **Agent Verification**: Approve/reject agent applications
- **Property Moderation**: Review and approve properties
- **System Statistics**: Platform-wide analytics
- **Content Management**: Manage featured properties

### 🔐 **Advanced Admin Controls**
- **Audit Logs**: Comprehensive tracking of all system changes with detailed user actions, IP addresses, and timestamps
- **Role Editor**: Create custom roles with specific permissions and granular access control
- **Real-time User Activity**: Monitor who's online, track user sessions, and view current page activities
- **Security Compliance**: Full audit trail for compliance and security monitoring
- **Activity Analytics**: Real-time user activity analytics and reporting

### 🔔 **Notification System**
- **Real-time Notifications**: Live notification updates
- **Notification Badges**: Unread count display in header
- **Multiple Types**: Info, success, warning, error notifications
- **Mark as Read**: Individual and bulk read actions
- **Notification Filters**: Filter by read/unread status
- **Beautiful UI**: Modern notification design with animations

### 🏠 **Property Tours**
- **Tour Scheduling**: Schedule property viewings
- **Tour Management**: Agents can manage scheduled tours
- **Calendar Integration**: Tour calendar view
- **Tour Status**: Track tour completion status
- **Tour Notes**: Add notes and feedback

### 💰 **Financial Features**
- **Price Formatting**: Indian Rupee (INR) formatting
- **Currency Converter**: Built-in currency conversion
- **Commission Tracking**: Agent commission calculations
- **Price Analytics**: Property price trends

### 📱 **Responsive Design**
- **Mobile-First**: Optimized for all screen sizes
- **Progressive Web App**: PWA capabilities
- **Touch-Friendly**: Mobile-optimized interactions
- **Cross-Browser**: Works on all modern browsers

### 🎨 **Modern UI/UX**
- **Beautiful Design**: Modern, clean interface
- **Smooth Animations**: Framer Motion animations
- **Loading States**: Elegant loading indicators
- **Error Handling**: User-friendly error messages
- **Toast Notifications**: Success/error feedback
- **Gradient Design**: Beautiful gradient elements

## 🛠️ **Technical Stack**

### **Frontend**
- **React 18**: Modern React with hooks
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Smooth animations
- **React Router**: Client-side routing
- **React Hot Toast**: Toast notifications

### **Backend & Database**
- **Supabase**: Backend-as-a-Service
- **PostgreSQL**: Relational database
- **Real-time Subscriptions**: Live data updates
- **Row Level Security**: Database security
- **File Storage**: Image and file uploads

### **Development Tools**
- **Vite**: Fast build tool
- **ESLint**: Code linting
- **TypeScript**: Type checking
- **Git**: Version control

## 📁 **Project Structure**

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Shared components (Header, Footer, etc.)
│   ├── properties/     # Property-related components
│   ├── search/         # Search components
│   └── tours/          # Tour management components
├── contexts/           # React contexts (Auth, etc.)
├── hooks/              # Custom React hooks
├── lib/                # External library configurations
├── pages/              # Page components
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── uploads/            # File uploads
```

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 16+ 
- npm or yarn
- Supabase account

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/idrhub.git
   cd idrhub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Add your Supabase credentials to `.env.local`

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔧 **Configuration**

### **Supabase Setup**
1. Create a new Supabase project
2. Run the database migrations in `supabase/migrations/`
3. Set up Row Level Security policies
4. Configure authentication settings
5. Set up file storage buckets

### **Environment Variables**
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📊 **Database Schema**

### **Core Tables**
- `users` - User accounts and profiles
- `properties` - Property listings
- `agents` - Agent information
- `favorites` - User favorite properties
- `inquiries` - Property inquiries
- `messages` - User messages
- `notifications` - System notifications
- `reviews` - Agent and property reviews
- `tours` - Property tour scheduling

### **Admin & Security Tables**
- `audit_logs` - Comprehensive audit trail of all system changes
- `user_activity` - Real-time user activity tracking and session management
- `custom_roles` - Custom role definitions with specific permissions

## 🎯 **Key Features in Detail**

### **Property Management**
- ✅ Add new properties with multiple images
- ✅ Edit property details (except price)
- ✅ Delete properties
- ✅ Property status management
- ✅ Image gallery with carousel
- ✅ Property verification system

### **Search & Discovery**
- ✅ Advanced search filters
- ✅ Location-based search
- ✅ Price range filtering
- ✅ Property type filtering
- ✅ Grid and list view modes
- ✅ Sort by various criteria

### **User Experience**
- ✅ Responsive design for all devices
- ✅ Smooth animations and transitions
- ✅ Loading states and error handling
- ✅ Toast notifications for feedback
- ✅ Real-time updates
- ✅ Offline capabilities

### **Agent Dashboard**
- ✅ Property management interface
- ✅ Performance analytics
- ✅ Review management
- ✅ Tour scheduling
- ✅ Commission tracking
- ✅ Statistics and insights

### **Admin Features**
- ✅ User management
- ✅ Agent verification
- ✅ Property moderation
- ✅ System analytics
- ✅ Content management

## 🔒 **Security Features**

- **Row Level Security**: Database-level security
- **Authentication**: Secure user authentication
- **Authorization**: Role-based access control
- **Input Validation**: Client and server-side validation
- **File Upload Security**: Secure file handling
- **SQL Injection Protection**: Parameterized queries

## 📈 **Performance Optimizations**

- **Code Splitting**: Lazy loading of components
- **Image Optimization**: Compressed and optimized images
- **Caching**: Efficient data caching
- **Bundle Optimization**: Minimal bundle size
- **Real-time Updates**: Efficient subscriptions

## 🧪 **Testing**

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📦 **Deployment**

### **Vercel (Recommended)**
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically

### **Netlify**
1. Build the project: `npm run build`
2. Deploy the `dist` folder

### **Manual Deployment**
1. Build: `npm run build`
2. Serve the `dist` folder with any static server

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **Supabase** for the backend infrastructure
- **Tailwind CSS** for the styling framework
- **Framer Motion** for animations
- **Lucide React** for icons
- **React Hot Toast** for notifications

## 📞 **Support**

For support, email idrhubsupport@google.com or create an issue in the repository.

---

**IDRHub** - Connecting people with their perfect properties! 🏠✨ 

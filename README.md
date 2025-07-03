# <img src="client/assets/images/icon.png" alt="Quizzly Bears" width="36" height="36"> Quizzly Bears

> **Final Project for Web Development Studies**  
> Created by a team of 5 web development students as our capstone project.

## 📱 About

Quizzly Bears is an interactive quiz application that combines the power of AI-generated content with gamification elements. Challenge yourself with quizzes on any topic you can imagine, or choose from our carefully curated categories. Earn points, unlock medals, and compete with friends in this engaging learning experience!

## ✨ Key Features

### 🤖 AI-Powered Quiz Generation

- **Custom Topics**: Enter any topic and our AI will generate a personalized quiz just for you
- **Intelligent Questions**: Dynamic question generation ensures fresh content every time
- **Adaptive Difficulty**: Questions tailored to provide the right level of challenge

### 📚 Predefined Categories

Choose from our 7 expertly curated categories:

- Science
- History
- Sports
- Geography
- Media
- Culture
- Daily Life

### 🏆 Gamification System

- **Points System**: Earn points for correct answers and quick responses
- **Medal Collection**: Unlock bronze, silver, and gold medals for achievements
- **Progress Tracking**: Monitor your performance across different categories
- **Leaderboards**: Compare your scores with friends and other players

### 👥 Social Features

- **Friend System**: Connect with other quiz enthusiasts
- **Friend Invitations**: Send and receive friend requests
- **Social Competition**: Challenge your friends and see who's the ultimate quiz master

### 📊 Statistics & Analytics

- **Performance Tracking**: Detailed statistics on your quiz performance
- **Category Insights**: See which topics are your strongest and weakest
- **Progress Visualization**: Beautiful charts and graphs to track your improvement

## 🛠️ Technology Stack

### Frontend (Mobile App)

- **React Native** with **Expo** - Cross-platform mobile development
- **TypeScript** - Type-safe development
- **Expo Router** - File-based navigation system
- **React Native Reanimated** - Smooth animations
- **Clerk** - Authentication and user management
- **Axios** - API communication

### Backend (Server)

- **Node.js** with **Express** - RESTful API server
- **TypeScript** - Type-safe backend development
- **MongoDB** with **Mongoose** - Database and ODM
- **Clerk Webhooks** - User management integration

### Design & UX

- **Custom Icons** - Handcrafted SVG icons for optimal performance
- **Modern UI** - Clean, intuitive interface design
- **Responsive Layout** - Optimized for various screen sizes
- **Custom Fonts** - Noto Sans typography for excellent readability

<!-- ## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- MongoDB instance
- Clerk account for authentication

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd quizzly-bears
   ```

2. **Install dependencies**
   ```bash
   # Install client dependencies
   cd client
   npm install

   # Install server dependencies
   cd ../server
   npm install
   ```

3. **Environment Setup**

   Create `.env` files in both client and server directories with necessary environment variables:

   **Client (.env)**
   ```
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
   EXPO_PUBLIC_API_URL=your_api_url
   ```

   **Server (.env)**
   ```
   MONGODB_URI=your_mongodb_connection_string
   CLERK_SECRET_KEY=your_clerk_secret_key
   CLERK_WEBHOOK_SECRET=your_webhook_secret
   ```

4. **Start the development servers**
   ```bash
   # Start the backend server
   cd server
   npm run go

   # In a new terminal, start the mobile app
   cd client
   npm start
   ```

5. **Run on your device**
   - Scan the QR code with Expo Go app (Android/iOS)
   - Or run `npm run android` / `npm run ios` for simulators -->

## 📱 App Structure

```
client/
├── app/                    # Main application screens
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main tab navigation
│   │   ├── play/          # Quiz gameplay screens
│   │   ├── profile/       # User profile and social features
│   │   └── statistics/    # Performance analytics
├── components/            # Reusable UI components
├── hooks/                 # Custom React hooks
├── providers/             # Context providers
├── styles/                # Theme and styling
├── utilities/             # Helper functions and types
└── assets/                # Images, icons, and fonts

server/
├── database/              # Database connection
├── models/                # MongoDB models
├── routes/                # API endpoints
└── types/                 # TypeScript type definitions
```

## 🎮 How to Play

1. **Sign Up/Login**: Create an account or sign in with Google/Facebook
2. **Choose Quiz Type**:
   - Select "Custom Topic" and enter any subject
   - Or pick from our 7 predefined categories
3. **Take the Quiz**: Answer questions within the time limit
4. **Earn Rewards**: Collect points and unlock medals
5. **Track Progress**: View your statistics and achievements
6. **Connect with Friends**: Add friends and compare scores

<!-- ## 🏅 Achievement System

- **Bronze Medal**: Complete your first quiz
- **Silver Medal**: Score 80% or higher on any quiz
- **Gold Medal**: Achieve perfect scores and maintain streaks
- **Category Master**: Excel in specific subject areas
- **Speed Demon**: Answer questions quickly and accurately -->

## 👥 Team

This project was developed by 5 dedicated web development students as our final capstone project. We combined our skills in frontend development, backend architecture, UI/UX design, and project management to create this comprehensive quiz application.

## 🤝 Contributing

While this is a student project, we welcome feedback and suggestions! Feel free to:

- Report bugs or issues
- Suggest new features
- Provide feedback on user experience
- Share ideas for additional quiz categories

## 📄 License

This project is developed for educational purposes as part of our web development curriculum.

## 🙏 Acknowledgments

- Thanks to our instructors for guidance throughout the development process
- Special thanks to the open-source community for the amazing tools and libraries
- Appreciation to our testing volunteers who helped refine the user experience

---

**Ready to test your knowledge? Download Quizzly Bears and start your quiz adventure today!** 🐻📚✨

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email?: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // In a real application, this would integrate with Clerk
  useEffect(() => {
    // Temporarily create a test user
    const testUser: User = {
      id: `user_${Math.random().toString(36).substring(2, 9)}`,
      name: `Player_${Math.random().toString(36).substring(2, 5)}`,
      email: 'test@example.com'
    };
    setUser(testUser);
  }, []);

  const value = {
    user,
    setUser,
    isAuthenticated: !!user,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

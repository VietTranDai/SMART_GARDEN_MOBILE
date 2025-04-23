import React, { createContext, useState, useContext, useEffect } from "react";
import { getItem, setItem, removeItem } from "@/utils/asyncStorage";

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: string;
  roleId: number;
  roleName?: string;
  gardener?: {
    experiencePoints: number;
    experienceLevelId: number;
    experienceLevel?: {
      level: number;
      title: string;
      icon: string;
    };
  };
};

type AuthCredentials = {
  username: string;
  password: string;
};

type UserContextType = {
  user: User | null;
  isLoading: boolean;
  signIn: (credentials: AuthCredentials) => Promise<void>;
  signOut: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if the user is already logged in
    async function loadUser() {
      try {
        const userData = await getItem<User>("@user");
        if (userData) {
          setUser(userData);
        }
      } catch (error) {
        console.error("Failed to load user data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  // Sign in function
  const signIn = async (credentials: AuthCredentials): Promise<void> => {
    try {
      // In a real app, this would be an API call to your backend
      // Mock login check updated to use username
      if (
        credentials.username === "gardener" && // Changed from email to username
        credentials.password === "password"
      ) {
        const userData: User = {
          id: "1",
          firstName: "John",
          lastName: "Garden",
          email: "gardener@test.com", // Keep email in user data for now
          profilePicture: "https://i.pravatar.cc/150?img=11",
          roleId: 2, // Gardener role ID
          roleName: "GARDENER",
          gardener: {
            experiencePoints: 750,
            experienceLevelId: 2,
            experienceLevel: {
              level: 2,
              title: "Garden Enthusiast",
              icon: "🌿",
            },
          },
        };

        await setItem("@user", userData);
        setUser(userData);
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    }
  };

  // Sign out function
  const signOut = async (): Promise<void> => {
    try {
      await removeItem("@user");
      setUser(null);
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  };

  const value = {
    user,
    isLoading,
    signIn,
    signOut,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

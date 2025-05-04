import React, { createContext, useState, useContext, useEffect } from "react";
import { AppUser } from "@/types/users";
import { isGardener } from "@/types/users/user.types";
import authService from "@/service/api/auth.service";
import { LoginCredentials } from "@/types/users";
import { userService } from "@/service/api";

type UserContextType = {
  user: AppUser | null;
  isLoading: boolean;
  error: string | null;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (userData: Partial<AppUser>) => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if the user is already authenticated
    async function loadUser() {
      try {
        setIsLoading(true);
        // Get auth data from storage
        const authData = await authService.getAuthData();

        if (authData?.access_token && authData?.user) {
          setUser(authData.user);
        } else {
          // If we have a token but no user data, try to fetch user data
          const isAuthenticated = await authService.isAuthenticated();
          if (isAuthenticated) {
            const userData = await authService.getCurrentUser();
            if (userData) {
              setUser(userData);
            }
          }
        }
        setError(null);
      } catch (error) {
        console.error("Failed to load user data:", error);
        setError("Failed to authenticate user");
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  // Sign in function
  const signIn = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const authData = await authService.login(
        credentials.username,
        credentials.password
      );

      if (authData.user) {
        setUser(authData.user);
      } else {
        // If login succeeded but user data wasn't returned, fetch it
        const userData = await authService.getCurrentUser();
        if (userData) {
          setUser(userData);
        }
      }
    } catch (error) {
      console.error("Sign in error:", error);
      setError("Invalid credentials or server error");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out function
  const signOut = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
      setError(null);
    } catch (error) {
      console.error("Sign out error:", error);
      setError("Failed to sign out");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update user profile
  const updateUserProfile = async (
    userData: Partial<AppUser>
  ): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // Call the user service to update the profile
      const updatedUser = await userService.updateProfile({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        dateOfBirth: userData.dateOfBirth,
        address: userData.address,
        bio: userData.bio,
        // profilePicture handled separately if it's a File
      });

      // Update the user state with the new data
      setUser((prevUser) => {
        if (!prevUser) return null;

        // Create updated user with base properties
        const updatedUserData = {
          ...prevUser,
          ...updatedUser,
        };

        // If the user is a Gardener, preserve Gardener-specific properties
        if (isGardener(prevUser)) {
          return {
            ...updatedUserData,
            experiencePoints: prevUser.experiencePoints,
            experienceLevel: prevUser.experienceLevel,
          } as AppUser;
        }

        return updatedUserData as AppUser;
      });
    } catch (error) {
      console.error("Profile update error:", error);
      setError("Failed to update profile");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    error,
    signIn,
    signOut,
    updateUserProfile,
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

"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  email: string;
  username: string;
}

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const session = localStorage.getItem("lost_memories_session");
        if (session) {
          setCurrentUser(JSON.parse(session));
        }
      } catch (e) {
        console.error("Failed to restore session:", e);
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      const usersStr = localStorage.getItem("lost_memories_users");
      const users = usersStr ? JSON.parse(usersStr) : [];
      
      const foundUser = users.find(
        (u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (!foundUser) {
        return { success: false, error: "Invalid email or credentials." };
      }

      const userSession: User = { email: foundUser.email, username: foundUser.username };
      localStorage.setItem("lost_memories_session", JSON.stringify(userSession));
      setCurrentUser(userSession);
      
      return { success: true };
    } catch (e) {
      return { success: false, error: "Authentication system failure." };
    }
  };

  const signup = async (email: string, username: string, password: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      const usersStr = localStorage.getItem("lost_memories_users");
      const users = usersStr ? JSON.parse(usersStr) : [];

      const emailExists = users.some(
        (u: any) => u.email.toLowerCase() === email.toLowerCase()
      );
      if (emailExists) {
        return { success: false, error: "Email address is already linked." };
      }

      const usernameExists = users.some(
        (u: any) => u.username.toLowerCase() === username.toLowerCase()
      );
      if (usernameExists) {
        return { success: false, error: "Username is already reserved." };
      }

      const newUser = { email, username, password };
      users.push(newUser);
      localStorage.setItem("lost_memories_users", JSON.stringify(users));

      const userSession: User = { email, username };
      localStorage.setItem("lost_memories_session", JSON.stringify(userSession));
      setCurrentUser(userSession);

      return { success: true };
    } catch (e) {
      return { success: false, error: "Account creation failure." };
    }
  };

  const logout = () => {
    localStorage.removeItem("lost_memories_session");
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

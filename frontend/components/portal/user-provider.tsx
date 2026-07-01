"use client";

import React, { createContext, useContext } from "react";

type UserContextType = {
 user: { id: string; email: string };
 profile: { full_name: string | null; role: string };
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ 
 user, 
 profile, 
 children 
}: UserContextType & { children: React.ReactNode }) {
 return (
 <UserContext.Provider value={{ user, profile }}>
 {children}
 </UserContext.Provider>
 );
}

export function useUser() {
 const context = useContext(UserContext);
 if (context === undefined) {
 throw new Error("useUser must be used within a UserProvider");
 }
 return context;
}

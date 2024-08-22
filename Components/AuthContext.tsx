import React from 'react';

export const AuthContext = React.createContext<{
  signIn: (token: string) => void;
  signOut: () => void;
} | null>(null);

import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../supabase/client';

export const AuthContext = createContext();

export function AuthProvider({ children }){
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function getUser(){
      try{
        const { data } = await supabase.auth.getUser();
        if(!mounted) return;
        setUser(data?.user ?? null);
      }catch(err){
        setUser(null);
      }finally{
        setLoading(false);
      }
    }
    getUser();
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });
    return () => { mounted = false; sub?.subscription?.unsubscribe?.(); };
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function RequireRole({ children, role, fallback }){
  // minimal role guard: expects user.user_metadata.role
  const { user, loading } = React.useContext(AuthContext);
  if(loading) return null;
  if(!user) return fallback ?? null;
  const userRole = user.user_metadata?.user_type || user.user_metadata?.role;
  if(role && userRole !== role) return fallback ?? null;
  return children;
}

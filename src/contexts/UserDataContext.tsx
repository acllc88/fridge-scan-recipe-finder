import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { doc, onSnapshot, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase';

interface UserData {
  shoppingList: string[];
  favoriteRecipes: string[]; // recipe IDs
}

interface UserDataContextType {
  userData: UserData;
  loading: boolean;
  addToShoppingList: (items: string[]) => Promise<void>;
  removeFromShoppingList: (item: string) => Promise<void>;
  clearShoppingList: () => Promise<void>;
  toggleFavorite: (recipeId: string) => Promise<void>;
  isFavorite: (recipeId: string) => boolean;
}

const UserDataContext = createContext<UserDataContextType | null>(null);

export function useUserData() {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
}

export function UserDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData>({
    shoppingList: [],
    favoriteRecipes: []
  });
  const [loading, setLoading] = useState(true);

  // Load from local storage initially or if logged out
  useEffect(() => {
    if (!user) {
      const saved = localStorage.getItem('moroccan_kitchen_data');
      if (saved) {
        try {
          setUserData(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse local storage data", e);
        }
      } else {
        setUserData({ shoppingList: [], favoriteRecipes: [] });
      }
      setLoading(false);
    }
  }, [user]);

  // Sync with Firestore if logged in
  useEffect(() => {
    if (!user) return;

    setLoading(true);
    const userDocRef = doc(db, 'users', user.uid);
    
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Partial<UserData>;
        setUserData({
          shoppingList: data.shoppingList || [],
          favoriteRecipes: data.favoriteRecipes || []
        });
      } else {
        // Create initial document if it doesn't exist
        const initialData: UserData = { shoppingList: [], favoriteRecipes: [] };
        // Check if we have local data to migrate? 
        // For simplicity, we start fresh or keep empty.
        // Actually, if a user logs in, we might want to merge local data.
        // But the requirement says "login or logout need to see what we have save", implying account data is separate.
        setDoc(userDocRef, initialData);
        setUserData(initialData);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Persist to local storage when logged out
  useEffect(() => {
    if (!user) {
      localStorage.setItem('moroccan_kitchen_data', JSON.stringify(userData));
    }
  }, [userData, user]);

  const addToShoppingList = async (items: string[]) => {
    // Filter duplicates
    const newItems = items.filter(item => !userData.shoppingList.includes(item));
    if (newItems.length === 0) return;

    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        shoppingList: arrayUnion(...newItems)
      });
    } else {
      setUserData(prev => ({
        ...prev,
        shoppingList: [...prev.shoppingList, ...newItems]
      }));
    }
  };

  const removeFromShoppingList = async (item: string) => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        shoppingList: arrayRemove(item)
      });
    } else {
      setUserData(prev => ({
        ...prev,
        shoppingList: prev.shoppingList.filter(i => i !== item)
      }));
    }
  };

  const clearShoppingList = async () => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        shoppingList: []
      });
    } else {
      setUserData(prev => ({ ...prev, shoppingList: [] }));
    }
  };

  const toggleFavorite = async (recipeId: string) => {
    const isFav = userData.favoriteRecipes.includes(recipeId);

    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      if (isFav) {
        await updateDoc(userDocRef, {
          favoriteRecipes: arrayRemove(recipeId)
        });
      } else {
        await updateDoc(userDocRef, {
          favoriteRecipes: arrayUnion(recipeId)
        });
      }
    } else {
      setUserData(prev => ({
        ...prev,
        favoriteRecipes: isFav 
          ? prev.favoriteRecipes.filter(id => id !== recipeId)
          : [...prev.favoriteRecipes, recipeId]
      }));
    }
  };

  const isFavorite = (recipeId: string) => {
    return userData.favoriteRecipes.includes(recipeId);
  };

  return (
    <UserDataContext.Provider value={{
      userData,
      loading,
      addToShoppingList,
      removeFromShoppingList,
      clearShoppingList,
      toggleFavorite,
      isFavorite
    }}>
      {children}
    </UserDataContext.Provider>
  );
}

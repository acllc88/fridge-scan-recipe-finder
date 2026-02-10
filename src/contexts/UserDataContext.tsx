import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAuth } from './AuthContext';
import { doc, onSnapshot, setDoc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface UserData {
  shoppingList: string[];
  favoriteRecipes: string[];
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
  const previousUser = useRef(user);

  // Handle user login/logout changes
  useEffect(() => {
    // User just logged out
    if (previousUser.current && !user) {
      console.log('🚪 User logged out - clearing all data');
      setUserData({ shoppingList: [], favoriteRecipes: [] });
      localStorage.removeItem('moroccan_kitchen_data');
      setLoading(false);
    }
    
    previousUser.current = user;
  }, [user]);

  // Load data when user is present or absent
  useEffect(() => {
    if (user) {
      // User is logged in - sync with Firebase
      console.log('👤 User logged in - loading from Firebase:', user.uid);
      setLoading(true);
      
      const userDocRef = doc(db, 'users', user.uid);
      
      const unsubscribe = onSnapshot(userDocRef, 
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            console.log('📄 Firebase data loaded:', data);
            setUserData({
              shoppingList: data.shoppingList || [],
              favoriteRecipes: data.favoriteRecipes || []
            });
          } else {
            console.log('📄 No Firebase doc - creating new one');
            const initialData: UserData = { shoppingList: [], favoriteRecipes: [] };
            setDoc(userDocRef, initialData);
            setUserData(initialData);
          }
          setLoading(false);
        },
        (error) => {
          console.error('❌ Firebase error:', error);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } else {
      // User is logged out - clear everything
      console.log('👤 No user - data is empty');
      setUserData({ shoppingList: [], favoriteRecipes: [] });
      setLoading(false);
    }
  }, [user]);

  const addToShoppingList = async (items: string[]) => {
    if (!user) {
      console.log('⚠️ Cannot add to shopping list - user not logged in');
      return;
    }
    
    const newItems = items.filter(item => !userData.shoppingList.includes(item));
    if (newItems.length === 0) return;

    console.log('🛒 Adding to shopping list:', newItems);
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        shoppingList: arrayUnion(...newItems)
      });
      console.log('✅ Shopping list updated in Firebase');
    } catch (error) {
      console.error('❌ Error adding to shopping list:', error);
      // Try to create doc if it doesn't exist
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);
        if (!docSnap.exists()) {
          await setDoc(userDocRef, { 
            shoppingList: newItems, 
            favoriteRecipes: userData.favoriteRecipes 
          });
        }
      } catch (e) {
        console.error('❌ Error creating doc:', e);
      }
    }
  };

  const removeFromShoppingList = async (item: string) => {
    if (!user) return;
    
    console.log('🗑️ Removing from shopping list:', item);
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        shoppingList: arrayRemove(item)
      });
    } catch (error) {
      console.error('❌ Error removing from shopping list:', error);
    }
  };

  const clearShoppingList = async () => {
    if (!user) return;
    
    console.log('🗑️ Clearing shopping list');
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        shoppingList: []
      });
    } catch (error) {
      console.error('❌ Error clearing shopping list:', error);
    }
  };

  const toggleFavorite = async (recipeId: string) => {
    if (!user) {
      console.log('⚠️ Cannot toggle favorite - user not logged in');
      return;
    }
    
    const isFav = userData.favoriteRecipes.includes(recipeId);
    console.log(`${isFav ? '💔' : '❤️'} Toggling favorite:`, recipeId);

    try {
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
      console.log('✅ Favorite updated in Firebase');
    } catch (error) {
      console.error('❌ Error toggling favorite:', error);
      // Try to create doc if it doesn't exist
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);
        if (!docSnap.exists()) {
          await setDoc(userDocRef, { 
            shoppingList: userData.shoppingList, 
            favoriteRecipes: isFav ? [] : [recipeId] 
          });
        }
      } catch (e) {
        console.error('❌ Error creating doc:', e);
      }
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

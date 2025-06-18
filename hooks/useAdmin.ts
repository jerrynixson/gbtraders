import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { AdminRepository } from '@/lib/db/repositories/adminRepository';

export function useAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const adminRepo = new AdminRepository();

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // Check if user is in the .env admin list
        const envAdminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || [];
        const isEnvAdmin = envAdminEmails.includes(user.email || '');

        // Check if user is in Firestore admins collection
        const isFirestoreAdmin = await adminRepo.isAdmin(user.uid);

        // User is admin if they are in either list
        setIsAdmin(isEnvAdmin || isFirestoreAdmin);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  const addAdmin = async (email: string) => {
    if (!user) {
      throw new Error('You must be logged in to add an admin');
    }

    if (!isAdmin) {
      throw new Error('Only admins can add other admins');
    }

    try {
      await adminRepo.addAdmin(email);
      return true;
    } catch (error) {
      console.error('Error adding admin:', error);
      throw error;
    }
  };

  return {
    isAdmin,
    loading,
    addAdmin
  };
} 
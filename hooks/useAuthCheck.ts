import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useAuthCheck(redirectTo: string = '/signin') {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading

    if (!session) {
      router.push(redirectTo);
    }
  }, [session, status, router, redirectTo]);

  return { session, status, isAuthenticated: !!session };
}

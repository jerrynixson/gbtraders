import NextAuth from 'next-auth';
import { adminAuth } from './firebase-admin';
import { FirebaseError } from 'firebase/app';
import CredentialsProvider from 'next-auth/providers/credentials';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        idToken: { label: "ID Token", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.idToken) {
          return null;
        }

        try {
          const decodedToken = await adminAuth.verifyIdToken(credentials.idToken as string);
          
          return {
            id: decodedToken.uid,
            email: decodedToken.email,
            name: decodedToken.name,
            image: decodedToken.picture,
          };
        } catch (error) {
          if (error instanceof FirebaseError) {
            console.error('Firebase auth error:', error);
          } else {
            console.error('Unknown auth error:', error);
          }
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/signin',
    error: '/signin'
  }
}); 
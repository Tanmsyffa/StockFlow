import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "../../../lib/dbConnect";
import { User } from "../../../lib/models";
import bcrypt from "bcryptjs";

export const authOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 hari
  },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { 
          label: "Email", 
          type: "email",
          placeholder: "your-email@example.com"
        },
        password: { 
          label: "Password", 
          type: "password",
          placeholder: "Your password"
        }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          await dbConnect();
          const email = credentials.email.trim().toLowerCase();
          const user = await User.findOne({ email }).select('+password');
          
          if (!user) {
            if (process.env.NODE_ENV === 'development') {
              const allUsers = await User.find({}, { email: 1, name: 1 }).limit(5);
            }
            return null;
          }

          if (!user.password) {
            return null;
          }

          const isValidPassword = await bcrypt.compare(credentials.password, user.password);
          
          if (!isValidPassword) {
            return null;
          }

          const returnUser = {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
          };

          return returnUser;

        } catch (error) {
          console.error("❌ Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      console.log("🔍 JWT callback:", { 
        hasUser: !!user, 
        hasAccount: !!account,
        tokenSub: token.sub 
      });
      
      if (account && user) {
        return {
          ...token,
          id: user.id,
          role: user.role,
          accessToken: account.access_token,
        };
      }

      return token;
    },

    async session({ session, token }) {
      console.log("🔍 Session callback:", { 
        hasSession: !!session,
        hasToken: !!token,
        tokenId: token.id,
        tokenRole: token.role 
      });
      
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.accessToken = token.accessToken;
      }

      return session;
    },

    async redirect({ url, baseUrl }) {
      
      if (url.includes('/auth/SignIn') || url === baseUrl + '/auth/SignIn') {
        return baseUrl + '/';
      }
      
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl + '/';
    },
  },
  pages: {
    signIn: "/auth/SignIn",
    signOut: "/auth/SignOut",
    error: "/auth/error",
  },
  events: {
    async signIn({ user, account, profile }) {},
    async signOut({ session, token }) {},
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions); 
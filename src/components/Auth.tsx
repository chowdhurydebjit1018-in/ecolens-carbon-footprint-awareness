import React, { useState } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  signInWithPopup,
  GoogleAuthProvider
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { Leaf, LogIn, UserPlus, AlertCircle, Sparkles } from "lucide-react";

interface AuthProps {
  onSuccess: () => void;
}

export default function Auth({ onSuccess }: AuthProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onSuccess();
    } catch (err: any) {
      console.error(err);
      let msg = "An authentication error occurred.";
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        msg = "Invalid email or password combination. If you don't have an account, please Sign Up first.";
      } else if (err.code === "auth/weak-password") {
        msg = "Password should be at least 6 characters.";
      } else if (err.code === "auth/email-already-in-use") {
        msg = "This email is already registered. If you already have an account, switch to 'Sign in' below.";
      } else if (err.code === "auth/invalid-email") {
        msg = "Please enter a valid email address.";
      } else if (err.code === "auth/operation-not-allowed") {
        msg = "Email/Password sign-in is not enabled in your Firebase console. Please use Google Sign-In below, or enable Email/Password provider under 'Authentication > Sign-in method' in the Firebase Console.";
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      // Configure prompt to select account to make testing & switching easier
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(auth, provider);
      onSuccess();
    } catch (err: any) {
      console.error(err);
      let msg = "Google authentication failed.";
      if (err.code === "auth/popup-blocked") {
        msg = "The sign-in popup was blocked by your browser. Please disable popup blockers and try again.";
      } else if (err.code === "auth/popup-closed-by-user") {
        msg = "The sign-in popup was closed before completing auth.";
      } else if (err.code === "auth/operation-not-allowed") {
        msg = "Google sign-in provider is not enabled on this Firebase project. Please enable Google provider in the Firebase Console.";
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Leaf className="h-6 w-6" id="auth-logo-icon" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900" id="auth-title">
            EcoLens
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {isRegister 
              ? "Start tracking your carbon footprint and unlock eco-insights" 
              : "Sign in to access your sustainability dashboard"}
          </p>
        </div>

        {error && (
          <div className="flex items-start space-x-2 bg-red-50 p-3 rounded-lg text-red-700 text-xs sm:text-sm border border-red-100">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          {/* Main Google Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-350 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2.5 text-sm font-semibold transition shadow-sm disabled:cursor-not-allowed"
          >
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative flex py-2 items-center text-xs uppercase text-gray-400">
            <div className="flex-grow border-t border-gray-150"></div>
            <span className="flex-shrink mx-4">or use email / password</span>
            <div className="flex-grow border-t border-gray-150"></div>
          </div>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative flex w-full justify-center rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:bg-emerald-400 transition"
          >
            {loading ? (
              <span className="flex items-center space-x-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                <span>Wait...</span>
              </span>
            ) : (
              <span className="flex items-center space-x-2">
                {isRegister ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
                <span>{isRegister ? "Join EcoLens with Email" : "Sign In with Email"}</span>
              </span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            className="font-medium text-emerald-600 hover:text-emerald-500 underline"
          >
            {isRegister 
              ? "Already have an account? Sign in" 
              : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}

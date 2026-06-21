import React, { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { auth, db } from "./lib/firebase";
import { Activity, UserProfile } from "./types";
import { ApiClient } from "./api/client";

import Auth from "./components/Auth";
import Onboarding from "./components/Onboarding";
import Dashboard from "./components/Dashboard";
import LogActivity from "./components/LogActivity";
import EcoRoutes from "./components/EcoRoutes";
import EcoGuide from "./components/EcoGuide";
import Progress from "./components/Progress";
import Profile from "./components/Profile";
import ErrorBoundary from "./components/ErrorBoundary";

import { 
  LayoutDashboard, 
  PlusSquare, 
  Navigation, 
  MessageSquare, 
  Award, 
  UserCircle, 
  Leaf, 
  Menu, 
  X,
  Compass
} from "lucide-react";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isInitializing, setIsInitializing] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [activityError, setActivityError] = useState<string | null>(null);

  const [isFetchingActivities, setIsFetchingActivities] = useState(false);

  // Auth Observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch user profile
        try {
          const profileDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (profileDoc.exists()) {
            setProfile(profileDoc.data() as UserProfile);
            // Fetch activities
            await fetchUserActivities();
          } else {
            setProfile(null);
          }
        } catch (err) {
          console.error("Error fetching user stats:", err);
        }
      } else {
        setProfile(null);
        setActivities([]);
      }
      setIsInitializing(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchUserActivities = async () => {
    setActivityError(null);
    setIsFetchingActivities(true);
    try {
      const items = await ApiClient.getActivities<Activity>();
      setActivities(items);
    } catch (err) {
      console.error("Error loading entries log:", err);
      setActivityError("Unable to load saved activities. Please retry.");
    } finally {
      setIsFetchingActivities(false);
    }
  };

  // Nav items configuration
  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { id: "log", label: "Log Activities", icon: <PlusSquare className="h-5 w-5" /> },
    { id: "routes", label: "Eco-Friendly Routes", icon: <Navigation className="h-5 w-5" /> },
    { id: "guide", label: "EcoGuide AI", icon: <MessageSquare className="h-5 w-5" /> },
    { id: "progress", label: "Achievements", icon: <Award className="h-5 w-5" /> },
    { id: "profile", label: "Profile", icon: <UserCircle className="h-5 w-5" /> },
  ];

  // Primary loader
  if (isInitializing || (isFetchingActivities && activities.length === 0 && !activityError)) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50 flex-col space-y-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 animate-bounce">
          <Leaf className="h-6 w-6" />
        </div>
        <span className="text-sm font-semibold text-gray-500 animate-pulse">
          {isFetchingActivities ? "Loading saved activities..." : "Initializing EcoLens..."}
        </span>
      </div>
    );
  }

  // Not signed in -> Authenticaton Flow
  if (!user) {
    return <Auth onSuccess={async () => {
      // Auth success callback will be triggered via auth state listener
    }} />;
  }

  // Signed in but profiling not completed -> Onboarding Flow
  if (!profile) {
    return (
      <Onboarding
        userId={user.uid}
        email={user.email || ""}
        onCompleted={(newProfile) => {
          setProfile(newProfile);
          // start with empty list as user represents a brand new signup
          setActivities([]);
          setActiveTab("dashboard");
        }}
      />
    );
  }

  // Render individual active subviews
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard activities={activities} profile={profile} onNavigate={(tab) => setActiveTab(tab)} />;
      case "log":
        return (
          <LogActivity
            userId={user.uid}
            activities={activities}
            onActivitiesChanged={() => fetchUserActivities()}
          />
        );
      case "routes":
        return <EcoRoutes />;
      case "guide":
        return <EcoGuide profile={profile} activities={activities} />;
      case "progress":
        return <Progress activities={activities} />;
      case "profile":
        return <Profile profile={profile} onProfileUpdated={(updatedProfile) => setProfile(updatedProfile)} />;
      default:
        return <Dashboard activities={activities} profile={profile} onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800 font-sans">
      
      {/* SIDEBAR ON DESKTOP */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 shrink-0">
        <div className="p-6 border-b border-gray-50 flex items-center space-x-2.5">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
            <Leaf className="h-6 w-6" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-gray-900">EcoLens</span>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 mt-4">
          {navigationItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition ${
                  active 
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-100/50" 
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-950"
                }`}
              >
                <div className={`${active ? "text-emerald-600" : "text-gray-400"} shrink-0`}>{item.icon}</div>
                <span className="whitespace-normal leading-tight text-left">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Short workspace signature */}
        <div className="p-5 border-t border-gray-50 text-[10px] text-gray-400 font-medium">
          <p>EcoLens Active Session</p>
          <span className="mt-0.5 block truncate text-[9px]">{user.email}</span>
        </div>
      </aside>

      {/* MOBILE DISPLAY NAV BAR */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-150 shrink-0">
          <div className="flex items-center space-x-2">
            <Leaf className="h-5 w-5 text-emerald-600" />
            <span className="text-lg font-bold tracking-tight text-gray-900">EcoLens</span>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </header>

        {/* MOBILE SLIDE DRAWER MENU */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-[57px] bg-white z-50 p-4 space-y-2 border-b border-gray-150">
            {navigationItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-bold rounded-xl transition ${
                    active 
                      ? "bg-emerald-50 text-emerald-800" 
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <div className={`${active ? "text-emerald-600" : "text-gray-400"} shrink-0`}>{item.icon}</div>
                  <span className="whitespace-normal leading-tight text-left">{item.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* PRIMARY VIEW CONTENT ENLARGEMENT */}
        <main className="flex-1 p-5 md:p-8 overflow-y-auto max-w-full">
          <ErrorBoundary onReset={() => setActiveTab("dashboard")}>
            {activityError && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 font-medium text-sm border border-red-100 flex items-center justify-between">
                <span>{activityError}</span>
                <button 
                  onClick={() => fetchUserActivities()}
                  className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-bold transition"
                >
                  Retry
                </button>
              </div>
            )}
            {renderContent()}
          </ErrorBoundary>
        </main>
      </div>

    </div>
  );
}

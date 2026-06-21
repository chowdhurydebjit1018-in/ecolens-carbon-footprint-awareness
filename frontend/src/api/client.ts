import { auth } from "../lib/firebase";

export class ApiClient {
  static async getToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  }

  static async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = await this.getToken();
    
    if (!token) {
      throw new Error("Please sign in again before logging activity.");
    }

    const headers = new Headers(options.headers || {});
    headers.set("Content-Type", "application/json");
    headers.set("Authorization", `Bearer ${token}`);

    let response;
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
      response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
        ...options,
        headers,
      });
    } catch (err) {
      throw new Error("Backend server is not reachable. Please make sure the API server is running.");
    }

    if (response.status === 401) {
      throw new Error("Please sign in again.");
    }

    let data;
    try {
      data = await response.json();
    } catch (e) {
      throw new Error("Invalid response from server.");
    }

    if (!response.ok || data.success === false) {
      const message = data.error?.message || data.message || "Unable to log activity.";
      throw new Error(message);
    }

    return data.data;
  }

  static async post<T>(endpoint: string, body: any, options: RequestInit = {}): Promise<T> {
    return this.fetch<T>(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  static async delete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.fetch<T>(endpoint, {
      ...options,
      method: "DELETE",
    });
  }

  static async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.fetch<T>(endpoint, {
      ...options,
      method: "GET",
    });
  }

  static async getActivities(): Promise<any[]> {
    const data = await this.get<{ activities: any[] }>("/activities");
    const activities = data.activities || [];
    
    // Normalize timestamps
    return activities.map(activity => {
      let normalizedCreatedAt = activity.createdAt;
      
      if (normalizedCreatedAt && typeof normalizedCreatedAt === 'object' && '_seconds' in normalizedCreatedAt) {
        normalizedCreatedAt = normalizedCreatedAt._seconds * 1000;
      } else if (typeof normalizedCreatedAt === 'string') {
        normalizedCreatedAt = new Date(normalizedCreatedAt).getTime();
      } else if (!normalizedCreatedAt) {
        normalizedCreatedAt = Date.now(); // Fallback for missing
      }
      
      return {
        ...activity,
        createdAt: normalizedCreatedAt
      };
    });
  }
}

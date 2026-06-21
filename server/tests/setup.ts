import { vi } from "vitest";

vi.mock("firebase-admin", () => {
  return {
    default: {
      apps: [],
      initializeApp: vi.fn(),
      credential: {
        cert: vi.fn(),
      },
      auth: vi.fn(),
      firestore: vi.fn(),
    },
    apps: [],
    initializeApp: vi.fn(),
    credential: {
      cert: vi.fn(),
    },
    auth: vi.fn(),
    firestore: vi.fn(),
  };
});

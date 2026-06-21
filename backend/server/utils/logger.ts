export const logger = {
  info: (message: string, meta?: any) => {
    if (process.env.NODE_ENV !== "test") {
      console.log(JSON.stringify({ level: "INFO", message, ...meta }));
    }
  },
  warn: (message: string, meta?: any) => {
    if (process.env.NODE_ENV !== "test") {
      console.warn(JSON.stringify({ level: "WARN", message, ...meta }));
    }
  },
  error: (message: string, error?: any, meta?: any) => {
    if (process.env.NODE_ENV !== "test") {
      console.error(JSON.stringify({ level: "ERROR", message, error: error?.message || error, ...meta }));
    }
  },
};

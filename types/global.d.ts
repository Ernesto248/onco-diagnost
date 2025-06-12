// Global type definitions for OncoDiag application

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production" | "test";
      NEXT_PUBLIC_APP_NAME: string;
      NEXT_PUBLIC_APP_VERSION: string;
      MAX_FILE_SIZE: string;
      ALLOWED_FILE_TYPES: string;
      DATASETS_DIR: string;
      TF_BACKEND: string;
      TF_LOG_LEVEL: string;
      NEXT_PUBLIC_API_URL: string;
      NEXT_PUBLIC_BASE_URL: string;
    }
  }
}

// Extend Window object for client-side globals
declare interface Window {
  tf?: any; // TensorFlow.js global
  gtag?: any; // Google Analytics
}

// Extend File interface for better type checking
declare interface File {
  path?: string;
}

// CSV parsing types
declare module "csv-parser" {
  interface CSVParseOptions {
    separator?: string;
    headers?: string[] | boolean;
    skipEmptyLines?: boolean;
  }

  function csvParser(options?: CSVParseOptions): NodeJS.ReadWriteStream;
  export = csvParser;
}

// TensorFlow.js module declarations
declare module "@tensorflow/tfjs" {
  export interface Tensor {
    shape: number[];
    dtype: string;
  }
}

declare module "@tensorflow/tfjs-node" {
  export * from "@tensorflow/tfjs";
}

export {};

export type ErrorCallback = (error: Error | string) => void;
export type ResolveCallback<T> = (value: T) => void;
export type ContextType = {[keys: string]: any};

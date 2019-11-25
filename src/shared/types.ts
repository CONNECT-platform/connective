import { Subscription } from "rxjs";

export type ErrorCallback = (error: Error | string) => void;
export type ResolveCallback<T> = (value: T) => void;
export type NotifyCallback = () => void;
export type ContextType = {[keys: string]: any};
export type TrackCallback = (sub: Subscription) => void;
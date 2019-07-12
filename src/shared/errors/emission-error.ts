import { Emission } from '../emission';


export class EmissionError extends Error {
  readonly original: Error;

  constructor(original: Error | string, readonly emission: Emission) {
    super();
    if (original instanceof Error) this.original = original;
    else this.original = new Error(original);
  }

  get message(): string { return this.original.message; }
  get stack(): string | undefined { return this.original.stack; }
}


export function isEmissionError(err: any): err is EmissionError {
  return err instanceof Error &&
        (err as any).original instanceof Error &&
        (err as any).emission instanceof Emission;
}

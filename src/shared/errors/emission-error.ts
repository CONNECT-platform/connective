import { Emission } from '../emission';


/**
 *
 * Represents when an error has occured during handling an emission.
 * You can retrieve the emission that resulted in the error via `.emission` property,
 * and you can retrieve the original error via `.original` property.
 *
 */
export class EmissionError extends Error {
  readonly original: Error;

  constructor(original: Error | string, readonly emission: Emission) {
    super(original instanceof Error?original.message:original);
    if (original instanceof Error) this.original = original;
    else this.original = new Error(original);
  }

  public get message(): string { return this.original.message; }
  public get stack(): string | undefined { return this.original.stack; }
}


/**
 *
 * Checks if an object is an `EmissionError` (this is needed due to some issues
 * with Typescript's typechecking on Errors).
 *
 */
export function isEmissionError(err: any): err is EmissionError {
  return err instanceof Error &&
        (err as any).original instanceof Error &&
        (err as any).emission instanceof Emission;
}

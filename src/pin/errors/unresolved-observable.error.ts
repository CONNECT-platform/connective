/**
 * 
 * This is thrown when the underlying observable of a pin could not
 * be resolved. This typically indicates a problematic custom pin type.
 * 
 */
export class UnresolvedPinObservableError extends Error {
  constructor() {
    super('Unresolved pin observable.');
  }
}

export class InsufficientInputsError extends Error {
  constructor(readonly missing: string[]) {
    super(`Following inputs are missing from provided data: ${missing}`);
  }
}

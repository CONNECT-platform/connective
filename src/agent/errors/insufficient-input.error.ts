/**
 *
 * This error is thrown when a node is not provided with its
 * required inputs.
 *
 */
export class InsufficientInputs extends Error {
  constructor(readonly missing: string[]) {
    super(`Following inputs are missing from provided data: ${missing}.
Read this for more information:
https://connective.dev/docs/node#optional`);
  }
}

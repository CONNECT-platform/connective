import { Signature } from '../signature';


export class InputNotInSignatureError extends Error {
  constructor(
    readonly input: string,
    readonly signature: Signature
  ) {
    super(`Input ${input} not in signature ${signature}`);
  }
}


export class OutputNotInSignatureError extends Error {
  constructor(
    readonly output: string,
    readonly signature: Signature
  ) {
    super(`Output ${output} not in signature ${signature}`);
  }
}

import { Signature } from '../signature';


export class InputNotInSignature extends Error {
  constructor(
    readonly input: string,
    readonly signature: Signature
  ) {
    super(`Input ${input} not in signature ${signature}`);
  }
}


export class OutputNotInSignature extends Error {
  constructor(
    readonly output: string,
    readonly signature: Signature
  ) {
    super(`Output ${output} not in signature ${signature}`);
  }
}

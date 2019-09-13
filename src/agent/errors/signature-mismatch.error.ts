import { Signature } from '../signature';


/**
 *
 * This error is thrown when a not matching input on a [signature](https://connective.dev/docs/agent#signature)
 * is accessed.
 *
 */
export class InputNotInSignature extends Error {
  constructor(
    readonly input: string,
    readonly signature: Signature
  ) {
    super(`Input ${input} not in signature {inputs: ${signature.inputs}}.
Read this for more information:
https://connective.dev/docs/agent#signature`);
  }
}


/**
 *
 * This error is thrown when a not matching output on a [signature](https://connective.dev/docs/agent#signature)
 * is accessed.
 *
 */
export class OutputNotInSignature extends Error {
  constructor(
    readonly output: string,
    readonly signature: Signature
  ) {
    super(`Output ${output} not in signature {outputs: ${signature.outputs}}.
Read this for more information:
https://connective.dev/docs/agent#signature`);
  }
}

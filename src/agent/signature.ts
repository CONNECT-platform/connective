/**
 * 
 * Denotes [signature](https://connective.dev/docs/agent#signature) of agents.
 * 
 */
export interface Signature {
  /**
   * 
   * names of the inputs of the agent
   * 
   */
  inputs?: string[];

  /**
   * 
   * names of the outputs of the agent
   * 
   */
  outputs: string[];
}


/**
 * 
 * @param whatever 
 * @returns `true` if `whatever` is a `Signature`.
 * 
 */
export function isSignature(whatever: any): whatever is Signature {
  return whatever !== undefined && whatever.outputs !== undefined && whatever.outputs.length !== undefined &&
    (whatever.inputs === undefined || whatever.inputs.length !== undefined);
}

export interface Signature {
  inputs?: string[];
  outputs: string[];
}


export function isSignature(whatever: any): whatever is Signature {
  return whatever !== undefined && whatever.outputs !== undefined && whatever.outputs.length !== undefined &&
    (whatever.inputs === undefined || whatever.inputs.length !== undefined);
}

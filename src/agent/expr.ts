import { ErrorCallback, ContextType } from '../shared/types';

import { Node, NodeInputs, NodeOutput } from './node';


export type ExprNoArgFunc = (error: ErrorCallback, context: ContextType) => any;
export type ExprWithArgFunc = (...args: any[]) => any;
export type ExprFunc = ExprNoArgFunc | ExprWithArgFunc;


/**
 * 
 * Represents [expression](https://connective.dev/docs/expr) agents.
 * 
 */
export class Expr extends Node {
  /**
   * 
   * The expression function
   * 
   */
  readonly func: any;

  constructor(func: ExprNoArgFunc);
  constructor(inputs: string[], func: ExprWithArgFunc);
  /**
   * 
   * @param inputsOrFunc either a list of names for the inputs of the 
   * [signature](https://connective.dev/docs/agent#signature) or the expr function
   * @param func the expr function (if this is provided, the first parameter must be alist of string)
   * 
   */
  constructor(inputsOrFunc?: string[] | ExprNoArgFunc, func?: ExprWithArgFunc){
    super({
      inputs: (typeof inputsOrFunc === 'function')?[]:inputsOrFunc,
      required: (typeof inputsOrFunc === 'function')?[]:inputsOrFunc,
      outputs: ['result']
    });

    this.func = func?func:inputsOrFunc;
  }

  protected run(inputs: NodeInputs, output: NodeOutput, error: ErrorCallback, context: ContextType) {
    let _ilist = this.signature.inputs?this.signature.inputs.map(i => inputs[i]):[];
    try {
      let val = this.func.apply(undefined, _ilist.concat(context));
      if (typeof val === 'function')
        val.apply(undefined, [(out: any) =>  output('result', out), error]);
      else
        output('result', val);
    } catch (err) {
      error(err);
    }
  }

  /**
   * 
   * Shortcut for `.out('result')`. The result of the evaluation of the
   * expression will be emitted via this output.
   * 
   */
  public get result() { return this.out('result'); }
}


export function expr(func: ExprFunc): Expr;
export function expr(inputs: string[], func: ExprFunc): Expr;
/**
 * 
 * Creates an [expr](https://connective.dev/docs/expr) agent.
 * Expr agents turn a function into an agent.
 * [Checkout the docs](https://connective.dev/docs/expr) for examples and further information.
 * 
 * @param inputsOrFunc either a list of names for the inputs of the signature or the function to convert
 * @param func the function to convert (if provided, the first argument must be a list of strings)
 * 
 */
export function expr(inputsOrFunc?: string[] | ExprFunc, func?: ExprFunc): Expr {
  if (func) return new Expr(inputsOrFunc as string[], func);
  else {
    let func = inputsOrFunc as ExprFunc;
    return new Expr(
      Array.apply(0, {length: func.length}).map((_:0, i:number) => i.toString()),
      func
    );
  }
}


export default expr;

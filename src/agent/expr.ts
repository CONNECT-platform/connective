import { Node, NodeInputs, NodeOutput, NodeError } from './node';


export type ExprNoArgFunc = (error: NodeError) => any;
export type ExprWithArgFunc = (...args: any[]) => any;
export type ExprFunc = ExprNoArgFunc | ExprWithArgFunc;


export class Expr extends Node {
  readonly func: any;

  constructor(func: ExprNoArgFunc);
  constructor(inputs: string[], func: ExprWithArgFunc);
  constructor(inputsOrFunc?: string[] | ExprNoArgFunc, func?: ExprWithArgFunc){
    super({
      inputs: (typeof inputsOrFunc === 'function')?[]:inputsOrFunc,
      required: (typeof inputsOrFunc === 'function')?[]:inputsOrFunc,
      outputs: ['result']
    });

    this.func = func?func:inputsOrFunc;
  }

  run(inputs: NodeInputs, output: NodeOutput, error: NodeError) {
    let _ilist = this.signature.inputs?this.signature.inputs.map(i => inputs[i]):[];
    let val = this.func.apply(undefined, _ilist.concat(error));

    if (typeof val === 'function')
      val.apply(undefined, [(out: any) =>  output('result', out), error]);
    else
      output('result', val);
  }

  public get result() { return this.out('result'); }
}


function expr(func: ExprFunc): Expr;
function expr(inputs: string[], func: ExprFunc): Expr;
function expr(inputsOrFunc?: string[] | ExprFunc, func?: ExprFunc): Expr {
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

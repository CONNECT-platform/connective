import { Node, NodeInputs, NodeOutput, NodeError } from './node';


export class Expr extends Node {
  readonly func: any;

  constructor(inputsOrFunc?: string[] | any, func?: any){
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

  public get output() { return this.out('result'); }
}


export default function(inputsOrFunc?: string[] | any, func?: any) {
  if (func) return new Expr(inputsOrFunc, func);
  else return new Expr(
    Array.apply(0, {length: inputsOrFunc.length}).map((_:0, i:number) => i.toString()),
    inputsOrFunc
  );
}

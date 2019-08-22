import { PinLike } from '../pin/pin-like';

import { Agent } from './agent';
import { Composition } from './composition';


type _ChildType = PinLike | Agent;
type _PinDict = {[name: string]: PinLike};


class InlineComposition extends Composition {
  constructor(readonly inpins: _PinDict | PinLike[], readonly outpins: _PinDict | PinLike[], 
            readonly children: _ChildType[]) {
    super({ inputs: Object.keys(inpins), outputs: Object.keys(outpins) });
    this.build();
  }

  init() {}
  wire() {}

  build() {
    this.children.forEach(child => this.add(child));
  }

  createInput(label: string) { return (this.inpins as any)[label]; }
  createOutput(label: string) { return (this.outpins as any)[label]; }

  createEntries() { return Object.values(this.inpins); }
  createExits() { return Object.values(this.outpins); }
}


export type TrackFunc = (...children: _ChildType[]) => void;
export type CompositionFactory = (track: TrackFunc) => [_PinDict | PinLike[], _PinDict | PinLike[]];


export function composition(factory: CompositionFactory) {
  let tracked = <_ChildType[]>[];
  let signature = factory((...children) => { tracked = tracked.concat(children); });
  return () => new InlineComposition(signature[0], signature[1], tracked);
}


export default composition;
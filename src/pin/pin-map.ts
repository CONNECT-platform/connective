import { PinLike } from './pin-like';
import { Pin } from './pin';


export type PinMapFactory = (label: string) => PinLike;

export class PinMap {
  private _pins: {[label: string]: PinLike} = {};

  constructor(
    readonly factory: PinMapFactory = () => new Pin()
  ) {}

  public get(label: string): PinLike {
    if (!(label in this._pins))
      return this._pins[label] = this.factory(label);

    return this._pins[label];
  }

  public instantiated(label: string): boolean {
    return label in this._pins;
  }

  public get pins(): PinLike[] {
    return Object.values(this._pins);
  }

  public clear(): this {
    this.pins.forEach(pin => pin.clear());
    this._pins = {};

    return this;
  }
}

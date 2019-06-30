import { Subscription } from 'rxjs';

import { Clearable } from './clearable';

//
// TODO: add tests for this.
//
export class Tracker implements Clearable {
  _sub: Subscription | undefined;

  protected track(sub: Subscription): Subscription {
    if (!this._sub) {
      this._sub = new Subscription();
    }

    this._sub.add(sub);
    return sub;
  }

  protected untrack(sub: Subscription): this {
    if (this._sub) this._sub.remove(sub);
    return this;
  }

  protected get tracking(): boolean { return !!this._sub; }

  public clear(): this {
    if (this._sub) {
      this._sub.unsubscribe();
      this._sub = undefined;
    }

    return this;
  }
}

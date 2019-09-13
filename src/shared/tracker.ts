import { Subscription } from 'rxjs';

import { Clearable } from './clearable';


/**
 *
 * A parent class for sub-classes who would want to track
 * some [`Subscription`s](https://rxjs-dev.firebaseapp.com/guide/subscription)
 * and clear them later.
 *
 */
export class Tracker implements Clearable {
  _sub: Subscription | undefined;

  /**
   *
   * Tracks given subscription, to clear it up later when
   * `.clear()` is called.
   *
   * @param sub
   * @returns the given subscription (for convenience).
   *
   */
  protected track(sub: Subscription): Subscription {
    if (!this._sub) {
      this._sub = new Subscription();
    }

    this._sub.add(sub);
    return sub;
  }

  /**
   *
   * Untracks given subscription, removing it from subscriptions
   * it will clear up when `.clear()` is called. This is useful when you
   * clear up some subscriptions yourself before clearing the tracker object.
   *
   * @param sub
   *
   */
  protected untrack(sub: Subscription): this {
    if (this._sub) this._sub.remove(sub);
    return this;
  }

  /**
   *
   * @returns `true` if this tracker object was ever tracking anything.
   * @returns `true` even after you `.untrack()` everything.
   * @returns `false` after invoking `.clear()`.
   *
   */
  protected get tracking(): boolean { return !!this._sub; }

  /**
   *
   * Clears out all tracked subscriptions by unsibscribing them.
   * Also clears out all references to tracked subscriptions.
   *
   * @warning most tracker objects will become useless after calling `.clear()` on them,
   * so do not call this prematurely!
   *
   */
  public clear(): this {
    if (this._sub) {
      this._sub.unsubscribe();
      this._sub = undefined;
    }

    return this;
  }
}

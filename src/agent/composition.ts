import { Bindable, isBindable } from '../shared/bindable';

import { PinLike } from '../pin/pin-like';

import { Signature } from './signature';
import { Agent } from './agent';

import { ChildNotDefined } from './errors/child-not-defined.error';
import { ChildIsNotPin, ChildIsNotAgent } from './errors/child-type-mismatch.error';


type _ChildType = PinLike | Agent;

export abstract class Composition extends Agent implements Bindable {
  private _bindables: Bindable[] | undefined;
  private _children: {[name: string]: _ChildType} | undefined;

  constructor(signature: Signature) {
    super(signature);
    this.init();
  }

  protected init() {
    this.build();
    this.wire();
  }

  protected abstract build(): void;
  protected abstract wire(): void;

  protected add(child: _ChildType): _ChildType;
  protected add(name: string, child: _ChildType): _ChildType;
  protected add(nameOrChild: string | _ChildType, child?: _ChildType): _ChildType {
    if (!this._children)
      this._children = {};

    if (!child)
      return this.add(`${Object.keys(this._children).length}`, nameOrChild as _ChildType);

    let _name = nameOrChild as string;
    this._children[_name] = child;

    if (isBindable(child))
      this.toBind(child);

    return child;
  }

  protected child(name: string|number): _ChildType {
    if (typeof name !== 'string') return this.child(name.toString());
    if (this._children && name in this._children)
      return this._children[name];

    throw new ChildNotDefined(name);
  }

  protected pin(name: string|number): PinLike {
    let _child = this.child(name);
    if (_child instanceof Agent) throw new ChildIsNotPin(name.toString());
    return _child;
  }

  protected agent(name: string|number): Agent {
    let _child = this.child(name);
    if (!(_child instanceof Agent)) throw new ChildIsNotAgent(name.toString());
    return _child;
  }

  protected toBind(bindable: Bindable): this {
    if (!this._bindables) this._bindables = [];
    this._bindables.push(bindable);
    return this;
  }

  bind(): this {
    if (this._bindables)
      this._bindables.forEach(bindable => bindable.bind());
    return this;
  }

  clear(): this {
    if (this._children) {
      Object.values(this._children).forEach(child => child.clear());
      this._children = undefined;
    }

    if (this._bindables) this._bindables = undefined;

    return super.clear();
  }
}

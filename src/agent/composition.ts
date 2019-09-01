import { Bindable, isBindable } from '../shared/bindable';

import { PinLike } from '../pin/pin-like';

import { Signature } from './signature';
import { Agent } from './agent';

import { ChildNotDefined } from './errors/child-not-defined.error';
import { ChildIsNotPin, ChildIsNotAgent } from './errors/child-type-mismatch.error';


type _ChildType = PinLike | Agent;

/**
 * 
 * Represents [compositions](https://connective.dev/docs/composition). This class
 * is to be used directly if you want to create class-based compositions, otherwise
 * utilize [`composition()`](https://connective.dev/docs/composition) method.
 * 
 */
export abstract class Composition extends Agent implements Bindable {
  private _bindables: Bindable[] | undefined;
  private _children: {[name: string]: _ChildType} | undefined;

  /**
   * 
   * @param signature the signature of the composition
   * 
   */
  constructor(signature: Signature) {
    super(signature);
    this.init();
  }

  /**
   * 
   * Override this to modify the initialization process of a composition.
   * This function is called by parent's constructor, so if you want to
   * invoke `.build()` and `.wire()` after some child-class properties have been
   * initialized as well, you would need to override this function. This is a typical
   * scenario in case of parametric class-based compositions.
   * 
   */
  protected init() {
    this.build();
    this.wire();
  }

  /**
   * 
   * Override this to define the child pins and agents of your composition,
   * using `.add()` method:
   * 
   * ```typescript
   * build() {
   *   this.add('myState', state());
   *   this.add('mySink', sink());
   *   this.myOtherState = this.add('myOtherState', state()) as State;
   * }
   * ```
   * 
   */
  protected abstract build(): void;

  /**
   * 
   * Override this to wire the pins and agents you defined in `.build()` to each other:
   * 
   * ```typescript
   * build() {
   *   this.agent('myState').out('value').to(this.pin('mySink'));
   *   this.pin('mySink').to(this.myOtherState).to(this.out('myOutput'));
   * }
   * ```
   * 
   */
  protected abstract wire(): void;

  protected add(child: _ChildType): _ChildType;
  protected add(name: string, child: _ChildType): _ChildType;
  /**
   * 
   * Adds a child (pin or agent) to the composition. You can provide a name. If not,
   * the child will be named numerically based on the length of the children already added:
   * 
   * ```typescript
   * build() {
   *   this.add('myState', state());
   *   this.add(expr((x, y) => x * y));
   * }
   * 
   * wire() {
   *   this.agent('myState'); // --> this is the defined state
   *   this.agent(1);         // --> this is the defined expr
   * }
   * ```
   * 
   * @param nameOrChild 
   * @param child 
   * 
   */
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

  /**
   * 
   * @param name 
   * @returns the child with given name.
   * @throws an error if no child with given name is defined.
   * 
   */
  protected child(name: string|number): _ChildType {
    if (typeof name !== 'string') return this.child(name.toString());
    if (this._children && name in this._children)
      return this._children[name];

    throw new ChildNotDefined(name);
  }

  /**
   * 
   * @param name 
   * @returns the pin child with given name.
   * @throws an error if no child with given name is defined or if it is not a pin.
   * 
   */
  protected pin(name: string|number): PinLike {
    let _child = this.child(name);
    if (_child instanceof Agent) throw new ChildIsNotPin(name.toString());
    return _child;
  }

  /**
   * 
   * @param name 
   * @returns the child agent with given name.
   * @throws an error if no child with given name is defined or if it is not an agent.
   * 
   */
  protected agent(name: string|number): Agent {
    let _child = this.child(name);
    if (!(_child instanceof Agent)) throw new ChildIsNotAgent(name.toString());
    return _child;
  }

  /**
   * 
   * Registers a `Bindable` that will be bound when `.bind()` is called on this composition.
   * 
   * @param bindable 
   * 
   */
  protected toBind(bindable: Bindable): this {
    if (!this._bindables) this._bindables = [];
    this._bindables.push(bindable);
    return this;
  }

  /**
   * 
   * Binds all registered `Bindable`s, including bindable children like
   * [states](https://connective.dev/docs/state) and
   * [sinks](https://connective.dev/docs/sink).
   * 
   */
  bind(): this {
    if (this._bindables)
      this._bindables.forEach(bindable => bindable.bind());
    return this;
  }

  /**
   * 
   * @note `.clear()` on `Composition` also clears all registered children.
   * 
   */
  clear(): this {
    if (this._children) {
      Object.values(this._children).forEach(child => child.clear());
      this._children = undefined;
    }

    if (this._bindables) this._bindables = undefined;

    return super.clear();
  }
}

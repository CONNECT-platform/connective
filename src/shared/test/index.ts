import { Bindable, Clearable } from "..";

describe('shared', () => {
  require('./bindable.test');
  require('./clearable.test');
  require('./emission.test');
  require('./tracker.test');

  it('should be feasible to define inline `Bindable|Clearable`s without explicit typecasting.', () => {
    (function(_: Bindable | Clearable){})({
      clear() { return this; }
    });

    (function(_: Bindable | Clearable){})({
      bind() { return this; }
    });
  });
});

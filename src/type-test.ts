type FnS<T> = (t: T) => boolean;
type FnA<T> = (t: T, x: (c: boolean) => void) => void;
type Fn<T> = FnS<T> | FnA<T>;

class A<X, Y> {
  a(a: A<X, Y>) {}
}

class F<T> extends A<T, T> {
  constructor(readonly fn: Fn<T>) { super(); }
}

function f<T>(fn: FnA<T>): F<T>;
function f<T>(fn: FnS<T>): F<T>;
function f<T>(fn: Fn<T>) { return new F(fn); }

class B<T> extends A<T, T> {}

const a = new B<number>();

a.a(f(x => {}))
a.a(f((x, d) => {}));
class Pin<Output, Input=Output> {
  to<Out>(pin: Pin<Out, Output>): Pin<Out, Output> {
    return pin;
  }

  from<In>(pin: Pin<Input, In>): Pin<Input, In> {
    return pin;
  }
}

type SyncFunc<I, O> = (i: I) => O;
type Resolve<T> = SyncFunc<T, void>;
type AsyncFunc<I, O> = (i: I, cb: Resolve<O>) => void;
type Func<I, O> = SyncFunc<I, O> | AsyncFunc<I, O>;

function src<Type>(): Pin<Type> { return new Pin<Type>(); }

function map<I, O>(m: AsyncFunc<I, O>): Pin<O, I>;
function map<I, O>(m: SyncFunc<I, O>): Pin<O, I>;
function map<I, O>(m: SyncFunc<I, O> | AsyncFunc<I, O>): Pin<O, I> {
  return new Pin<O, I>();
}

src<number>().to(map(i => i * 2)).to(map(x => x + 1));
src<number>().to(map((i, c: Resolve<number>) => c(i * 2))).to(map(x => x + 1));
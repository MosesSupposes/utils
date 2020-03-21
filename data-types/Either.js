const Right = x => ({
  chain: f => f(x),
  map: f => Right(f(x)),
  fold: (f, g) => g(x),
  toString: x => `Right(${x})`
});

const Left = x => ({
  chain: x => Left(x),
  map: f => Left(x),
  fold: (f, g) => f(x),
  toString: x => `Left(${x})`
});

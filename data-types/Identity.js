const Id = x => ({
  map: f => Id(f(x)),
  fold: f => f(x),
  toString: () => `Id(${x})`
});

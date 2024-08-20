export function autoImplement<T>(): new () => T {
  return class {} as any;
}

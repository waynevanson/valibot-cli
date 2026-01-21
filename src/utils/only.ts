/**
 * @summary
 * Contains only 1 item.
 * It throws if adding when full.
 */
export class Only<T> {
  constructor(private value?: Exclude<T, undefined>) {}

  get() {
    if (this.value === undefined) {
      return undefined;
    }

    const value = this.value;
    this.value = undefined;

    return value;
  }

  set(value: Exclude<T, undefined>) {
    if (this.value !== undefined) {
      throw new Error();
    }

    this.value = value;

    return value;
  }
}

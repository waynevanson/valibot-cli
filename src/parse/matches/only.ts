/**
 * @summary
 * Contains only 1 item.
 * It throws if adding when full or removing when empty.
 */
export class Only<T> {
  constructor(private value?: Exclude<T, undefined>) {}

  pull() {
    if (this.value === undefined) {
      return undefined
    }

    const value = this.value
    this.value = undefined

    return value
  }

  push(value: Exclude<T, undefined>) {
    if (this.value !== undefined) {
      throw new Error()
    }

    this.value = value

    return value
  }
}

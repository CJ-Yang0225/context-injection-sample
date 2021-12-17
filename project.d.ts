interface Customer {
  name: string
}

type IntrinsicElementProps<E extends keyof JSX.IntrinsicElements> = JSX.IntrinsicElements[E];

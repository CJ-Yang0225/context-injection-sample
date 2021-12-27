export function mergeClassName(className: string | undefined, additionalClassName: string) {
  return className ? className + ' ' + additionalClassName : additionalClassName;
}

export function extendClassNameProps<P extends { className?: string }>(variantClassName: string) {
  const extendClassNameProps = (props: P) => ({
    ...props,
    className: mergeClassName(props.className, variantClassName),
  });

  return extendClassNameProps;
}

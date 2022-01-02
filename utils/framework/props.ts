export function combineClassName(className: string | undefined, additionalClassName: string) {
  return className ? className + ' ' + additionalClassName : additionalClassName;
}

export function extendClassNameProp(variantClassName: string) {
  const extendClassNameProp = <P extends { className?: string }>(props: P) => ({
    ...props,
    className: combineClassName(props.className, variantClassName),
  });

  return extendClassNameProp;
}

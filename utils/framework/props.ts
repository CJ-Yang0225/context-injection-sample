export function combineClassName(className: string | undefined, additionalClassName: string) {
  return className ? className + ' ' + additionalClassName : additionalClassName;
}

export function addClassNameProp(variantClassName: string) {
  const extendClassNameProps = <P extends { className?: string }>(props: P) => ({
    ...props,
    className: combineClassName(props.className, variantClassName),
  });

  return extendClassNameProps;
}

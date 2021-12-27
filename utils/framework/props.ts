export function mergeClassName(className: string | undefined, additionalClassName: string) {
  return className ? className + ' ' + additionalClassName : additionalClassName;
}

export function addVariantClassNameProps(variantClassName: string) {
  const addVariantClassNameProps = (props: { className?: string }) => ({
    ...props,
    className: mergeClassName(props.className, variantClassName),
  });

  return addVariantClassNameProps;
}

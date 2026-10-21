/** Joins class names, skipping falsy values (a tiny stand-in for clsx). */
export function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

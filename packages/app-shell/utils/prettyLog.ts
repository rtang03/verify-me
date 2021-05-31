export const prettyLog = (label: string, val: any, asTable = false, shouldWarn = false) => {
  console.log('%c' + label, 'background-color: #245057; padding: 0.2rem 1.5rem;');
  if (shouldWarn) {
    console.warn(val);
  } else if (asTable) {
    console.table(val);
  } else console.log(val);
};

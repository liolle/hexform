export const debounce = (fn: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};


export const AllowDigitOnly = (e: KeyboardEvent) => {

  const allowedKeys = [
    'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
    'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
    'Home', 'End'
  ];

  // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
  if (e.ctrlKey && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) {
    return;
  }

  // Allow: numbers
  if (/^[0-9]$/.test(e.key)) {
    return;
  }


  // Block everything else
  if (!allowedKeys.includes(e.key)) {
    e.preventDefault();
  }

}

export const ExtractQErrors = (errors: string) => {
  let res: string[] = []
  try {

    let ers: Record<string, string> = errors ? JSON.parse(errors) : {}

    for (const key in ers) {
      if (ers[key].length > 0) {

        res.push(ers[key])
      }
    }

    return res
  } catch (error) {

    return []
  }
}

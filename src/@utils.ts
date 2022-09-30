export function processBalanceText(text: string): string {
  text = text.replace(/(Trips)(\d)/gi, '$1 $2');

  if (text.match(/\d+\s+Trips\s+\d+\s+of\s+\d+\s+Trips/gi)) {
    text = text.replace(/(\d+\s+of\s+\d+\s+Trips)/gi, '($1)');
  }

  if (text.match(/\)\s+\d+\s+Trips/gi)) {
    text = text.replace(/\)\s+(\d+)\s+Trips/gi, ') + $1 Trips');
  }

  return text;
}

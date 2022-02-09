export function processBalanceText(text: string): string {
  text = text.replace(/(Trips)(\d)/gi, '$1 $2');

  if (text.match(/^\d+\s+Trips\s+\d+\s+of\s+\d+\s+Trips$/i)) {
    text = text.replace(/(\d+\s+of\s+\d+\s+Trips)/i, '($1)');
  }

  return text;
}

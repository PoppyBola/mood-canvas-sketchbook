
// Minimal CSV parsing utility for browser
export function parseCSV(csv: string) {
  const rows = csv.trim().split('\n').map(r => r.split(','));
  const headers = rows.shift()!;
  return rows.map(row => {
    const entry: Record<string, string> = {};
    row.forEach((val, i) => {
      entry[headers[i]] = val.trim();
    });
    return entry;
  });
}

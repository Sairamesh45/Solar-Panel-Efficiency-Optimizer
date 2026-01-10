// Utility to export data as CSV
export function exportToCSV(data, filename = 'report.csv') {
  if (!data || !data.length) return;
  const keys = Object.keys(data[0]);
  const csvRows = [keys.join(',')];
  data.forEach(row => {
    csvRows.push(keys.map(k => JSON.stringify(row[k] ?? '')).join(','));
  });
  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

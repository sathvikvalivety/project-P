import * as XLSX from 'xlsx';

export async function jsonToExcel(file: File): Promise<Uint8Array> {
  const text = await file.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (err: any) {
    throw new Error(`Invalid JSON: ${err.message}`);
  }

  if (!Array.isArray(data)) {
    throw new Error('Top-level JSON structure must be an array.');
  }

  if (data.length === 0) {
    throw new Error('JSON array is empty.');
  }

  // Find union of all keys
  const keysSet = new Set<string>();
  for (const obj of data) {
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      Object.keys(obj).forEach(k => keysSet.add(k));
    }
  }
  
  const headers = Array.from(keysSet);
  
  // Normalize data objects to have all keys
  const normalizedData = data.map(obj => {
    const newObj: any = {};
    for (const key of headers) {
      newObj[key] = (obj && typeof obj === 'object') ? (obj[key] ?? '') : '';
    }
    return newObj;
  });

  const worksheet = XLSX.utils.json_to_sheet(normalizedData, { header: headers });

  // Auto-size columns
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  const cols = [];
  for (let C = range.s.c; C <= range.e.c; ++C) {
    let maxLen = 0;
    for (let R = range.s.r; R <= range.e.r; ++R) {
      const cellAddress = { c: C, r: R };
      const cellRef = XLSX.utils.encode_cell(cellAddress);
      const cell = worksheet[cellRef];
      if (cell && cell.v) {
        const len = String(cell.v).length;
        if (len > maxLen) maxLen = len;
      }
    }
    cols.push({ wch: maxLen + 2 });
  }
  worksheet['!cols'] = cols;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Uint8Array(excelBuffer);
}

import * as XLSX from 'xlsx';

export async function csvToExcel(files: File[]): Promise<Uint8Array> {
  const workbook = XLSX.utils.book_new();

  for (const file of files) {
    const text = await file.text();
    const worksheet = XLSX.read(text, { type: 'string' }).Sheets['Sheet1'];
    
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

    // Remove extension for sheet name
    let sheetName = file.name.replace(/\.[^/.]+$/, "");
    if (sheetName.length > 31) sheetName = sheetName.substring(0, 31);
    
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  }

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Uint8Array(excelBuffer);
}

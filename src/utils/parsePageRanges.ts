export function parsePageRanges(rangesStr: string, totalPages: number): { pages: number[], notices: string[] } {
  if (!rangesStr.trim()) {
    throw new Error("Page range is empty.");
  }

  const parts = rangesStr.split(',').map(s => s.trim()).filter(Boolean);
  const pages = new Set<number>();
  const notices: string[] = [];

  for (const part of parts) {
    if (/^\d+-\d+$/.test(part)) {
      const split = part.split('-');
      let start = parseInt(split[0], 10);
      let end = parseInt(split[1], 10);

      if (start === 0 || end === 0) {
        throw new Error("Page numbers must be greater than 0.");
      }

      if (start > totalPages || end > totalPages) {
        throw new Error(`Page out of bounds (max ${totalPages}).`);
      }

      if (start > end) {
        notices.push(`Range ${part} was interpreted as ${end}-${start}.`);
        const temp = start;
        start = end;
        end = temp;
      }

      for (let i = start; i <= end; i++) {
        pages.add(i);
      }
    } else if (/^\d+$/.test(part)) {
      const page = parseInt(part, 10);
      if (page === 0) {
        throw new Error("Page numbers must be greater than 0.");
      }
      if (page > totalPages) {
        throw new Error(`Page out of bounds (max ${totalPages}).`);
      }
      pages.add(page);
    } else {
      throw new Error(`Invalid format in range part: "${part}". Use e.g., "1-3, 5".`);
    }
  }

  if (pages.size === 0) {
    throw new Error("No valid pages resolved.");
  }

  return { 
    pages: Array.from(pages).sort((a, b) => a - b),
    notices 
  };
}

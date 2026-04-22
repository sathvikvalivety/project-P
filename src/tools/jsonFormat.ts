export async function jsonFormat(file: File): Promise<Uint8Array> {
  const text = await file.text();
  try {
    const data = JSON.parse(text);
    const formatted = JSON.stringify(data, null, 2);
    return new TextEncoder().encode(formatted);
  } catch (err: any) {
    throw new Error(`Invalid JSON: ${err.message}`);
  }
}

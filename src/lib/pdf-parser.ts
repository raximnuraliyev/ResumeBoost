// PDF Parser using pdf-parse 1.1.1
// This version works reliably with Node.js Buffer

export async function parsePDF(buffer: Buffer): Promise<string> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse');
    const data = await pdfParse(buffer);
    
    if (data.text && data.text.trim().length > 10) {
      return data.text;
    }
  } catch (err) {
    console.log('pdf-parse failed, using fallback:', err);
  }
  
  // Fallback to manual extraction
  const text = extractTextFromPDFBuffer(buffer);
  if (text && text.length > 20) {
    return text;
  }
  
  throw new Error('Could not extract text from PDF. Please try uploading a DOCX or TXT file instead.');
}

// Fallback: Extract readable text from PDF buffer manually
function extractTextFromPDFBuffer(buffer: Buffer): string {
  const content = buffer.toString('latin1');
  const extractedText: string[] = [];
  
  // Method 1: Extract text between BT (Begin Text) and ET (End Text) markers
  const textBlockRegex = /BT\s*([\s\S]*?)\s*ET/g;
  let match;
  
  while ((match = textBlockRegex.exec(content)) !== null) {
    const block = match[1];
    
    // Extract text from Tj operator (show text)
    const tjMatches = block.matchAll(/\(([^)]*)\)\s*Tj/g);
    for (const tj of tjMatches) {
      const decoded = decodePDFString(tj[1]);
      if (decoded.trim()) {
        extractedText.push(decoded);
      }
    }
    
    // Extract text from TJ operator (show text with positioning)
    const tjArrayMatches = block.matchAll(/\[([\s\S]*?)\]\s*TJ/gi);
    for (const tjArray of tjArrayMatches) {
      const items = tjArray[1].matchAll(/\(([^)]*)\)/g);
      for (const item of items) {
        const decoded = decodePDFString(item[1]);
        if (decoded.trim()) {
          extractedText.push(decoded);
        }
      }
    }
  }
  
  // Clean and join extracted text
  const result = extractedText
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  return result;
}

// Decode PDF string escapes
function decodePDFString(str: string): string {
  return str
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\\/g, '\\')
    .replace(/\\(\d{3})/g, (_, octal) => String.fromCharCode(parseInt(octal, 8)));
}

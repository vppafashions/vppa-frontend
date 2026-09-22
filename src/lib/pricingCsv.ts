export interface PricingRow {
  productId: string;
  itemCode: string;
  productName: string;
  gender: string;
  collection: string;
  sellingPrice: number;
  mrp: number;
}

export interface PricingCsvParseResult {
  rows: PricingRow[];
  errors: string[];
}

const CSV_HEADERS = [
  'Product ID',
  'Item Code',
  'Product Name',
  'Gender',
  'Collection',
  'Selling Price',
  'MRP',
];

type PricingField = keyof PricingRow;

const HEADER_ALIASES: Record<PricingField, string[]> = {
  productId: ['productid', 'id'],
  itemCode: ['itemcode'],
  productName: ['productname', 'name'],
  gender: ['gender', 'sex'],
  collection: ['collection', 'collectionslug', 'collectionname'],
  sellingPrice: ['sellingprice', 'saleprice', 'price'],
  mrp: ['mrp', 'originalprice', 'listprice'],
};

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/[\s_-]+/g, '');
}

function parseCsvRecords(input: string): string[][] {
  const records: string[][] = [];
  const source = input.replace(/^\uFEFF/, '');
  let current = '';
  let record: string[] = [];
  let inQuotes = false;

  const finishRecord = () => {
    record.push(current);
    current = '';
    if (record.some((cell) => cell.trim() !== '')) {
      records.push(record);
    }
    record = [];
  };

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];

    if (inQuotes) {
      if (character === '"') {
        if (source[index + 1] === '"') {
          current += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        current += character;
      }
      continue;
    }

    if (character === '"') {
      inQuotes = true;
    } else if (character === ',') {
      record.push(current);
      current = '';
    } else if (character === '\n') {
      finishRecord();
    } else if (character !== '\r') {
      current += character;
    }
  }

  if (inQuotes) {
    throw new Error('The CSV contains an unclosed quoted value.');
  }

  if (current !== '' || record.length > 0) {
    finishRecord();
  }

  return records;
}

function findHeaderIndex(headers: string[], field: PricingField): number {
  const aliases = HEADER_ALIASES[field];
  return headers.findIndex((header) => aliases.includes(normalizeHeader(header)));
}

function getCell(record: string[], index: number): string {
  return index >= 0 ? (record[index] || '').trim() : '';
}

function parseMoney(value: string): number | null {
  const normalized = value.replace(/[₹,\s]/g, '');
  if (!normalized) return null;

  const amount = Number(normalized);
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
}

export function parsePricingCsv(input: string): PricingCsvParseResult {
  let records: string[][];
  try {
    records = parseCsvRecords(input);
  } catch (error) {
    return {
      rows: [],
      errors: [error instanceof Error ? error.message : 'Unable to read the CSV file.'],
    };
  }

  if (records.length === 0) {
    return { rows: [], errors: ['The CSV file is empty.'] };
  }

  const headers = records[0];
  const productIdIndex = findHeaderIndex(headers, 'productId');
  const itemCodeIndex = findHeaderIndex(headers, 'itemCode');
  const productNameIndex = findHeaderIndex(headers, 'productName');
  const genderIndex = findHeaderIndex(headers, 'gender');
  const collectionIndex = findHeaderIndex(headers, 'collection');
  const sellingPriceIndex = findHeaderIndex(headers, 'sellingPrice');
  const mrpIndex = findHeaderIndex(headers, 'mrp');
  const errors: string[] = [];

  if (itemCodeIndex < 0 && productIdIndex < 0) {
    errors.push('The CSV must include an Item Code or Product ID column.');
  }
  if (sellingPriceIndex < 0) errors.push('The CSV must include a Selling Price column.');
  if (mrpIndex < 0) errors.push('The CSV must include an MRP column.');
  if (errors.length > 0) return { rows: [], errors };

  const rows: PricingRow[] = [];
  records.slice(1).forEach((record, index) => {
    const rowNumber = index + 2;
    const productId = getCell(record, productIdIndex);
    const itemCode = getCell(record, itemCodeIndex);
    const productName = getCell(record, productNameIndex);
    const gender = getCell(record, genderIndex);
    const collection = getCell(record, collectionIndex);
    const sellingPrice = parseMoney(getCell(record, sellingPriceIndex));
    const mrp = parseMoney(getCell(record, mrpIndex));
    const rowErrors: string[] = [];

    if (!itemCode && !productId) rowErrors.push('Item Code or Product ID is required.');
    if (sellingPrice === null) rowErrors.push('Selling Price must be a non-negative number.');
    if (mrp === null) rowErrors.push('MRP must be a non-negative number.');
    if (sellingPrice !== null && mrp !== null && sellingPrice > mrp) {
      rowErrors.push('Selling Price cannot be greater than MRP.');
    }

    if (rowErrors.length > 0) {
      errors.push(`Row ${rowNumber}: ${rowErrors.join(' ')}`);
      return;
    }

    rows.push({
      productId,
      itemCode,
      productName,
      gender,
      collection,
      sellingPrice: sellingPrice as number,
      mrp: mrp as number,
    });
  });

  if (rows.length === 0 && errors.length === 0) {
    errors.push('The CSV does not contain any pricing rows.');
  }

  return { rows, errors };
}

function escapeCsvCell(value: string | number): string {
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function pricingRowsToCsv(rows: PricingRow[]): string {
  const lines = [
    CSV_HEADERS.map(escapeCsvCell).join(','),
    ...rows.map((row) =>
      [
        row.productId,
        row.itemCode,
        row.productName,
        row.gender,
        row.collection,
        row.sellingPrice,
        row.mrp,
      ]
        .map(escapeCsvCell)
        .join(','),
    ),
  ];

  return `\uFEFF${lines.join('\r\n')}\r\n`;
}

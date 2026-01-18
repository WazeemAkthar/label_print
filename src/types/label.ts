export interface LabelData {
  shopName: string;
  productName: string;
  mfgDate: string;
  expDate: string;
  price: string;
  currency: string;
  barcodeValue: string;
}

export interface LabelSize {
  width: number;
  height: number;
  name: string;
}

export const LABEL_SIZES: LabelSize[] = [
  { width: 38, height: 25, name: '38mm × 25mm (Standard)' },
];

export const CURRENCIES = [
  { symbol: '₹', name: 'INR (₹)' },
  { symbol: 'Rs', name: 'Rs' },
  { symbol: '$', name: 'USD ($)' },
  { symbol: '€', name: 'EUR (€)' },
  { symbol: '£', name: 'GBP (£)' },
];

export const DEFAULT_LABEL_DATA: LabelData = {
  shopName: 'My Shop',
  productName: 'Product Name',
  mfgDate: new Date().toISOString().split('T')[0],
  expDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  price: '450',
  currency: '₹',
  barcodeValue: '',
};

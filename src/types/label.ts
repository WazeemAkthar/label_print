export interface LabelData {
  shopName: string;
  productName: string;
  mfgDate: string;
  expDate: string;
  price: string;
  currency: string;
  barcodeValue: string;
}

export interface LabelTemplate {
  id: string;
  name: string;
  data: LabelData;
  createdAt: number;
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

const TEMPLATES_STORAGE_KEY = 'labelmaker-templates';

export const saveTemplate = (template: LabelTemplate): void => {
  const templates = getTemplates();
  const existingIndex = templates.findIndex(t => t.id === template.id);
  if (existingIndex >= 0) {
    templates[existingIndex] = template;
  } else {
    templates.unshift(template);
  }
  localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
};

export const getTemplates = (): LabelTemplate[] => {
  try {
    const stored = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const deleteTemplate = (id: string): void => {
  const templates = getTemplates().filter(t => t.id !== id);
  localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
};

export const generateTemplateId = (): string => {
  return `tpl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

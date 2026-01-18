export interface FontSizes {
  shopName: number;
  productName: number;
  dates: number;
  price: number;
}

export interface LabelData {
  shopName: string;
  productName: string;
  mfgDate: string;
  expDate: string;
  price: string;
  barcodeValue: string;
  fontSizes: FontSizes;
}

export interface LabelTemplate {
  id: string;
  name: string;
  data: LabelData;
  createdAt: number;
  updatedAt?: number;
}

export interface LabelSize {
  width: number;
  height: number;
  name: string;
  columns?: number;
  isCustom?: boolean;
}

export const DEFAULT_LABEL_SIZES: LabelSize[] = [
  { width: 38, height: 25, name: '38mm × 25mm (Standard)', columns: 1 },
  { width: 38, height: 50, name: '38mm × 25mm (2 Lines)', columns: 1 },
  { width: 50, height: 25, name: '50mm × 25mm (Wide)', columns: 1 },
  { width: 38, height: 38, name: '38mm × 38mm (Square)', columns: 1 },
];

const CUSTOM_SIZES_STORAGE_KEY = 'labelmaker-custom-sizes';

export const getCustomSizes = (): LabelSize[] => {
  try {
    const stored = localStorage.getItem(CUSTOM_SIZES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const saveCustomSize = (size: LabelSize): void => {
  const sizes = getCustomSizes();
  sizes.push({ ...size, isCustom: true });
  localStorage.setItem(CUSTOM_SIZES_STORAGE_KEY, JSON.stringify(sizes));
};

export const deleteCustomSize = (width: number, height: number): void => {
  const sizes = getCustomSizes().filter(s => !(s.width === width && s.height === height));
  localStorage.setItem(CUSTOM_SIZES_STORAGE_KEY, JSON.stringify(sizes));
};

export const getAllLabelSizes = (): LabelSize[] => {
  return [...DEFAULT_LABEL_SIZES, ...getCustomSizes()];
};

export const DEFAULT_FONT_SIZES: FontSizes = {
  shopName: 10,
  productName: 9,
  dates: 7,
  price: 11,
};

export const DEFAULT_LABEL_DATA: LabelData = {
  shopName: 'My Shop',
  productName: 'Product Name',
  mfgDate: new Date().toISOString().split('T')[0],
  expDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  price: '450',
  barcodeValue: '',
  fontSizes: { ...DEFAULT_FONT_SIZES },
};

const TEMPLATES_STORAGE_KEY = 'labelmaker-templates';

export const saveTemplate = (template: LabelTemplate): void => {
  const templates = getTemplates();
  const existingIndex = templates.findIndex(t => t.id === template.id);
  if (existingIndex >= 0) {
    templates[existingIndex] = { ...template, updatedAt: Date.now() };
  } else {
    templates.unshift(template);
  }
  localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
};

export const getTemplates = (): LabelTemplate[] => {
  try {
    const stored = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    const templates = stored ? JSON.parse(stored) : [];
    // Migrate old templates without fontSizes
    return templates.map((t: LabelTemplate) => ({
      ...t,
      data: {
        ...t.data,
        fontSizes: t.data.fontSizes || { ...DEFAULT_FONT_SIZES },
      },
    }));
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

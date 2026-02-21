import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';

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
  { width: 30, height: 15, name: '30mm × 15mm (Standard)', columns: 3 },
  { width: 38, height: 50, name: '38mm × 25mm (2 Lines)', columns: 1 },
  { width: 50, height: 25, name: '50mm × 25mm (Wide)', columns: 1 },
  { width: 38, height: 38, name: '38mm × 38mm (Square)', columns: 1 },
];

const CUSTOM_SIZES_STORAGE_KEY = 'labelflow-custom-sizes';

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
  shopName: 'LIFETIME',
  productName: 'Product Name',
  mfgDate: new Date().toISOString().split('T')[0],
  expDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  price: '450',
  barcodeValue: '',
  fontSizes: { ...DEFAULT_FONT_SIZES },
};

const TEMPLATES_COLLECTION = 'templates';

export const saveTemplate = async (template: LabelTemplate): Promise<void> => {
  try {
    if (template.id.startsWith('tpl_')) {
      // New template - add to Firestore
      const templatesRef = collection(db, TEMPLATES_COLLECTION);
      const docRef = await addDoc(templatesRef, {
        ...template,
        createdAt: template.createdAt,
        updatedAt: Date.now(),
      });
      // Update the template with the Firestore document ID
      await updateDoc(doc(db, TEMPLATES_COLLECTION, docRef.id), {
        id: docRef.id,
      });
    } else {
      // Update existing template
      const templateRef = doc(db, TEMPLATES_COLLECTION, template.id);
      await updateDoc(templateRef, {
        ...template,
        updatedAt: Date.now(),
      });
    }
  } catch (error) {
    console.error('Error saving template:', error);
    throw error;
  }
};

export const getTemplates = async (): Promise<LabelTemplate[]> => {
  try {
    const templatesRef = collection(db, TEMPLATES_COLLECTION);
    const q = query(templatesRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const templates: LabelTemplate[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      templates.push({
        id: doc.id,
        name: data.name,
        data: {
          ...data.data,
          fontSizes: data.data.fontSizes || { ...DEFAULT_FONT_SIZES },
        },
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    });

    return templates;
  } catch (error) {
    console.error('Error getting templates:', error);
    return [];
  }
};

export const deleteTemplate = async (id: string): Promise<void> => {
  try {
    const templateRef = doc(db, TEMPLATES_COLLECTION, id);
    await deleteDoc(templateRef);
  } catch (error) {
    console.error('Error deleting template:', error);
    throw error;
  }
};

export const generateTemplateId = (): string => {
  return `tpl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};


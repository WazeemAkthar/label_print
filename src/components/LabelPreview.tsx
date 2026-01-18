import { forwardRef } from 'react';
import { LabelData, LabelSize } from '@/types/label';
import Barcode from './Barcode';
import { format, parseISO } from 'date-fns';

interface LabelPreviewProps {
  data: LabelData;
  size: LabelSize;
  scale?: number;
}

const LabelPreview = forwardRef<HTMLDivElement, LabelPreviewProps>(
  ({ data, size, scale = 3 }, ref) => {
    const pxPerMm = 3.78 * scale;
    const widthPx = size.width * pxPerMm;
    const heightPx = size.height * pxPerMm;

    const formatDate = (dateStr: string) => {
      try {
        return format(parseISO(dateStr), 'dd-MM-yyyy');
      } catch {
        return dateStr;
      }
    };

    // Scale font sizes based on preview scale
    const fontScale = scale / 3;

    return (
      <div
        ref={ref}
        className="label-paper overflow-hidden flex flex-col"
        style={{
          width: `${widthPx}px`,
          height: `${heightPx}px`,
          padding: `${2 * scale}px`,
        }}
      >
        {/* Shop Name */}
        <div
          className="font-semibold text-foreground truncate text-center"
          style={{ fontSize: `${data.fontSizes.shopName * fontScale}px`, lineHeight: 1.2 }}
        >
          {data.shopName || 'Shop Name'}
        </div>

        {/* Product Name */}
        <div
          className="text-foreground truncate text-center"
          style={{ fontSize: `${data.fontSizes.productName * fontScale}px`, lineHeight: 1.2, marginTop: `${0.5 * scale}px` }}
        >
          {data.productName || 'Product'}
        </div>

        {/* Dates */}
        <div
          className="flex justify-between text-muted-foreground"
          style={{ fontSize: `${data.fontSizes.dates * fontScale}px`, marginTop: `${1 * scale}px` }}
        >
          <span>MFG: {formatDate(data.mfgDate)}</span>
          <span>EXP: {formatDate(data.expDate)}</span>
        </div>

        {/* Barcode */}
        <div className="flex-1 flex items-center justify-center" style={{ marginTop: `${1 * scale}px` }}>
          <Barcode
            value={data.barcodeValue}
            width={1.2 * (scale / 3)}
            height={18 * scale}
            displayValue={false}
          />
        </div>

        {/* Price - Always Rs */}
        <div
          className="font-bold text-foreground text-center"
          style={{ fontSize: `${data.fontSizes.price * fontScale}px`, lineHeight: 1 }}
        >
          Rs {data.price || '0'}
        </div>
      </div>
    );
  }
);

LabelPreview.displayName = 'LabelPreview';

export default LabelPreview;

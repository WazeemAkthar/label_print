import { forwardRef } from 'react';
import { LabelData, LabelSize } from '@/types/label';
import Barcode from './Barcode';
import { format, parseISO } from 'date-fns';

interface PrintableLabelProps {
  data: LabelData;
  size: LabelSize;
}

const PrintableLabel = forwardRef<HTMLDivElement, PrintableLabelProps>(
  ({ data, size }, ref) => {
    const pxPerMm = 3.78;
    const widthPx = size.width * pxPerMm;
    const heightPx = size.height * pxPerMm;

    const formatDate = (dateStr: string) => {
      try {
        return format(parseISO(dateStr), 'dd-MM-yyyy');
      } catch {
        return dateStr;
      }
    };

    return (
      <div
        ref={ref}
        className="print-only bg-white text-black overflow-hidden flex flex-col"
        style={{
          width: `${widthPx}px`,
          height: `${heightPx}px`,
          padding: '2px',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        {/* Shop Name */}
        <div
          className="font-bold truncate text-center"
          style={{ fontSize: `${data.fontSizes.shopName}px`, lineHeight: 1.2 }}
        >
          {data.shopName}
        </div>

        {/* Product Name */}
        <div
          className="truncate text-center"
          style={{ fontSize: `${data.fontSizes.productName}px`, lineHeight: 1.2, marginTop: '1px' }}
        >
          {data.productName}
        </div>

        {/* Dates - Stacked */}
        <div
          className="text-center"
          style={{ fontSize: `${data.fontSizes.dates}px`, marginTop: '2px', color: '#333', lineHeight: 1.3 }}
        >
          <div>MFG: {formatDate(data.mfgDate)}</div>
          <div>EXP: {formatDate(data.expDate)}</div>
        </div>

        {/* Barcode - Full Width */}
        <div className="flex-1 flex items-center justify-center w-full" style={{ marginTop: '2px' }}>
          <Barcode
            value={data.barcodeValue}
            width={2}
            height={20}
            displayValue={false}
          />
        </div>

        {/* Price - Rs. with /= */}
        <div
          className="font-bold text-center"
          style={{ fontSize: `${data.fontSizes.price}px`, lineHeight: 1 }}
        >
          Rs. {data.price}/=
        </div>
      </div>
    );
  }
);

PrintableLabel.displayName = 'PrintableLabel';

export default PrintableLabel;

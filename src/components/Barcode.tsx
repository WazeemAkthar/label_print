import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface BarcodeProps {
  value: string;
  width?: number;
  height?: number;
  displayValue?: boolean;
  fontSize?: number;
}

const Barcode = ({ 
  value, 
  width = 1.5, 
  height = 30, 
  displayValue = false,
  fontSize = 10 
}: BarcodeProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format: 'CODE128',
          width,
          height,
          displayValue,
          fontSize,
          margin: 0,
          background: 'transparent',
          lineColor: '#000000',
        });
      } catch {
        // Invalid barcode value - will show empty
      }
    }
  }, [value, width, height, displayValue, fontSize]);

  if (!value) {
    return (
      <div className="flex items-center justify-center h-8 text-muted-foreground text-xs">
        Enter barcode value
      </div>
    );
  }

  return <svg ref={svgRef} />;
};

export default Barcode;

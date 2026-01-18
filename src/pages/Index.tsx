import { useState, useRef } from 'react';
import { LabelData, LabelSize, LABEL_SIZES, DEFAULT_LABEL_DATA } from '@/types/label';
import LabelForm from '@/components/LabelForm';
import LabelPreview from '@/components/LabelPreview';
import PrintableLabel from '@/components/PrintableLabel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Printer, Download, Tag, ZoomIn, ZoomOut } from 'lucide-react';
import { toast } from 'sonner';

const Index = () => {
  const [labelData, setLabelData] = useState<LabelData>(DEFAULT_LABEL_DATA);
  const [selectedSize, setSelectedSize] = useState<LabelSize>(LABEL_SIZES[0]);
  const [previewScale, setPreviewScale] = useState(4);
  const printRef = useRef<HTMLDivElement>(null);

  const handleReset = () => {
    setLabelData(DEFAULT_LABEL_DATA);
    toast.success('Label reset to defaults');
  };

  const handlePrint = () => {
    if (!labelData.barcodeValue) {
      toast.error('Please enter or generate a barcode value');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Unable to open print window. Please check popup blocker.');
      return;
    }

    // Create print content with exact mm sizing
    const pxPerMm = 3.78;
    const widthPx = selectedSize.width * pxPerMm;
    const heightPx = selectedSize.height * pxPerMm;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Print Label</title>
        <style>
          @page {
            margin: 0;
            size: ${selectedSize.width}mm ${selectedSize.height}mm;
          }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: Arial, sans-serif;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .label {
            width: ${widthPx}px;
            height: ${heightPx}px;
            padding: 2px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            background: white;
          }
          .shop-name {
            font-size: 10px;
            font-weight: bold;
            text-align: center;
            line-height: 1.2;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .product-name {
            font-size: 9px;
            text-align: center;
            line-height: 1.2;
            margin-top: 1px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .dates {
            font-size: 7px;
            color: #333;
            display: flex;
            justify-content: space-between;
            margin-top: 2px;
          }
          .barcode-container {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-top: 2px;
          }
          .price {
            font-size: 11px;
            font-weight: bold;
            text-align: center;
            line-height: 1;
          }
        </style>
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"><\/script>
      </head>
      <body>
        <div class="label">
          <div class="shop-name">${labelData.shopName}</div>
          <div class="product-name">${labelData.productName}</div>
          <div class="dates">
            <span>MFG: ${formatDateForPrint(labelData.mfgDate)}</span>
            <span>EXP: ${formatDateForPrint(labelData.expDate)}</span>
          </div>
          <div class="barcode-container">
            <svg id="barcode"></svg>
          </div>
          <div class="price">${labelData.currency} ${labelData.price}</div>
        </div>
        <script>
          JsBarcode("#barcode", "${labelData.barcodeValue}", {
            format: "CODE128",
            width: 1,
            height: 20,
            displayValue: false,
            margin: 0
          });
          setTimeout(() => window.print(), 200);
        <\/script>
      </body>
      </html>
    `);
    printWindow.document.close();
    toast.success('Print dialog opened');
  };

  const formatDateForPrint = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
    } catch {
      return dateStr;
    }
  };

  const handleDownloadPDF = () => {
    if (!labelData.barcodeValue) {
      toast.error('Please enter or generate a barcode value');
      return;
    }
    // For MVP, we use print to PDF functionality
    toast.info('Use "Save as PDF" in the print dialog to download');
    handlePrint();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card no-print">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent rounded-lg">
              <Tag className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">LabelMaker Pro</h1>
              <p className="text-sm text-muted-foreground">Create print-ready barcode labels</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 no-print">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Form */}
          <LabelForm
            data={labelData}
            onChange={setLabelData}
            selectedSize={selectedSize}
            onSizeChange={setSelectedSize}
            onReset={handleReset}
          />

          {/* Right: Preview & Actions */}
          <div className="space-y-4">
            {/* Preview Card */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Live Preview</CardTitle>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setPreviewScale(Math.max(2, previewScale - 1))}
                      disabled={previewScale <= 2}
                      className="h-8 w-8"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground w-12 text-center">
                      {Math.round(previewScale / 3 * 100)}%
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setPreviewScale(Math.min(6, previewScale + 1))}
                      disabled={previewScale >= 6}
                      className="h-8 w-8"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedSize.name} — What you see is what you print
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center p-6 bg-muted/50 rounded-lg min-h-[200px]">
                  <LabelPreview
                    data={labelData}
                    size={selectedSize}
                    scale={previewScale}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handlePrint}
                className="h-12 bg-accent text-accent-foreground hover:bg-accent/90"
                disabled={!labelData.barcodeValue}
              >
                <Printer className="w-5 h-5 mr-2" />
                Print Label
              </Button>
              <Button
                onClick={handleDownloadPDF}
                variant="secondary"
                className="h-12"
                disabled={!labelData.barcodeValue}
              >
                <Download className="w-5 h-5 mr-2" />
                Save as PDF
              </Button>
            </div>

            {/* Info Box */}
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-medium text-sm text-foreground mb-2">Quick Tips</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Click the shuffle icon to auto-generate a unique barcode</li>
                <li>• Use "Save as PDF" in print dialog for digital copies</li>
                <li>• For best results, disable margins in print settings</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Hidden print area */}
      <div className="hidden">
        <PrintableLabel ref={printRef} data={labelData} size={selectedSize} />
      </div>
    </div>
  );
};

export default Index;

import { useState, useRef, useEffect } from 'react';
import { LabelData, LabelSize, LABEL_SIZES, DEFAULT_LABEL_DATA, LabelTemplate, getTemplates, saveTemplate, generateTemplateId } from '@/types/label';
import LabelForm from '@/components/LabelForm';
import LabelPreview from '@/components/LabelPreview';
import PrintableLabel from '@/components/PrintableLabel';
import SavedTemplates from '@/components/SavedTemplates';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Printer, Download, Tag, ZoomIn, ZoomOut, Minus, Plus, Copy, Save } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const Index = () => {
  const [labelData, setLabelData] = useState<LabelData>(DEFAULT_LABEL_DATA);
  const [selectedSize, setSelectedSize] = useState<LabelSize>(LABEL_SIZES[0]);
  const [previewScale, setPreviewScale] = useState(4);
  const [quantity, setQuantity] = useState(1);
  const [templates, setTemplates] = useState<LabelTemplate[]>([]);
  const [templateName, setTemplateName] = useState('');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<LabelTemplate | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTemplates(getTemplates());
  }, []);

  const handleReset = () => {
    setLabelData(DEFAULT_LABEL_DATA);
    setQuantity(1);
    toast.success('Label reset to defaults');
  };

  const handleQuantityChange = (newQty: number) => {
    setQuantity(Math.max(1, Math.min(100, newQty)));
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      toast.error('Please enter a template name');
      return;
    }

    const template: LabelTemplate = {
      id: editingTemplate?.id || generateTemplateId(),
      name: templateName.trim(),
      data: { ...labelData },
      createdAt: editingTemplate?.createdAt || Date.now(),
      updatedAt: editingTemplate ? Date.now() : undefined,
    };

    saveTemplate(template);
    setTemplates(getTemplates());
    setTemplateName('');
    setEditingTemplate(null);
    setSaveDialogOpen(false);
    toast.success(editingTemplate ? `Template "${template.name}" updated` : `Template "${template.name}" saved`);
  };

  const handleEditTemplate = (template: LabelTemplate) => {
    setLabelData(template.data);
    setTemplateName(template.name);
    setEditingTemplate(template);
    setSaveDialogOpen(true);
  };

  const handleLoadTemplate = (data: LabelData) => {
    setLabelData(data);
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setEditingTemplate(null);
      setTemplateName('');
    }
    setSaveDialogOpen(open);
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

    const pxPerMm = 3.78;
    const widthPx = selectedSize.width * pxPerMm;
    const heightPx = selectedSize.height * pxPerMm;

    const labelsHtml = Array(quantity).fill(null).map((_, i) => `
      <div class="label" ${i > 0 ? 'style="page-break-before: always;"' : ''}>
        <div class="shop-name" style="font-size: ${labelData.fontSizes.shopName}px;">${labelData.shopName}</div>
        <div class="product-name" style="font-size: ${labelData.fontSizes.productName}px;">${labelData.productName}</div>
        <div class="dates" style="font-size: ${labelData.fontSizes.dates}px;">
          <span>MFG: ${formatDateForPrint(labelData.mfgDate)}</span>
          <span>EXP: ${formatDateForPrint(labelData.expDate)}</span>
        </div>
        <div class="barcode-container">
          <svg id="barcode-${i}"></svg>
        </div>
        <div class="price" style="font-size: ${labelData.fontSizes.price}px;">Rs ${labelData.price}</div>
      </div>
    `).join('');

    const barcodeScripts = Array(quantity).fill(null).map((_, i) => `
      JsBarcode("#barcode-${i}", "${labelData.barcodeValue}", {
        format: "CODE128",
        width: 1,
        height: 20,
        displayValue: false,
        margin: 0
      });
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Print ${quantity} Label${quantity > 1 ? 's' : ''}</title>
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
            font-weight: bold;
            text-align: center;
            line-height: 1.2;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .product-name {
            text-align: center;
            line-height: 1.2;
            margin-top: 1px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .dates {
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
            font-weight: bold;
            text-align: center;
            line-height: 1;
          }
        </style>
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"><\/script>
      </head>
      <body>
        ${labelsHtml}
        <script>
          ${barcodeScripts}
          setTimeout(() => window.print(), 200);
        <\/script>
      </body>
      </html>
    `);
    printWindow.document.close();
    toast.success(`Print dialog opened for ${quantity} label${quantity > 1 ? 's' : ''}`);
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
          {/* Left: Form + Templates */}
          <div className="space-y-4">
            <LabelForm
              data={labelData}
              onChange={setLabelData}
              selectedSize={selectedSize}
              onSizeChange={setSelectedSize}
              onReset={handleReset}
            />

            {/* Save/Update Template Button */}
            <Dialog open={saveDialogOpen} onOpenChange={handleDialogClose}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Save as Template
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingTemplate ? 'Update Template' : 'Save Template'}</DialogTitle>
                  <DialogDescription>
                    {editingTemplate 
                      ? 'Update this template with the current label configuration.'
                      : 'Save your current label configuration for quick reuse later.'}
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="templateName">Template Name</Label>
                  <Input
                    id="templateName"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="e.g., Milk Powder Label"
                    className="mt-2"
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveTemplate()}
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => handleDialogClose(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveTemplate} className="bg-accent text-accent-foreground hover:bg-accent/90">
                    {editingTemplate ? 'Update Template' : 'Save Template'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Saved Templates */}
            <SavedTemplates
              templates={templates}
              onLoad={handleLoadTemplate}
              onDelete={handleDeleteTemplate}
              onEdit={handleEditTemplate}
            />
          </div>

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

            {/* Quantity Selector */}
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Copy className="w-4 h-4 text-muted-foreground" />
                    <Label className="text-sm font-medium">Print Quantity</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                      className="w-16 h-8 text-center font-medium"
                      min={1}
                      max={100}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= 100}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {quantity > 1 ? `Will print ${quantity} identical labels` : 'Print a single label'}
                </p>
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
                Print {quantity > 1 ? `${quantity} Labels` : 'Label'}
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
                <li>• Save frequently used labels as templates</li>
                <li>• Click the pencil icon to edit existing templates</li>
                <li>• Adjust font sizes in the collapsible panel</li>
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

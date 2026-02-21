import { useState, useRef, useEffect } from "react";
import {
  LabelData,
  LabelSize,
  DEFAULT_LABEL_SIZES,
  getAllLabelSizes,
  DEFAULT_LABEL_DATA,
  LabelTemplate,
  getTemplates,
  saveTemplate,
  deleteTemplate,
  generateTemplateId,
} from "@/types/label";
import LabelForm from "@/components/LabelForm";
import LabelPreview from "@/components/LabelPreview";
import PrintableLabel from "@/components/PrintableLabel";
import SavedTemplates from "@/components/SavedTemplates";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Printer,
  Download,
  Tag,
  ZoomIn,
  ZoomOut,
  Minus,
  Plus,
  Copy,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Index = () => {
  const [labelData, setLabelData] = useState<LabelData>(DEFAULT_LABEL_DATA);
  const [selectedSize, setSelectedSize] = useState<LabelSize>(
    DEFAULT_LABEL_SIZES[0],
  );
  const [previewScale, setPreviewScale] = useState(4);
  const [quantity, setQuantity] = useState(1);
  const [templates, setTemplates] = useState<LabelTemplate[]>([]);
  const [templateName, setTemplateName] = useState("");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<LabelTemplate | null>(
    null,
  );
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadTemplates = async () => {
      const loadedTemplates = await getTemplates();
      setTemplates(loadedTemplates);
    };
    loadTemplates();
  }, []);

  const handleReset = () => {
    setLabelData(DEFAULT_LABEL_DATA);
    setQuantity(1);
    toast.success("Label reset to defaults");
  };

  const handleQuantityChange = (newQty: number) => {
    setQuantity(Math.max(1, Math.min(100, newQty)));
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      toast.error("Please enter a template name");
      return;
    }

    // Always create a new template (allow multiple saves)
    const template: LabelTemplate = {
      id: generateTemplateId(),
      name: templateName.trim(),
      data: { ...labelData },
      createdAt: Date.now(),
      updatedAt: undefined,
    };

    try {
      await saveTemplate(template);
      const updatedTemplates = await getTemplates();
      setTemplates(updatedTemplates);

      // Load the saved template data back into the form
      setLabelData(template.data);

      setTemplateName("");
      setEditingTemplate(null);
      setSaveDialogOpen(false);
      toast.success(`Template "${template.name}" saved and loaded`);
    } catch (error) {
      toast.error("Failed to save template. Please try again.");
    }
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

  const handleDeleteTemplate = async (id: string) => {
    try {
      const templateToDelete = templates.find((t) => t.id === id);

      // Delete from storage
      await window.Storage.delete(`template:${id}`);

      // Update local state
      setTemplates(templates.filter((t) => t.id !== id));

      toast.success(
        `Template "${templateToDelete?.name || "Unknown"}" deleted`,
      );
    } catch (error) {
      toast.error("Failed to delete template. Please try again.");
      console.error("Delete error:", error);
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setEditingTemplate(null);
      setTemplateName("");
    }
    setSaveDialogOpen(open);
  };

  const handlePrint = () => {
    if (!labelData.barcodeValue) {
      toast.error("Please enter or generate a barcode value");
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Unable to open print window. Please check popup blocker.");
      return;
    }

    const pxPerMm = 3.78;
    const columns = selectedSize.columns || 1;
    const widthPx = selectedSize.width * pxPerMm;
    const heightPx = selectedSize.height * pxPerMm;
    const totalPageWidth = widthPx * columns;

    const labelsPerRow = columns;
    const totalRows = Math.ceil(quantity / labelsPerRow);

    let labelsHtml = "";
    let barcodeIndex = 0;

    for (let row = 0; row < totalRows; row++) {
      const isNewPage = row > 0;
      labelsHtml += `<div class="label-row" ${isNewPage ? 'style="page-break-before: always;"' : ""}>`;

      for (let col = 0; col < labelsPerRow && barcodeIndex < quantity; col++) {
        labelsHtml += `
        <div class="label">
  <div class="shop-name-side">${labelData.shopName}</div>
  <div class="label-content">
    <div class="price-row">
      <span>Rs.${labelData.price} /=</span>
    </div>
    <div class="barcode-container">
      <svg id="barcode-${barcodeIndex}"></svg>
    </div>
    <div class="product-name">${labelData.productName}</div>
  </div>
</div>
      `;
        barcodeIndex++;
      }

      labelsHtml += "</div>";
    }

    const barcodeScripts = Array(quantity)
      .fill(null)
      .map(
        (_, i) => `
    JsBarcode("#barcode-${i}", "${labelData.barcodeValue}", {
      format: "CODE128",
      width: 1.8,
      height: 15,
      displayValue: true,
      fontSize: 14,
      margin: 0,
      marginTop: 0,
      marginBottom: 0
    });
  `,
      )
      .join("");

    printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Print ${quantity} Label${quantity > 1 ? "s" : ""}</title>
      <style>
        @page {
          margin: 0;
          size: ${selectedSize.width * columns}mm ${selectedSize.height}mm;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Courier New', monospace;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .label-row {
          display: flex;
          flex-direction: row;
          width: ${totalPageWidth}px;
          gap: 2mm;
        }
        .label {
          width: ${widthPx}px;
          height: ${heightPx}px;
          padding: 3px 2px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: white;
          flex-shrink: 0;
        }
       /* REPLACE WITH: */
.label {
  display: flex;
  flex-direction: row !important;
}
.shop-name-side {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  font-weight: bold;
  font-size: 8px;
  text-align: center;
  letter-spacing: 1px;
  white-space: nowrap;
  border-right: 1px solid #000;
  padding-right: 2px;
  margin-right: 3px;
  flex-shrink: 0;
}
.label-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  // overflow: hidden;
}
        .product-name {
          font-size: 8px;
          text-align: left;
          font-weight: bold;
          // line-height: 1.1;
        }
        .price-row {
          font-size: 12px;
          font-weight: bold;
          text-align: left;
          line-height: 1.2;
        }
        .barcode-container {
          flex: 1;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          height: 30px;
          margin-top: 2px;
        }
        .barcode-container svg {
          max-width: 100%;
        }
      </style>
      <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
    </head>
    <body>
      ${labelsHtml}
      <script>
        ${barcodeScripts}
        setTimeout(() => window.print(), 200);
      </script>
    </body>
    </html>
  `);
    printWindow.document.close();
    toast.success(
      `Print dialog opened for ${quantity} label${quantity > 1 ? "s" : ""} (${columns} column${columns > 1 ? "s" : ""})`,
    );
  };

  const formatDateForPrint = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    } catch {
      return dateStr;
    }
  };

  const handleDownloadPDF = () => {
    if (!labelData.barcodeValue) {
      toast.error("Please enter or generate a barcode value");
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
              <h1 className="text-xl font-bold text-foreground">LabelFlow</h1>
              <p className="text-sm text-muted-foreground">
                Create print-ready barcode labels
              </p>
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
                  <DialogTitle>
                    {editingTemplate ? "Update Template" : "Save Template"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingTemplate
                      ? "Update this template with the current label configuration."
                      : "Save your current label configuration for quick reuse later."}
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
                    onKeyDown={(e) => e.key === "Enter" && handleSaveTemplate()}
                  />
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => handleDialogClose(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveTemplate}
                    className="bg-accent text-accent-foreground hover:bg-accent/90"
                  >
                    {editingTemplate ? "Update Template" : "Save Template"}
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
                  <CardTitle className="text-lg font-semibold">
                    Live Preview
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setPreviewScale(Math.max(2, previewScale - 1))
                      }
                      disabled={previewScale <= 2}
                      className="h-8 w-8"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground w-12 text-center">
                      {Math.round((previewScale / 3) * 100)}%
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setPreviewScale(Math.min(6, previewScale + 1))
                      }
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
                    <Label className="text-sm font-medium">
                      Print Quantity
                    </Label>
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
                      onChange={(e) =>
                        handleQuantityChange(parseInt(e.target.value) || 1)
                      }
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
                  {quantity > 1
                    ? `Will print ${quantity} identical labels`
                    : "Print a single label"}
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
                Print {quantity > 1 ? `${quantity} Labels` : "Label"}
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
              <h3 className="font-medium text-sm text-foreground mb-2">
                Quick Tips
              </h3>
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

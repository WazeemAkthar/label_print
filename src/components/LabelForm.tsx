import { LabelData, CURRENCIES, LabelSize, LABEL_SIZES } from '@/types/label';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shuffle, RotateCcw } from 'lucide-react';

interface LabelFormProps {
  data: LabelData;
  onChange: (data: LabelData) => void;
  selectedSize: LabelSize;
  onSizeChange: (size: LabelSize) => void;
  onReset: () => void;
}

const LabelForm = ({ data, onChange, selectedSize, onSizeChange, onReset }: LabelFormProps) => {
  const updateField = (field: keyof LabelData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const generateBarcode = () => {
    // Generate a random barcode: prefix + timestamp + random
    const prefix = data.productName.substring(0, 2).toUpperCase() || 'PR';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    updateField('barcodeValue', `${prefix}${timestamp}${random}`);
  };

  return (
    <Card className="h-fit">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Label Details</CardTitle>
          <Button variant="ghost" size="sm" onClick={onReset} className="text-muted-foreground hover:text-foreground">
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Label Size */}
        <div className="space-y-2">
          <Label htmlFor="labelSize">Label Size</Label>
          <Select
            value={`${selectedSize.width}x${selectedSize.height}`}
            onValueChange={(value) => {
              const size = LABEL_SIZES.find(s => `${s.width}x${s.height}` === value);
              if (size) onSizeChange(size);
            }}
          >
            <SelectTrigger id="labelSize">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LABEL_SIZES.map((size) => (
                <SelectItem key={`${size.width}x${size.height}`} value={`${size.width}x${size.height}`}>
                  {size.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Shop Name */}
        <div className="space-y-2">
          <Label htmlFor="shopName">Shop / Company Name</Label>
          <Input
            id="shopName"
            value={data.shopName}
            onChange={(e) => updateField('shopName', e.target.value)}
            placeholder="Enter shop name"
            maxLength={30}
          />
        </div>

        {/* Product Name */}
        <div className="space-y-2">
          <Label htmlFor="productName">Product Name</Label>
          <Input
            id="productName"
            value={data.productName}
            onChange={(e) => updateField('productName', e.target.value)}
            placeholder="Enter product name"
            maxLength={25}
          />
        </div>

        {/* Dates Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="mfgDate">Manufacture Date</Label>
            <Input
              id="mfgDate"
              type="date"
              value={data.mfgDate}
              onChange={(e) => updateField('mfgDate', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expDate">Expiry Date</Label>
            <Input
              id="expDate"
              type="date"
              value={data.expDate}
              onChange={(e) => updateField('expDate', e.target.value)}
            />
          </div>
        </div>

        {/* Price Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select value={data.currency} onValueChange={(value) => updateField('currency', value)}>
              <SelectTrigger id="currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((curr) => (
                  <SelectItem key={curr.symbol} value={curr.symbol}>
                    {curr.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 col-span-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              value={data.price}
              onChange={(e) => updateField('price', e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        {/* Barcode */}
        <div className="space-y-2">
          <Label htmlFor="barcode">Barcode Value (Code 128)</Label>
          <div className="flex gap-2">
            <Input
              id="barcode"
              value={data.barcodeValue}
              onChange={(e) => updateField('barcodeValue', e.target.value)}
              placeholder="Enter or generate barcode"
              className="flex-1 font-mono"
              maxLength={20}
            />
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={generateBarcode}
              title="Generate barcode"
            >
              <Shuffle className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Auto-generate or enter manually. Max 20 characters.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LabelForm;

import { useState } from 'react';
import { LabelSize, saveCustomSize, getCustomSizes, deleteCustomSize } from '@/types/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Trash2, Ruler } from 'lucide-react';
import { toast } from 'sonner';

interface CustomSizeDialogProps {
  onSizeAdded: () => void;
}

const CustomSizeDialog = ({ onSizeAdded }: CustomSizeDialogProps) => {
  const [open, setOpen] = useState(false);
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [columns, setColumns] = useState('1');
  const [customSizes, setCustomSizes] = useState<LabelSize[]>(getCustomSizes());

  const refreshCustomSizes = () => {
    setCustomSizes(getCustomSizes());
  };

  const handleAddSize = () => {
    const w = parseInt(width);
    const h = parseInt(height);
    const cols = parseInt(columns);

    if (!w || w < 10 || w > 200) {
      toast.error('Width must be between 10mm and 200mm');
      return;
    }
    if (!h || h < 10 || h > 200) {
      toast.error('Height must be between 10mm and 200mm');
      return;
    }

    const existingSizes = getCustomSizes();
    if (existingSizes.some(s => s.width === w && s.height === h)) {
      toast.error('This size already exists');
      return;
    }

    const columnText = cols > 1 ? ` (${cols} Col)` : '';
    const newSize: LabelSize = {
      width: w,
      height: h,
      name: `${w}mm × ${h}mm${columnText} (Custom)`,
      isCustom: true,
    };

    saveCustomSize(newSize);
    refreshCustomSizes();
    onSizeAdded();
    setWidth('');
    setHeight('');
    setColumns('1');
    toast.success(`Added custom size: ${w}mm × ${h}mm`);
  };

  const handleDeleteSize = (w: number, h: number) => {
    deleteCustomSize(w, h);
    refreshCustomSizes();
    onSizeAdded();
    toast.success('Custom size deleted');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Ruler className="w-4 h-4" />
          Custom Size
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Custom Label Sizes</DialogTitle>
          <DialogDescription>
            Add new label sizes in millimeters with optional column layout.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Add New Size Form */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="customWidth">Width (mm)</Label>
              <Input
                id="customWidth"
                type="number"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                placeholder="38"
                min={10}
                max={200}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customHeight">Height (mm)</Label>
              <Input
                id="customHeight"
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="25"
                min={10}
                max={200}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="columns">Columns</Label>
              <Select value={columns} onValueChange={setColumns}>
                <SelectTrigger id="columns">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Column</SelectItem>
                  <SelectItem value="2">2 Columns</SelectItem>
                  <SelectItem value="3">3 Columns</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleAddSize} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Custom Size
          </Button>

          {/* List of Custom Sizes */}
          {customSizes.length > 0 && (
            <div className="space-y-2">
              <Label className="text-muted-foreground">Your Custom Sizes</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {customSizes.map((size) => (
                  <div
                    key={`${size.width}x${size.height}`}
                    className="flex items-center justify-between p-2 bg-muted rounded-md"
                  >
                    <span className="text-sm">{size.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteSize(size.width, size.height)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomSizeDialog;

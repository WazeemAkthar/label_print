import { useState } from 'react';
import { LabelTemplate, LabelData, deleteTemplate } from '@/types/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bookmark, Trash2, FileText, ChevronDown, ChevronUp, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface SavedTemplatesProps {
  templates: LabelTemplate[];
  onLoad: (data: LabelData) => void;
  onDelete: (id: string) => void;
  onEdit: (template: LabelTemplate) => void;
}

const SavedTemplates = ({ templates, onLoad, onDelete, onEdit }: SavedTemplatesProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleLoad = (template: LabelTemplate) => {
    onLoad(template.data);
    toast.success(`Loaded "${template.name}"`);
  };

  const handleDelete = (template: LabelTemplate) => {
    deleteTemplate(template.id);
    onDelete(template.id);
    toast.success(`Deleted "${template.name}"`);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-muted-foreground" />
            <CardTitle className="text-lg font-semibold">Saved Templates</CardTitle>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {templates.length}
            </span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      </CardHeader>
      
      {isExpanded && (
        <CardContent>
          {templates.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No saved templates yet</p>
              <p className="text-xs mt-1">Save your first template using the button above</p>
            </div>
          ) : (
            <ScrollArea className="h-[200px] pr-4">
              <div className="space-y-2">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors group"
                  >
                    <button
                      onClick={() => handleLoad(template)}
                      className="flex-1 text-left min-w-0"
                    >
                      <p className="font-medium text-sm truncate text-foreground">
                        {template.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {template.data.productName} • Rs {template.data.price}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDate(template.updatedAt || template.createdAt)}
                        {template.updatedAt && template.updatedAt !== template.createdAt && ' (edited)'}
                      </p>
                    </button>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(template);
                        }}
                        title="Edit template"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Template</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{template.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(template)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default SavedTemplates;

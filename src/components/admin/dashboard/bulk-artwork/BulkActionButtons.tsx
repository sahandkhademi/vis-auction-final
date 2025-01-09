import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface BulkActionButtonsProps {
  selectedCount: number;
  onPublish: () => void;
  onUnpublish: () => void;
  onDelete: () => void;
}

export const BulkActionButtons = ({
  selectedCount,
  onPublish,
  onUnpublish,
  onDelete,
}: BulkActionButtonsProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPublish}
          disabled={!selectedCount}
        >
          Publish Selected
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onUnpublish}
          disabled={!selectedCount}
        >
          Unpublish Selected
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={onDelete}
          disabled={!selectedCount}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Selected
        </Button>
      </div>
      <span className="text-sm text-muted-foreground">
        {selectedCount} selected
      </span>
    </div>
  );
};
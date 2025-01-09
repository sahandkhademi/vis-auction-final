import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Plus, GripVertical } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BannerForm } from "./BannerForm";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableBannerRowProps {
  banner: any;
  onEdit: (banner: any) => void;
  onDelete: (id: string) => void;
}

const SortableBannerRow = ({ banner, onEdit, onDelete }: SortableBannerRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: banner.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell>
        <div className="flex items-center gap-2">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab touch-none"
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
          </button>
          <span className="font-medium">{banner.title}</span>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={banner.active ? "default" : "secondary"}>
          {banner.active ? "Active" : "Inactive"}
        </Badge>
      </TableCell>
      <TableCell>{new Date(banner.created_at).toLocaleDateString()}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onEdit(banner)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDelete(banner.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export const BannerList = () => {
  const [selectedBanner, setSelectedBanner] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: banners = [], refetch } = useQuery({
    queryKey: ["homepage-banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("homepage_banners")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const oldIndex = banners.findIndex((banner) => banner.id === active.id);
    const newIndex = banners.findIndex((banner) => banner.id === over.id);
    
    const newOrder = arrayMove(banners, oldIndex, newIndex);
    
    // Update display order in the database
    try {
      const updates = newOrder.map((banner, index) => ({
        id: banner.id,
        display_order: index,
      }));

      const { error } = await supabase
        .from("homepage_banners")
        .upsert(updates);

      if (error) throw error;
      
      toast.success("Banner order updated");
      refetch();
    } catch (error) {
      console.error("Error updating banner order:", error);
      toast.error("Failed to update banner order");
    }
  };

  const handleDelete = async (id: string) => {
    const confirmation = window.confirm(
      "Are you sure you want to delete this banner?"
    );
    if (!confirmation) return;

    try {
      const { error } = await supabase
        .from("homepage_banners")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Banner deleted successfully");
      refetch();
    } catch (error) {
      console.error("Error deleting banner:", error);
      toast.error("Failed to delete banner");
    }
  };

  const handleEdit = (banner: any) => {
    setSelectedBanner(banner);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedBanner(null);
    setIsDialogOpen(true);
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Homepage Banners</h2>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" /> Add Banner
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <SortableContext
              items={banners}
              strategy={verticalListSortingStrategy}
            >
              {banners.map((banner) => (
                <SortableBannerRow
                  key={banner.id}
                  banner={banner}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </SortableContext>
          </TableBody>
        </Table>
      </DndContext>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedBanner ? "Edit Banner" : "Create Banner"}
            </DialogTitle>
          </DialogHeader>
          <BannerForm
            defaultValues={selectedBanner}
            onSuccess={handleSuccess}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
import { Trash2 } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface NotificationItemProps {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  type: string;
  onDelete: (id: string) => Promise<void>;
  onRead: (id: string, type: string, entityId?: string) => Promise<void>;
}

export const NotificationItem = ({
  id,
  title,
  message,
  createdAt,
  type,
  onDelete,
  onRead,
}: NotificationItemProps) => {
  // Extract auction/entity ID from the message if present
  const entityId = message.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/)?.[0];

  const handleClick = async () => {
    await onRead(id, type, entityId);
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative group bg-white hover:bg-gray-50 transition-colors"
    >
      <DropdownMenuItem
        className="flex flex-col items-start p-4 space-y-1 cursor-pointer w-full pr-16"
        onClick={handleClick}
      >
        <div className="font-semibold">{title}</div>
        <div className="text-sm text-gray-500">{message}</div>
        <div className="text-xs text-gray-400">
          {new Date(createdAt).toLocaleDateString()}
        </div>
      </DropdownMenuItem>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 hover:text-red-600"
        onClick={() => onDelete(id)}
      >
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Delete notification</span>
      </Button>
    </motion.div>
  );
};
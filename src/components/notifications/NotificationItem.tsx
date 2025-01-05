import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import type { PanInfo } from "framer-motion";

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
  const entityId = message.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/)?.[0];

  const handleDragEnd = async (info: PanInfo) => {
    const SWIPE_THRESHOLD = -50;
    if (info.offset.x < SWIPE_THRESHOLD) {
      await onDelete(id);
    }
  };

  return (
    <motion.div
      key={id}
      initial={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(_, info) => handleDragEnd(info)}
      className="relative group"
    >
      <DropdownMenuItem
        className="flex flex-col items-start p-4 pr-12 space-y-1 cursor-pointer w-full"
        onClick={() => onRead(id, type, entityId)}
      >
        <div className="font-semibold">{title}</div>
        <div className="text-sm text-gray-500">{message}</div>
        <div className="text-xs text-gray-400">
          {new Date(createdAt).toLocaleDateString()}
        </div>
      </DropdownMenuItem>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
        <Trash2 className="h-4 w-4" />
      </div>
    </motion.div>
  );
};
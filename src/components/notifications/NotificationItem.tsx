import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface NotificationItemProps {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  type: string;
  onRead: (id: string, type: string, entityId?: string) => Promise<void>;
}

export const NotificationItem = ({
  id,
  title,
  message,
  createdAt,
  type,
  onRead,
}: NotificationItemProps) => {
  const navigate = useNavigate();
  
  // Extract auction/entity ID from the message if present
  const entityId = message.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/)?.[0];

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    await onRead(id, type, entityId);
    
    // Handle navigation based on notification type
    if (entityId) {
      switch (type) {
        case 'auction_won':
        case 'outbid':
        case 'auction_expired':
          navigate(`/auction/${entityId}`);
          break;
        case 'payment_success':
          navigate('/profile');
          break;
        default:
          // For unknown types, just mark as read without navigation
          break;
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative group bg-white hover:bg-gray-50 transition-colors"
    >
      <DropdownMenuItem
        className="flex flex-col items-start p-4 space-y-1 cursor-pointer w-full"
        onClick={handleClick}
      >
        <div className="font-semibold">{title}</div>
        <div className="text-sm text-gray-500">{message}</div>
        <div className="text-xs text-gray-400">
          {new Date(createdAt).toLocaleDateString()}
        </div>
      </DropdownMenuItem>
    </motion.div>
  );
};
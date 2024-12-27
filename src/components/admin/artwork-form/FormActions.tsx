import { Button } from "@/components/ui/button";

interface FormActionsProps {
  isLoading: boolean;
  onCancel: () => void;
}

export const FormActions = ({ isLoading, onCancel }: FormActionsProps) => {
  return (
    <div className="flex justify-end gap-4">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save"}
      </Button>
    </div>
  );
};
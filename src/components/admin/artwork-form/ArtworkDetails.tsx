import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { ArtworkFormData } from "@/types/artwork";

interface ArtworkDetailsProps {
  form: UseFormReturn<ArtworkFormData>;
}

export const ArtworkDetails = ({ form }: ArtworkDetailsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="created_year"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Year</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="dimensions"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Dimensions</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="format"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Format</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="starting_price"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Starting Price</FormLabel>
            <FormControl>
              <Input
                {...field}
                type="number"
                onChange={(e) => field.onChange(parseFloat(e.target.value))}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { ArtworkFormData } from "@/types/artwork";
import { Input } from "@/components/ui/input";

interface AuctionSettingsProps {
  form: UseFormReturn<ArtworkFormData>;
  isLoading: boolean;
}

export const AuctionSettings = ({ form, isLoading }: AuctionSettingsProps) => {
  const setTestEndDate = () => {
    // Set end date to 1 minute from now
    const endDate = new Date();
    endDate.setMinutes(endDate.getMinutes() + 1);
    form.setValue('end_date', endDate.toISOString());
  };

  return (
    <>
      <FormField
        control={form.control}
        name="end_date"
        render={({ field }) => {
          const date = field.value ? new Date(field.value) : null;
          
          // Extract time from the date if it exists
          const timeString = date 
            ? `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
            : '';

          const handleDateSelect = (selectedDate: Date | undefined) => {
            if (!selectedDate) {
              field.onChange(null);
              return;
            }

            // If there's an existing date, preserve its time
            if (date) {
              selectedDate.setHours(date.getHours(), date.getMinutes());
            } else {
              // Default to current time if no previous time exists
              const now = new Date();
              selectedDate.setHours(now.getHours(), now.getMinutes());
            }
            
            field.onChange(selectedDate.toISOString());
          };

          const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (!date) return;
            
            const [hours, minutes] = e.target.value.split(':').map(Number);
            const newDate = new Date(date);
            newDate.setHours(hours, minutes);

            // Only validate against past times if it's today
            const now = new Date();
            const isToday = newDate.toDateString() === now.toDateString();
            
            if (isToday && newDate < now) {
              // If it's today and the time is in the past, set it to current time
              newDate.setHours(now.getHours(), now.getMinutes());
            }
            
            field.onChange(newDate.toISOString());
          };

          return (
            <FormItem className="flex flex-col">
              <FormLabel>Auction End Date & Time</FormLabel>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {date ? (
                          format(date, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={handleDateSelect}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const compareDate = new Date(date);
                        compareDate.setHours(0, 0, 0, 0);
                        return compareDate < today;
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <div className="relative">
                  <FormControl>
                    <Input
                      type="time"
                      value={timeString}
                      onChange={handleTimeChange}
                      className="w-[150px]"
                      disabled={!date}
                    />
                  </FormControl>
                  <Clock className="absolute right-3 top-2.5 h-4 w-4 opacity-50" />
                </div>

                <Button 
                  type="button" 
                  variant="outline"
                  onClick={setTestEndDate}
                  className="whitespace-nowrap"
                >
                  Test (1min)
                </Button>
              </div>
            </FormItem>
          );
        }}
      />

      <FormField
        control={form.control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Status</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              disabled={isLoading}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />
    </>
  );
};
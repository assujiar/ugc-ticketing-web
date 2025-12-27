"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, addDays } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useCreateQuote } from "@/hooks/useQuotes";
import { quoteSchema, type QuoteFormData } from "@/types/forms";
import { Loader2 } from "lucide-react";

interface CreateQuoteDialogProps {
  ticketId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CURRENCIES = ["USD", "EUR", "GBP", "IDR", "SGD", "MYR"];

export function CreateQuoteDialog({ ticketId, open, onOpenChange }: CreateQuoteDialogProps) {
  const createMutation = useCreateQuote(ticketId);

  const defaultValidUntil = format(addDays(new Date(), 30), "yyyy-MM-dd");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      amount: 0,
      currency: "USD",
      valid_until: defaultValidUntil,
      terms: "",
    },
  });

  const currency = watch("currency");

  const onSubmit = async (data: QuoteFormData) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        toast.success("Quote created", { description: "The rate quote has been created"  });
        reset();
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error("Error", { description: error.message });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Rate Quote</DialogTitle>
          <DialogDescription>
            Create a new rate quote for this inquiry.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                {...register("amount", { valueAsNumber: true })}
              />
              {errors.amount && (
                <p className="text-sm text-destructive">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={currency} onValueChange={(value) => setValue("currency", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((curr) => (
                    <SelectItem key={curr} value={curr}>
                      {curr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="valid_until">Valid Until *</Label>
            <Input
              id="valid_until"
              type="date"
              {...register("valid_until")}
            />
            {errors.valid_until && (
              <p className="text-sm text-destructive">{errors.valid_until.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="terms">Terms & Conditions</Label>
            <Textarea
              id="terms"
              {...register("terms")}
              placeholder="Enter any terms or conditions"
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Quote
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

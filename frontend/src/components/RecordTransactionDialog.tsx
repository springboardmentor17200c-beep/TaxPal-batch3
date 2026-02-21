import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { transactionsApi } from "@/lib/api";
import { toast } from "sonner";

interface RecordTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type?: "income" | "expense";
}

const categories = {
  income: ["Consulting", "Freelance", "Salary", "Investment", "Other"],
  expense: ["Rent/Mortgage", "Utilities", "Food", "Business", "Transportation", "Other"],
};

const RecordTransactionDialog = ({ open, onOpenChange, type = "expense" }: RecordTransactionDialogProps) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationFn: (body: { type: string; category: string; amount: number; date: string; description?: string }) =>
      transactionsApi.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transactions-summary"] });
      onOpenChange(false);
      setDescription("");
      setAmount("");
      setCategory("");
      setNotes("");
      toast.success("Transaction added");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to add transaction"),
  });

  const isIncome = type === "income";

  const handleSave = () => {
    const amt = parseFloat(amount);
    if (!category || isNaN(amt) || amt <= 0) {
      toast.error("Please enter category and a valid amount.");
      return;
    }
    const value = isIncome ? amt : -amt;
    createMutation.mutate({
      type: isIncome ? "income" : "expense",
      category,
      amount: value,
      date,
      description: description || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Record New {isIncome ? "Income" : "Expense"}</DialogTitle>
          <DialogDescription>
            Add details about your {isIncome ? "income" : "expense"} to track your {isIncome ? "finances" : "spending"} better.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border p-4">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="font-semibold text-card-foreground">Add {isIncome ? "Income" : "Expense"}</h4>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Description</Label>
              <Input placeholder="e.g. Web Design Project" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input className="pl-7" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                <SelectContent>
                  {categories[type].map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <Label>Notes (Optional)</Label>
            <Textarea placeholder="Add any additional details..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={createMutation.isPending}>Cancel</Button>
          <Button variant={isIncome ? "default" : "destructive"} onClick={handleSave} disabled={createMutation.isPending}>
            {createMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecordTransactionDialog;

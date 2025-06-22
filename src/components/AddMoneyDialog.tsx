
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Wallet } from "lucide-react";
import { useBalance } from "@/hooks/useBalance";

interface AddMoneyDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddMoneyDialog = ({ isOpen, onClose }: AddMoneyDialogProps) => {
  const [amount, setAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("bank");
  const { addMoney, isLoading } = useBalance();

  const handleAddMoney = async () => {
    const amountNum = parseFloat(amount);
    if (amountNum > 0) {
      await addMoney(amountNum);
      setAmount("");
      onClose();
    }
  };

  const quickAmounts = [500, 1000, 2000, 5000];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Add Money to Wallet
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {quickAmounts.map((amt) => (
              <Button
                key={amt}
                variant="outline"
                size="sm"
                onClick={() => setAmount(amt.toString())}
                className="text-sm"
              >
                ₹{amt}
              </Button>
            ))}
          </div>

          <div className="space-y-3">
            <Label>Payment Method</Label>
            <div className="space-y-2">
              <div 
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedMethod === 'bank' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => setSelectedMethod('bank')}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Bank Account</p>
                    <p className="text-sm text-gray-500">ICICI Bank ••••7890</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleAddMoney} 
              disabled={!amount || parseFloat(amount) <= 0 || isLoading}
              className="flex-1"
            >
              {isLoading ? "Processing..." : `Add ₹${amount || "0"}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddMoneyDialog;

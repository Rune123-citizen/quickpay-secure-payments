
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, CreditCard, ArrowUp, ArrowDown, Plus } from "lucide-react";

const BalanceCard = () => {
  const [showBalance, setShowBalance] = useState(true);
  const balance = 12485.50;

  return (
    <Card className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white border-0 shadow-2xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-white text-lg">PayFlow Wallet</CardTitle>
              <p className="text-blue-100 text-sm">Primary Account</p>
            </div>
          </div>
          <Badge className="bg-green-500/20 text-green-100 border-green-400/30">
            Active
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-blue-100 text-sm">Available Balance</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBalance(!showBalance)}
              className="text-white hover:bg-white/10 p-1 h-auto"
            >
              {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
          <div className="text-3xl font-bold">
            ₹ {showBalance ? balance.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : "••••••"}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Button 
            variant="ghost" 
            className="flex flex-col items-center gap-2 h-auto py-3 text-white hover:bg-white/10 rounded-xl"
          >
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs">Add Money</span>
          </Button>
          
          <Button 
            variant="ghost" 
            className="flex flex-col items-center gap-2 h-auto py-3 text-white hover:bg-white/10 rounded-xl"
          >
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <ArrowUp className="w-5 h-5" />
            </div>
            <span className="text-xs">Send</span>
          </Button>
          
          <Button 
            variant="ghost" 
            className="flex flex-col items-center gap-2 h-auto py-3 text-white hover:bg-white/10 rounded-xl"
          >
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <ArrowDown className="w-5 h-5" />
            </div>
            <span className="text-xs">Request</span>
          </Button>
        </div>

        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-blue-100">Bank Account</span>
            <span className="text-green-200">●  Linked</span>
          </div>
          <div className="text-white font-medium">ICICI Bank ••••7890</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BalanceCard;


import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QrCode, Phone, User, CreditCard, Zap, Smartphone } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const PaymentSection = () => {
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePayment = async (type: string) => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    if (!recipient) {
      toast({
        title: "Recipient Required",
        description: "Please enter recipient details",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    // Simulate payment processing
    setTimeout(() => {
      toast({
        title: "Payment Successful!",
        description: `₹${amount} sent successfully via ${type}`,
      });
      setAmount("");
      setRecipient("");
      setLoading(false);
    }, 2000);
  };

  const quickAmounts = [100, 500, 1000, 2000];

  return (
    <Card className="shadow-xl border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-blue-600" />
          Send Money
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="upi" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upi" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              UPI ID
            </TabsTrigger>
            <TabsTrigger value="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Phone
            </TabsTrigger>
            <TabsTrigger value="qr" className="flex items-center gap-2">
              <QrCode className="w-4 h-4" />
              QR Code
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upi" className="space-y-4">
            <div>
              <Label htmlFor="upi">UPI ID</Label>
              <Input
                id="upi"
                placeholder="recipient@paytm"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-4 gap-2">
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

            <Button
              onClick={() => handlePayment("UPI")}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {loading ? "Processing..." : "Send Money"}
            </Button>
          </TabsContent>

          <TabsContent value="phone" className="space-y-4">
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter phone number"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="amount2">Amount (₹)</Label>
              <Input
                id="amount2"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <Button
              onClick={() => handlePayment("Phone")}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {loading ? "Processing..." : "Send Money"}
            </Button>
          </TabsContent>

          <TabsContent value="qr" className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <QrCode className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-4">Scan QR code to pay</p>
              <Button variant="outline" className="mb-2">
                Open Camera
              </Button>
              <p className="text-sm text-gray-500">or upload QR image</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Services */}
        <div className="mt-8 pt-6 border-t">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Quick Services
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm">Mobile Recharge</span>
            </Button>
            
            <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm">Electricity</span>
            </Button>
            
            <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm">Credit Card</span>
            </Button>
            
            <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-sm">DTH</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentSection;

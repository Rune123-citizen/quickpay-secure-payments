
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, ArrowRight, Shield, Lock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuth: () => void;
}

const AuthModal = ({ isOpen, onClose, onAuth }: AuthModalProps) => {
  const [step, setStep] = useState<"phone" | "otp" | "pin">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [upiPin, setUpiPin] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (phoneNumber.length !== 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    // Simulate OTP sending
    setTimeout(() => {
      toast({
        title: "OTP Sent",
        description: `Verification code sent to +91 ${phoneNumber}`,
      });
      setStep("otp");
      setLoading(false);
    }, 1500);
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the 6-digit OTP",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    // Simulate OTP verification
    setTimeout(() => {
      toast({
        title: "OTP Verified",
        description: "Phone number verified successfully",
      });
      setStep("pin");
      setLoading(false);
    }, 1000);
  };

  const handleSetupPin = async () => {
    if (upiPin.length !== 4) {
      toast({
        title: "Invalid PIN",
        description: "UPI PIN must be 4 digits",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    // Simulate PIN setup
    setTimeout(() => {
      toast({
        title: "Welcome to PayFlow!",
        description: "Your account has been set up successfully",
      });
      onAuth();
      setLoading(false);
    }, 1500);
  };

  const renderPhoneStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Phone className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Welcome to PayFlow</h2>
        <p className="text-gray-600">Enter your mobile number to get started</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="phone">Mobile Number</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">+91</span>
            <Input
              id="phone"
              type="tel"
              placeholder="Enter your mobile number"
              className="pl-12"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
            />
          </div>
        </div>

        <Button
          onClick={handleSendOTP}
          disabled={loading || phoneNumber.length !== 10}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {loading ? "Sending OTP..." : "Send OTP"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="text-center text-sm text-gray-500">
        By continuing, you agree to our Terms & Privacy Policy
      </div>
    </div>
  );

  const renderOTPStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Verify Your Number</h2>
        <p className="text-gray-600">Enter the 6-digit code sent to +91 {phoneNumber}</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="otp">OTP Code</Label>
          <Input
            id="otp"
            type="text"
            placeholder="Enter 6-digit OTP"
            className="text-center text-2xl tracking-widest"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          />
        </div>

        <Button
          onClick={handleVerifyOTP}
          disabled={loading || otp.length !== 6}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
        >
          {loading ? "Verifying..." : "Verify OTP"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>

        <Button variant="ghost" className="w-full" onClick={() => setStep("phone")}>
          Change Number
        </Button>
      </div>
    </div>
  );

  const renderPinStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Setup UPI PIN</h2>
        <p className="text-gray-600">Create a 4-digit PIN to secure your transactions</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="pin">UPI PIN</Label>
          <Input
            id="pin"
            type="password"
            placeholder="Enter 4-digit PIN"
            className="text-center text-2xl tracking-widest"
            value={upiPin}
            onChange={(e) => setUpiPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
          />
        </div>

        <Button
          onClick={handleSetupPin}
          disabled={loading || upiPin.length !== 4}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          {loading ? "Setting up..." : "Setup PIN & Continue"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Security Tip:</strong> Never share your UPI PIN with anyone. PayFlow will never ask for your PIN via call or SMS.
        </p>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">Authentication</DialogTitle>
        </DialogHeader>
        
        {step === "phone" && renderPhoneStep()}
        {step === "otp" && renderOTPStep()}
        {step === "pin" && renderPinStep()}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;

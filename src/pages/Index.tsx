
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  QrCode, 
  Phone, 
  User, 
  ArrowRight,
  Home,
  Bell,
  Settings,
  Search,
  Plus,
  LogOut
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "@/components/AuthModal";
import PaymentSection from "@/components/PaymentSection";
import TransactionHistory from "@/components/TransactionHistory";
import BalanceCard from "@/components/BalanceCard";

const Index = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState("home");

  const handleAuth = () => {
    setShowAuthModal(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
          <div className="relative max-w-7xl mx-auto px-4 py-16">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-6 shadow-lg">
                <CreditCard className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent mb-4">
                PayFlow
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                India's fastest UPI payments platform. Send money, pay bills, recharge & more with bank-grade security.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
                  onClick={() => setShowAuthModal(true)}
                >
                  <Phone className="mr-2 h-5 w-5" />
                  Get Started
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-2 border-blue-200 hover:border-blue-300 px-8 py-6 text-lg"
                >
                  Learn More
                </Button>
              </div>
            </div>

            {/* Feature Grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <QrCode className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">Instant Payments</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600">Scan QR codes or send money using UPI ID in seconds with bank-grade security.</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">Bill Payments</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600">Pay electricity, mobile, DTH, and other bills instantly with cashback rewards.</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">Multi-Bank Support</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600">Link multiple bank accounts and manage all your finances from one secure platform.</p>
                </CardContent>
              </Card>
            </div>

            {/* Security Features */}
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 shadow-xl">
              <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
                Bank-Grade Security
              </h2>
              <div className="grid md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <span className="text-green-600 font-bold">256</span>
                  </div>
                  <p className="font-semibold">SSL Encryption</p>
                  <p className="text-sm text-gray-600">End-to-end security</p>
                </div>
                <div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <span className="text-blue-600 font-bold">2FA</span>
                  </div>
                  <p className="font-semibold">Two-Factor Auth</p>
                  <p className="text-sm text-gray-600">Multi-layer protection</p>
                </div>
                <div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <span className="text-purple-600 font-bold">RBI</span>
                  </div>
                  <p className="font-semibold">RBI Compliant</p>
                  <p className="text-sm text-gray-600">Regulatory approved</p>
                </div>
                <div>
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <span className="text-orange-600 font-bold">24/7</span>
                  </div>
                  <p className="font-semibold">Fraud Monitoring</p>
                  <p className="text-sm text-gray-600">Real-time protection</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)}
          onAuth={handleAuth}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
                PayFlow
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.firstName}!
              </span>
              <Button variant="ghost" size="sm">
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="w-5 h-5" />
              </Button>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <BalanceCard />
            <PaymentSection />
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            <TransactionHistory />
            
            {/* Quick Actions */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Phone className="w-4 h-4 mr-2" />
                  Mobile Recharge
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay Bills
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <QrCode className="w-4 h-4 mr-2" />
                  Scan & Pay
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Bottom Navigation (Mobile) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="flex items-center justify-around py-2">
          {[
            { icon: Home, label: "Home", id: "home" },
            { icon: QrCode, label: "Scan", id: "scan" },
            { icon: CreditCard, label: "Pay", id: "pay" },
            { icon: User, label: "Profile", id: "profile" }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center py-2 px-4 ${
                activeTab === item.id ? "text-blue-600" : "text-gray-500"
              }`}
            >
              <item.icon className="w-6 h-6 mb-1" />
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownLeft, Smartphone, Zap, Clock, RefreshCw } from "lucide-react";
import { useTransactions } from "@/hooks/useTransactions";

const TransactionHistory = () => {
  const { transactions, isLoading, fetchTransactions } = useTransactions();

  const getTransactionIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'upi_payment':
      case 'p2p_transfer':
        return ArrowUpRight;
      case 'money_received':
        return ArrowDownLeft;
      case 'mobile_recharge':
        return Smartphone;
      case 'bill_payment':
        return Zap;
      default:
        return ArrowUpRight;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'money_received':
        return "text-green-500";
      case 'upi_payment':
      case 'p2p_transfer':
        return "text-red-500";
      case 'mobile_recharge':
        return "text-blue-500";
      case 'bill_payment':
        return "text-orange-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      success: "bg-green-100 text-green-800 border-green-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      failed: "bg-red-100 text-red-800 border-red-200"
    };
    
    return variants[status.toLowerCase() as keyof typeof variants] || variants.pending;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-600" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-600" />
            Recent Transactions
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={fetchTransactions}
            disabled={isLoading}
            className="text-blue-600 hover:text-blue-700"
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No transactions yet</p>
            <p className="text-sm">Your transaction history will appear here</p>
          </div>
        ) : (
          transactions.slice(0, 5).map((transaction) => {
            const Icon = getTransactionIcon(transaction.type);
            const color = getTransactionColor(transaction.type);
            
            return (
              <div key={transaction.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{transaction.description || transaction.type}</p>
                    <p className="text-xs text-gray-500">{formatDate(transaction.createdAt)}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className={`font-semibold text-sm ${
                    transaction.type.includes('received') ? 'text-green-600' : 'text-gray-900'
                  }`}>
                    {transaction.type.includes('received') ? '+' : '-'}₹{transaction.amount.toLocaleString('en-IN')}
                  </p>
                  <Badge className={`text-xs ${getStatusBadge(transaction.status)}`}>
                    {transaction.status}
                  </Badge>
                </div>
              </div>
            );
          })
        )}

        {transactions.length > 5 && (
          <Button variant="outline" className="w-full mt-4">
            View All Transactions
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;

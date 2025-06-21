
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownLeft, Smartphone, Zap, Clock } from "lucide-react";

const TransactionHistory = () => {
  const transactions = [
    {
      id: 1,
      type: "sent",
      recipient: "Rajesh Kumar",
      amount: 2500,
      status: "completed",
      time: "2 min ago",
      icon: ArrowUpRight,
      color: "text-red-500"
    },
    {
      id: 2,
      type: "received",
      recipient: "Priya Sharma",
      amount: 1800,
      status: "completed",
      time: "1 hour ago",
      icon: ArrowDownLeft,
      color: "text-green-500"
    },
    {
      id: 3,
      type: "recharge",
      recipient: "Mobile Recharge",
      amount: 199,
      status: "completed",
      time: "3 hours ago",
      icon: Smartphone,
      color: "text-blue-500"
    },
    {
      id: 4,
      type: "bill",
      recipient: "Electricity Bill",
      amount: 1200,
      status: "pending",
      time: "5 hours ago",
      icon: Zap,
      color: "text-orange-500"
    },
    {
      id: 5,
      type: "received",
      recipient: "Amit Patel",
      amount: 500,
      status: "completed",
      time: "1 day ago",
      icon: ArrowDownLeft,
      color: "text-green-500"
    }
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "bg-green-100 text-green-800 border-green-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      failed: "bg-red-100 text-red-800 border-red-200"
    };
    
    return variants[status as keyof typeof variants] || variants.pending;
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-600" />
            Recent Transactions
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
            View All
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center ${transaction.color}`}>
                <transaction.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-sm">{transaction.recipient}</p>
                <p className="text-xs text-gray-500">{transaction.time}</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className={`font-semibold text-sm ${
                transaction.type === 'received' ? 'text-green-600' : 'text-gray-900'
              }`}>
                {transaction.type === 'received' ? '+' : '-'}₹{transaction.amount.toLocaleString('en-IN')}
              </p>
              <Badge className={`text-xs ${getStatusBadge(transaction.status)}`}>
                {transaction.status}
              </Badge>
            </div>
          </div>
        ))}

        <Button variant="outline" className="w-full mt-4">
          Load More Transactions
        </Button>
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;

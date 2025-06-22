
import { useState, useEffect } from 'react';
import { apiService, Transaction } from '@/services/api';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export const useTransactions = () => {
  const { isAuthenticated } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTransactions = async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    const response = await apiService.getTransactions();
    
    if (response.data) {
      setTransactions(response.data);
    } else {
      toast({
        title: "Error",
        description: response.error || "Failed to fetch transactions",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const sendMoney = async (data: {
    amount: number;
    vpa: string;
    description: string;
  }) => {
    setIsLoading(true);
    const response = await apiService.sendMoney(data);
    
    if (response.data) {
      toast({
        title: "Payment initiated",
        description: `₹${data.amount} sent to ${data.vpa}`,
      });
      await fetchTransactions(); // Refresh transactions
      return response.data;
    } else {
      toast({
        title: "Payment failed",
        description: response.error || "Please try again",
        variant: "destructive",
      });
      return null;
    }
    setIsLoading(false);
  };

  const p2pTransfer = async (data: {
    amount: number;
    toUserId: string;
    description: string;
  }) => {
    setIsLoading(true);
    const response = await apiService.p2pTransfer(data);
    
    if (response.data) {
      toast({
        title: "Transfer successful",
        description: `₹${data.amount} transferred successfully`,
      });
      await fetchTransactions(); // Refresh transactions
      return response.data;
    } else {
      toast({
        title: "Transfer failed",
        description: response.error || "Please try again",
        variant: "destructive",
      });
      return null;
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
  }, [isAuthenticated]);

  return {
    transactions,
    isLoading,
    fetchTransactions,
    sendMoney,
    p2pTransfer,
  };
};

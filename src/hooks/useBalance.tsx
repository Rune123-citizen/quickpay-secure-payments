
import { useState, useEffect } from 'react';
import { apiService, Balance } from '@/services/api';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export const useBalance = () => {
  const { isAuthenticated } = useAuth();
  const [balance, setBalance] = useState<Balance | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBalance = async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    const response = await apiService.getBalance();
    
    if (response.data) {
      setBalance(response.data);
    } else {
      toast({
        title: "Error",
        description: response.error || "Failed to fetch balance",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const addMoney = async (amount: number) => {
    setIsLoading(true);
    const response = await apiService.addMoney(amount);
    
    if (response.data) {
      toast({
        title: "Money added successfully",
        description: `₹${amount} has been added to your wallet`,
      });
      await fetchBalance(); // Refresh balance
    } else {
      toast({
        title: "Failed to add money",
        description: response.error || "Please try again",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBalance();
  }, [isAuthenticated]);

  return {
    balance,
    isLoading,
    fetchBalance,
    addMoney,
  };
};

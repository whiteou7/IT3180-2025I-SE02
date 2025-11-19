export type BillingDetail = {
  billingId: string;
  userId: string;
  fullName: string;
  totalAmount: number;
  billingStatus: string;
  usedAt: Date | null; 
  paymentDate: Date | null; 
  services: {
    serviceId: number;
    serviceName: string;
    price: number;
    tax: number;
    description: string;
  }[];
};
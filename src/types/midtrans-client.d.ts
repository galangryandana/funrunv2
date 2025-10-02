declare module 'midtrans-client' {
  interface SnapConfig {
    isProduction: boolean;
    serverKey: string;
    clientKey: string;
  }

  interface TransactionDetails {
    order_id: string;
    gross_amount: number;
  }

  interface ItemDetail {
    id: string;
    price: number;
    quantity: number;
    name: string;
  }

  interface CustomerDetails {
    first_name: string;
    email: string;
    phone?: string;
  }

  interface TransactionData {
    transaction_details: TransactionDetails;
    item_details?: ItemDetail[];
    customer_details: CustomerDetails;
  }

  interface SnapResponse {
    token: string;
    redirect_url: string;
  }

  interface TransactionStatus {
    status_code: string;
    status_message: string;
    transaction_id: string;
    order_id: string;
    gross_amount: string;
    payment_type: string;
    transaction_time: string;
    transaction_status: string;
    fraud_status?: string;
  }

  interface Transaction {
    status(orderId: string): Promise<TransactionStatus>;
  }

  class Snap {
    constructor(config: SnapConfig);
    createTransaction(parameter: TransactionData): Promise<SnapResponse>;
    transaction: Transaction;
  }

  const midtransClient: {
    Snap: typeof Snap;
  };

  export { Snap };
  export default midtransClient;
}

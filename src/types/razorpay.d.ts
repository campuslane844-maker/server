import Razorpay from "razorpay";

declare module "razorpay" {
  interface Razorpay {
    contacts: {
      create(data: {
        name: string;
        email: string;
        contact?: string;
        type?: string;
        reference_id?: string;
      }): Promise<any>;
    };

    fundAccounts: {
      create(data: {
        contact_id: string;
        account_type: "vpa" | "bank_account";
        vpa?: {
          address: string;
        };
        bank_account?: {
          name: string;
          ifsc: string;
          account_number: string;
        };
      }): Promise<any>;
    };

    payouts: {
      create(data: {
        account_number: string;
        fund_account_id: string;
        amount: number;
        currency: string;
        mode: string;
        purpose: string;
        reference_id?: string;
        narration?: string;
      }): Promise<any>;
    };
  }
}

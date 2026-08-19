import config from "../../config";
import { getBkashIdToken } from "../../lib/bkash";

const bookAppointment = async () => {
	const idToken = await getBkashIdToken();

	const response = await fetch(
		`${config.bkash_url}/tokenized/checkout/create`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				Authorization: idToken as string,
				"X-App-Key": config.bkash_app_key as string,
			},
			body: JSON.stringify({
				mode: "0011",
				payerReference: "01770618575",
				callbackURL: `${config.backend_url}/api/v1/appointment/callback/bkash`,
				amount: "500",
				currency: "BDT",
				intent: "sale",
				merchantInvoiceNumber: "Inv0001",
			}),
		},
	);

	const result = await response.json();
	console.log(result);

	if (result.statusCode !== "0000") {
		throw new Error(result.statusMessage || "bKash payment creation failed");
	}

	return result;
};

const bkashCallback = async (query: Record<string, any>) => {
	const { paymentID, status, signature } = query;
	if (!paymentID) throw new Error("Payment Id is Missing");
	if (!status) throw new Error("Status is Missing");
	if (!signature) throw new Error("Signature is Missing");

	const idToken = await getBkashIdToken();

	const response = await fetch(
		`${config.bkash_url}/tokenized/checkout/execute`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				Authorization: idToken as string,
				"X-App-Key": config.bkash_app_key as string,
			},
			body: JSON.stringify({ paymentID: paymentID }),
		},
	);
	const result = await response.json();
	console.log(result);

	return;
};

export const AppointmentService = { bookAppointment, bkashCallback };

/**
 * {
  paymentID: 'TR0011g5Wbcjf1787048197663',
  trxID: 'DHI60PA5FG',
  transactionStatus: 'Completed',
  amount: '500',
  currency: 'BDT',
  intent: 'sale',
  paymentExecuteTime: '2026-08-18T16:17:01:948 GMT+0600',
  merchantInvoiceNumber: 'Inv0001',
  payerType: 'Customer',
  payerReference: '01770618575',
  customerMsisdn: '01770618575',
  payerAccount: '01770618575',
  maxRefundableAmount: '500',
  statusCode: '0000',
  statusMessage: 'Successful'
}
 */

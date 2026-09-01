export interface IMedicine {
	name: string;
	dosage: string;
	duration: string;
	instructions?: string;
}
export interface ICreatePrescription {
	appointmentId: string;
	findings: string;
	medicines: IMedicine[];
}

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

export type PrescriptionPdfData = {
	prescriptionId: string;
	issuedAt?: string | Date;
	doctor: {
		name: string;
		specialization: string;
		qualification?: string | null;
		licenseNumber: string;
		contactNumber?: string | null;
		email?: string | null;
	};
	patient: {
		name: string;
		email?: string | null;
		contactNumber?: string | null;
		address?: string | null;
	};
	appointment: {
		serialNumber?: number | null;
		joiningTime?: string | Date | null;
	};
	findings: string;
	medicines: IMedicine[];
};

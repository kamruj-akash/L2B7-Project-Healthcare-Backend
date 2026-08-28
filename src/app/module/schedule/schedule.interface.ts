export interface ICreateSchedule {
	startDateTime: Date;
	endDateTime: Date;
	meetingLink: string;
}
export interface IUpdateSchedule {
	startDateTime?: Date;
	endDateTime?: Date;
	meetingLink?: string;
}

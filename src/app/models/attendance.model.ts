export type AttendanceResponse = {
  id: number;
  userId: number;
  date: string;
  timeIn: string | null;
  timeOut: string | null;
  checkInStatus: string;
  checkOutStatus: string;
};

export type StatusCountReportObject = {
  status: string;
  count: number;
};

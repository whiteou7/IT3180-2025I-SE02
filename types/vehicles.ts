export type VehicleLog = {
  vehicleLogId: string;
  userId: string | null;
  fullName: string | null;
  vehicleId: number | null;
  licensePlate: string | null;
  entranceTime: Date;
  exitTime: Date | null;
  apartmentId: number | null;
  apartmentNumber: number | null;
  buildingId: number | null;
  floor: number | null;
};
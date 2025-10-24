export type VehicleLog = {
  userId: string;
  fullName: string;
  vehicleId: number;
  licensePlate: string;
  entranceTime: Date;
  exitTime: Date | null;
};
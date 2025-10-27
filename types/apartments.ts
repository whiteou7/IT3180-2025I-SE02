export type ApartmentMember = {
  userId: string;
  fullName: string;
  email: string;
}

export type Apartment ={
  apartmentId: number;
  buildingId: number;
  floor: number;
  monthlyFee: number;
  apartmentNumber: number;
  members?: ApartmentMember[];
}
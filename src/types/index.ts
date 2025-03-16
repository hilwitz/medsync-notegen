
export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  email?: string;
  medicalRecordNumber?: string;
}

export interface Consultation {
  id: string;
  patientName: string;
  date: string;
  status: 'completed' | 'in_progress' | 'scheduled';
  noteType: 'SOAP' | 'H&P' | 'Progress';
}

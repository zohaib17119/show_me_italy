export interface UpdateAdminProfilePayload {
  id: string;
  fullName: string;
  country: string;
  city: string;
  profilePicture?: string;
  tourGuideLicenseOrCertificationNo: string;
  certificateUpload: string;
  languagesYouSpeak: number[];
  roleId: string;
}

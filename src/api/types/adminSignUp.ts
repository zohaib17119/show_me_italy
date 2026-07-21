export interface SignUpAdminPayload {
  fullName: string;
  email: string;
  phoneNumber: string;
  roleId: string;
  tourGuideLicenseOrCertificationNo: string;
  password: string;
  certificateUpload: string;
  languagesYouSpeak: string[];
  deviceToken: string;
}

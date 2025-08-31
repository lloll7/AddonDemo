interface Timezone {
  id: string;
  offset: number;
}

interface User {
  timezone: Timezone;
  accountLevel: number;
  countryCode: string;
  phoneNumber?: string;
  email?: string;
  apikey: string;
  nickname: string;
  accountConsult: boolean;
  appForumEnterHide: boolean;
  appVersion: string;
  denyRecharge: boolean;
  ipCountry: string;
}

export interface eweLinkAppToken {
  user: User;
  at: string;
  rt: string;
  region: string;
}

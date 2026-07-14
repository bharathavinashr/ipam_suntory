export type CountryCode = 'AU' | 'NZ';

export interface CampaignEvent {
  id?: string;
  name?: string;
  start_date?: string;
  end_date?: string;
  [key: string]: unknown;
}

export interface CalendarRowItem {
  id: string;
  section: string;
  categoryOrChannel?: string;
  rowDetail: string;
  events: CampaignEvent[];
}

export enum Page {
  Detector = 'DETECTOR',
  News = 'NEWS',
  Tides = 'TIDES',
  Settings = 'SETTINGS',
}

export interface Profile {
  name: string;
  picture: string | null;
}

export interface NewsArticle {
  id: number;
  title: string;
  summary: string;
  fullText: string;
  date: string;
  imageUrl?: string | null;
  source: string;
  city: string;
}

export interface TideData {
  city: string;
  status: 'Rising' | 'Falling' | 'High' | 'Low';
  height: number;
  nextHigh: string;
  nextLow: string;
  monthlyAvgHigh: number;
  monthlyAvgLow: number;
  past24h: number[];
}

export interface TideAlert {
  enabled: boolean;
  level: number;
}

export interface TideAlertConfig {
  [cityName: string]: TideAlert;
}
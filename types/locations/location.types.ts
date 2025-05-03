/**
 * Location Types
 *
 * Type definitions for location-related data
 */

export interface AdministrativeRegion {
  id: number;
  name: string;
  name_en: string;
  code_name: string;
  code_name_en: string;
}

export interface AdministrativeUnit {
  id: number;
  full_name: string;
  full_name_en: string;
  short_name: string;
  short_name_en: string;
  code_name: string;
  code_name_en: string;
}

export interface Province {
  code: string;
  name: string;
  name_en: string;
  full_name: string;
  full_name_en: string;
  code_name: string;

  // Relations
  administrative_unit_id: number;
  administrative_unit?: AdministrativeUnit;
  administrative_region_id: number;
  administrative_region?: AdministrativeRegion;

  // Optional UI data
  districts_count?: number;
}

export interface District {
  code: string;
  name: string;
  name_en: string;
  full_name: string;
  full_name_en: string;
  code_name: string;

  // Relations
  province_code: string;
  province?: Province;
  administrative_unit_id: number;
  administrative_unit?: AdministrativeUnit;

  // Optional UI data
  wards_count?: number;
}

export interface Ward {
  code: string;
  name: string;
  name_en: string;
  full_name: string;
  full_name_en: string;
  code_name: string;

  // Relations
  district_code: string;
  district?: District;
  administrative_unit_id: number;
  administrative_unit?: AdministrativeUnit;

  // Location coordinates
  latitude?: number;
  longitude?: number;

  // Special flag
  isNoResult: boolean;
}

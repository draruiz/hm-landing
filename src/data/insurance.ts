/**
 * Insurance plans the practice is in network with. Single source of truth for
 * the homepage section and the Rates & Insurance page — update it here only.
 *
 * `name` is the full plan name shown on the page (and read by search engines);
 * `short` is the common abbreviation people search for, when there is one.
 */
export interface InsurancePlan {
  name: string;
  short?: string;
}

export const acceptedInsurance: InsurancePlan[] = [
  { name: "Alma" },
  { name: "Blue Cross Blue Shield", short: "BCBS" },
  { name: "Carelon Behavioral Health" },
  { name: "Cigna" },
  { name: "Curative" },
  { name: "Florida Blue" },
  { name: "Optum" },
  { name: "Oscar" },
  { name: "Oxford" },
  { name: "Providence Health Plan" },
  { name: "UnitedHealthcare", short: "UHC" },
];


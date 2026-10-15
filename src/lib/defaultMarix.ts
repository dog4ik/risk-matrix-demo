import type { Field } from "../App";

const field = (key: string, label: string, expr = ""): Field => ({
  key,
  label,
  expr,
});

//   {
//     name: "status",
//     output: false,
//     expr: `contains(status, "банкрот") || contains(status, "конкурсн") ? 100 : 0`,
//   },
//   {
//     name: "statusChangeDate",
//     output: false,
//     expr: `status != "Действующее" && (days_since(statusChangeDate) ?? 99999) <= 90 ? 25 : 0`,
//   },
//   { name: "reorganizing", output: false, expr: `reorganizing ? 25 : 0` },
//   { name: "bankrupting", output: false, expr: `bankrupting ? 85 : 0` },
//   { name: "dissolving", output: false, expr: `dissolving ? 100 : 0` },
//   { name: "dissolved", output: false, expr: `dissolved ? 100 : 0` },
//   {
//     name: "bankruptcy_isInProgress",
//     output: false,
//     expr: `bankruptcy.isInProgress ? 85 : 0`,
//   },
//   {
//     name: "bankruptcy_stage",
//     output: false,
//     expr: `contains(bankruptcy.stage, "конкурсн") ? 100 : 0`,
//   },
//   {
//     name: "Статус",
//     output: true,
//     expr: `[
//   prev_risks.status,
//   prev_risks.statusChangeDate,
//   prev_risks.reorganizing,
//   prev_risks.bankrupting,
//   prev_risks.dissolving,
//   prev_risks.dissolved,
//   prev_risks.bankruptcy_isInProgress,
//   prev_risks.bankruptcy_stage
// ] | max`,
//   },
//
//   {
//     name: "registrationDate",
//     output: false,
//     expr: `registrationDate | days_since | step([90, 180, 365], [85, 50, 25, 0])`,
//   },
//   {
//     name: "Дата регистрации",
//     output: true,
//     expr: `[prev_risks.registrationDate] | max`,
//   },
//
//   {
//     name: "nalogDate",
//     output: false,
//     expr: `nalogDate < registrationDate ? 100 : 0`,
//   },
//   {
//     name: "Дата постановки на налоговый учёт",
//     output: true,
//     expr: `[prev_risks.nalogDate] | max`,
//   },
//
//   {
//     name: "principalOkved_needLicense",
//     output: false,
//     expr: `principalOkved.needLicense && (totalLicensesCount ?? 0) == 0 ? 100 : 0`,
//   },
//   {
//     name: "principalOkved_possiblyNeedLicense",
//     output: false,
//     expr: `principalOkved.possiblyNeedLicense && (totalLicensesCount ?? 0) == 0 ? 100 : 0`,
//   },
//   {
//     name: "Соответствие деятельности",
//     output: true,
//     expr: `[prev_risks.principalOkved_needLicense, prev_risks.principalOkved_possiblyNeedLicense] | max`,
//   },
//
//   {
//     name: "heads_changeDate",
//     output: false,
//     expr: `(days_since((ul.heads ?? [])[0].changeDate) ?? 99999) <= 90 || (days_since(ul.legalName.changeDate) ?? 99999) <= 90 ? 25 : 0`,
//   },
//   {
//     name: "buhReporting",
//     output: false,
//     expr: `[
//   (buhReporting.profitOnTheEndOfLastReportTerm ?? 0) < 0 ? 1 : 0,
//   (buhReporting.revenueOnTheEndOfLastReportTerm ?? 0) < (buhReporting.revenueOnTheBeginingOfLastReportTerm ?? 0) * 0.5 ? 1 : 0
// ] | sum | step([1, 2], [0, 50, 70])`,
//   },
//   {
//     name: "bankruptcyArbitrationsCount",
//     output: false,
//     expr: `bankruptcyArbitrationsCount | step([1, 2, 4], [0, 25, 70, 85])`,
//   },
//   {
//     name: "fssp_open_sum",
//     output: false,
//     expr: `(buhReporting.revenueOnTheEndOfLastReportTerm ?? 0) > 0
//   ? fssp.open.sum * 100 / to_f(buhReporting.revenueOnTheEndOfLastReportTerm) | step([0.001, 3, 10], [0, 25, 50, 70])
//   : 0`,
//   },
//   {
//     name: "fssp_open_count",
//     output: false,
//     expr: `fssp.open.count | step([1, 2, 4], [0, 25, 50, 70])`,
//   },
//   {
//     name: "Деловая репутация",
//     output: true,
//     expr: `[
//   prev_risks.heads_changeDate,
//   prev_risks.buhReporting,
//   prev_risks.bankruptcyArbitrationsCount,
//   prev_risks.fssp_open_sum,
//   prev_risks.fssp_open_count
// ] | max`,
//   },

export const uiIndicators: Field[] = [
  // recent or frequent renames
  field(
    "company_name",
    "Company Name",
    `[
  (days_since(ul.legalName.changeDate) ?? 99999) | step([90, 365], [50, 25, 0]),
  len(ul.ulHistory.ulLegalNames) | step([3, 5], [0, 25, 50])
] | max`,
  ),
  field(
    "company_status",
    "Company Status",
    `[
  status != "Действующее" ? 50 : 0,
  reorganizing ? 25 : 0,
  bankrupting || bankruptcy.isInProgress ? 85 : 0,
  contains(bankruptcy.stage, "конкурсн") ? 100 : 0,
  dissolving || dissolved ? 100 : 0
] | max`,
  ),
  // recently moved, or no house number
  field(
    "registration_address",
    "Registration Address",
    `[
  (days_since(ul.address.changeDate) ?? 99999) | step([90, 365], [50, 25, 0]),
  blank_as_null(trim(ul.address.house ?? "")) == null ? 50 : 0
] | max`,
  ),
  field(
    "registration_date",
    "Registration Date",
    "years_since(registrationDate) + 1 | log_10 | scale(0, log_10(20 + 1), 100, 0)",
  ),
  field(
    "activity_match",
    "Activity Match",
    "registrationDate | days_since | step([90, 180, 365], [85, 50, 25, 0])",
  ),

  field("company_sanctions", "Company Sanctions"),
  field("risk_countries", "Risk Countries"),
  field(
    "beneficiary_sanctions",
    "Beneficiary Sanctions",
    `len(ul.ulBeneficials.ulFlBeneficials) + len(ul.ulBeneficials.ulUlBeneficials) + len(ul.ulBeneficials.ulForeignBeneficials) == 0 ? 70 : 0`,
  ),
  field("pep_status", "PEP Status"),
  field(
    "business_reputation",
    "Business Reputation",
    `[
  fssp.topOpenBySum | map(|e| decay(days_since(e.startDateParsed) ?? 99999, 180)) | sum | scale(0, 5, 0, 70),
  bankruptcyArbitrationsCount | log_10 | scale(0, 3, 0, 85),
  (days_since((ul.heads ?? [])[0].changeDate) ?? 99999) <= 90 ? 25 : 0
] | max | round(0)`,
  ),
  // tax registration before the company existed, no phones, expired licenses
  field(
    "fraud",
    "Fraud",
    `[
  (days_since(nalogDate) ?? 0) > (days_since(registrationDate) ?? 0) ? 100 : 0,
  len(phones) == 0 ? 25 : 0,
  len(activeLicenses | filter(|l| l.statusDescription == "Истекла")) | step([1, 10], [0, 10, 25])
] | max`,
  ),

  field("total_rejections", "Total Rejections"),
  field("sender_bank_rejections", "Sender Bank Rejections"),
  field("beneficiary_bank_rejections", "Beneficiary Bank Rejections"),
  field("last_rejection", "Last Rejection"),
  field("rejection_reason", "Rejection Reason"),
];

export const overallRisk: Field[] = [
  field(
    "compliance_risk",
    "Compliance Risk",
    `[
  prev_risks.company_sanctions,
  prev_risks.beneficiary_sanctions,
  prev_risks.risk_countries,
  prev_risks.pep_status,
  prev_risks.activity_match
] | max ?? 0`,
  ),
  field(
    "reputational_risk",
    "Reputational Risk",
    `[prev_risks.business_reputation, prev_risks.fraud, prev_risks.company_status] | max ?? 0`,
  ),
  field(
    "operational_risk",
    "Operational Risk",
    `0.4 * (prev_risks.registration_date ?? 0)
  + 0.3 * (prev_risks.registration_address ?? 0)
  + 0.3 * (prev_risks.company_name ?? 0)
  | round(0)`,
  ),
];

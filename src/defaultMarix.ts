
import type { Row } from "./App";

// Rules that need documents, the contract or data missing from the response are left out.
export const sampleMatrix: Row[] = [
  // Статус
  { name: 'status', output: false, expr: `contains(status, "банкрот") || contains(status, "конкурсн") ? 100 : 0` },
  {
    name: 'statusChangeDate',
    output: false,
    expr: `status != "Действующее" && (days_since(statusChangeDate) ?? 99999) <= 90 ? 25 : 0`,
  },
  { name: 'reorganizing', output: false, expr: `reorganizing ? 25 : 0` },
  { name: 'bankrupting', output: false, expr: `bankrupting ? 85 : 0` },
  { name: 'dissolving', output: false, expr: `dissolving ? 100 : 0` },
  { name: 'dissolved', output: false, expr: `dissolved ? 100 : 0` },
  { name: 'bankruptcy_isInProgress', output: false, expr: `bankruptcy.isInProgress ? 85 : 0` },
  { name: 'bankruptcy_stage', output: false, expr: `contains(bankruptcy.stage, "конкурсн") ? 100 : 0` },
  {
    name: 'Статус',
    output: true,
    expr: `[
  prev_risks.status,
  prev_risks.statusChangeDate,
  prev_risks.reorganizing,
  prev_risks.bankrupting,
  prev_risks.dissolving,
  prev_risks.dissolved,
  prev_risks.bankruptcy_isInProgress,
  prev_risks.bankruptcy_stage
] | max`,
  },

  {
    name: 'registrationDate',
    output: false,
    expr: `registrationDate | days_since | step([90, 180, 365], [85, 50, 25, 0])`,
  },
  { name: 'Дата регистрации', output: true, expr: `[prev_risks.registrationDate] | max` },

  { name: 'nalogDate', output: false, expr: `nalogDate < registrationDate ? 100 : 0` },
  { name: 'Дата постановки на налоговый учёт', output: true, expr: `[prev_risks.nalogDate] | max` },

  {
    name: 'principalOkved_needLicense',
    output: false,
    expr: `principalOkved.needLicense && (totalLicensesCount ?? 0) == 0 ? 100 : 0`,
  },
  {
    name: 'principalOkved_possiblyNeedLicense',
    output: false,
    expr: `principalOkved.possiblyNeedLicense && (totalLicensesCount ?? 0) == 0 ? 100 : 0`,
  },
  {
    name: 'Соответствие деятельности',
    output: true,
    expr: `[prev_risks.principalOkved_needLicense, prev_risks.principalOkved_possiblyNeedLicense] | max`,
  },

  {
    name: 'heads_changeDate',
    output: false,
    expr: `(days_since((ul.heads ?? [])[0].changeDate) ?? 99999) <= 90 || (days_since(ul.legalName.changeDate) ?? 99999) <= 90 ? 25 : 0`,
  },
  {
    name: 'buhReporting',
    output: false,
    expr: `[
  (buhReporting.profitOnTheEndOfLastReportTerm ?? 0) < 0 ? 1 : 0,
  (buhReporting.revenueOnTheEndOfLastReportTerm ?? 0) < (buhReporting.revenueOnTheBeginingOfLastReportTerm ?? 0) * 0.5 ? 1 : 0
] | sum | step([1, 2], [0, 50, 70])`,
  },
  {
    name: 'bankruptcyArbitrationsCount',
    output: false,
    expr: `bankruptcyArbitrationsCount | step([1, 2, 4], [0, 25, 70, 85])`,
  },
  {
    name: 'fssp_open_sum',
    output: false,
    expr: `(buhReporting.revenueOnTheEndOfLastReportTerm ?? 0) > 0
  ? fssp.open.sum * 100 / to_f(buhReporting.revenueOnTheEndOfLastReportTerm) | step([0.001, 3, 10], [0, 25, 50, 70])
  : 0`,
  },
  { name: 'fssp_open_count', output: false, expr: `fssp.open.count | step([1, 2, 4], [0, 25, 50, 70])` },
  {
    name: 'Деловая репутация',
    output: true,
    expr: `[
  prev_risks.heads_changeDate,
  prev_risks.buhReporting,
  prev_risks.bankruptcyArbitrationsCount,
  prev_risks.fssp_open_sum,
  prev_risks.fssp_open_count
] | max`,
  },

  {
    name: 'ulBeneficials',
    output: false,
    expr: `len(ul.ulBeneficials.ulFlBeneficials) + len(ul.ulBeneficials.ulUlBeneficials) + len(ul.ulBeneficials.ulForeignBeneficials) == 0 ? 70 : 0`,
  },
  { name: 'Санкции бенефициаров', output: true, expr: `[prev_risks.ulBeneficials] | max` },
]

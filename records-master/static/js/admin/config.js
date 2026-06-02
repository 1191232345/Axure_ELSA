window.AdminConfig = window.AdminConfig || {};
window.AdminConfig.api = window.AdminConfig.api || {};

Object.assign(window.AdminConfig.api, {
  employees: '/api/employees',
  ratingItems: '/api/rating-items',
  relations: '/api/employee-rating-relations',
  evaluationResults: '/api/evaluation-results',
  batchSubmit: '/api/evaluation-results/batch',
  departments: '/api/departments',
  sources: '/api/sources',
});
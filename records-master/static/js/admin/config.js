window.AdminConfig = window.AdminConfig || {};
window.AdminConfig.api = window.AdminConfig.api || {};
window.AdminConfig.toast = window.AdminConfig.toast || {};

Object.assign(window.AdminConfig.api, {
  employees: '/api/employees',
  ratingItems: '/api/rating-items',
  relations: '/api/employee-rating-relations',
  evaluationResults: '/api/evaluation-results',
  batchSubmit: '/api/evaluation-results/batch',
  departments: '/api/departments',
  sources: '/api/sources',
  batchDeleteEmployees: '/api/employees/batch-delete',
  batchDeleteDepartments: '/api/departments/batch-delete',
  batchDeleteRatingItems: '/api/rating-items/batch-delete',
  batchImportEmployees: '/api/employees/batch-import',
  batchImportRatingItems: '/api/rating-items/batch-import',
  deleteEmployeesByFilter: '/api/employees/delete-by-filter',
  deleteDepartmentsByFilter: '/api/departments/delete-by-filter',
  deleteRatingItemsByFilter: '/api/rating-items/delete-by-filter',
  clearEvaluationResults: '/api/evaluation-results/clear',
});

Object.assign(window.AdminConfig.toast, {
  duration: 3000
});
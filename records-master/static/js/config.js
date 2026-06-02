window.AppConfig = {
  colors: {
    primary: '#165DFF',
    secondary: '#FF7D00',
    danger: '#F53F3F',
    neutral: {
      100: '#F5F7FA',
      200: '#E5E6EB',
      300: '#C9CDD4',
      400: '#86909C',
      500: '#4E5969',
      600: '#272E3B',
      700: '#1D2129',
    }
  },
  api: {
    employees: '/api/employees',
    ratingItems: '/api/rating-items',
    relations: '/api/employee-rating-relations',
    evaluationResults: '/api/evaluation-results',
    batchSubmit: '/api/evaluation-results/batch',
    departments: '/api/departments',
  },
  rating: {
    min: 0,
    max: 10,
    step: 0.5,
    lowScoreThreshold: 5,
    defaultValue: 0,
  },
  toast: {
    duration: 3000,
  },
  dialog: {
    transitionDuration: 300,
  },
};

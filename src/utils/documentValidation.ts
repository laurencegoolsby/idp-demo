export interface ValidationField {
  key: string;
  displayName: string;
  path: string[];
}

export interface ValidationResult {
  isValid: boolean;
  foundFields: ValidationField[];
  missingFields: ValidationField[];
}

export const VALIDATION_FIELDS: ValidationField[] = [
  {
    key: 'employerName',
    displayName: 'Employer Name',
    path: ['inference_result', 'employer_info', 'employer_name']
  },
  {
    key: 'ein',
    displayName: 'EIN',
    path: ['inference_result', 'employer_info', 'ein']
  },
  {
    key: 'ssn',
    displayName: 'SSN',
    path: ['inference_result', 'employee_general_info', 'ssn']
  },
  {
    key: 'employeeLastName',
    displayName: 'Employee Last Name',
    path: ['inference_result', 'employee_general_info', 'employee_last_name']
  }
];

function getNestedValue(obj: any, path: string[]): string | undefined {
  return path.reduce((current, key) => current?.[key], obj);
}

function isValidField(value: string | undefined): boolean {
  return value !== undefined && value !== null && value.trim() !== '';
}

export function validateDocument(data: any): ValidationResult {
  const foundFields: ValidationField[] = [];
  const missingFields: ValidationField[] = [];

  VALIDATION_FIELDS.forEach(field => {
    const value = getNestedValue(data, field.path);
    if (isValidField(value)) {
      foundFields.push(field);
    } else {
      missingFields.push(field);
    }
  });

  return {
    isValid: missingFields.length === 0,
    foundFields,
    missingFields
  };
}
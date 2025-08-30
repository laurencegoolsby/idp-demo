import { ValidationResult } from '../utils/documentValidation';

interface ValidationBoxProps {
  validation: ValidationResult;
  fileName: string;
}

export default function ValidationBox({ validation, fileName }: ValidationBoxProps) {
  const { isValid, foundFields, missingFields } = validation;
  const fieldsToShow = isValid ? foundFields : missingFields;

  return (
    <div className={`validation-box ${isValid ? 'success' : 'warning'}`}>
      <div className="validation-content">
        <div className="validation-icon">
          <span>{isValid ? '✓' : '!'}</span>
        </div>
        <div className="validation-text">
          <h4 className="validation-title">
            {isValid ? 'Required Information Found' : 'Missing Required Information'}
          </h4>
          <p className="validation-description">
            {isValid 
              ? `We successfully found the following data elements in ${fileName}:`
              : `We were unable to find the following data elements in ${fileName}:`
            }
          </p>
          <ul className="validation-items-list">
            {fieldsToShow.map(field => (
              <li key={field.key} className="validation-item">
                {field.displayName}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
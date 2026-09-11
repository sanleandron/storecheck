import type { AuditAnswer, ChecklistQuestion } from '../types';

interface QuestionFieldProps {
  question: ChecklistQuestion;
  value: AuditAnswer | undefined;
  onChange: (answer: AuditAnswer) => void;
}

export function QuestionField({ question, value, onChange }: QuestionFieldProps) {
  const val = value?.value;

  const setValue = (v: string | number | string[] | null) => {
    onChange({ questionId: question.id, value: v, unit: question.unit });
  };

  const renderInput = () => {
    switch (question.type) {
      case 'text':
        return (
          <input
            type="text"
            className="input-control"
            value={(val as string) ?? ''}
            onChange={(e) => setValue(e.target.value)}
            placeholder={question.help}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            className="input-control"
            value={(val as number) ?? ''}
            min={question.min}
            max={question.max}
            onChange={(e) =>
              setValue(e.target.value === '' ? null : Number(e.target.value))
            }
          />
        );
      case 'percent':
        return (
          <div>
            <input
              type="range"
              style={{ width: '100%', accentColor: 'var(--accent-orange)' }}
              min={question.min ?? 0}
              max={question.max ?? 100}
              step={5}
              value={(val as number) ?? 0}
              onChange={(e) => setValue(Number(e.target.value))}
            />
            <div style={{ textAlign: 'right', fontSize: 12, fontWeight: 'bold', color: 'var(--primary-mid)' }}>
              {val ?? 0}%
            </div>
          </div>
        );
      case 'select':
      case 'multi': {
        const isMulti = question.type === 'multi';
        const selected: string[] = isMulti ? (Array.isArray(val) ? val : []) : [];
        const current: string = isMulti ? '' : (typeof val === 'string' ? val : '');
        return (
          <div className="options-grid">
            {question.options?.map((opt) => {
              const checked = isMulti ? selected.includes(opt.value) : current === opt.value;
              const toggle = () => {
                if (isMulti) {
                  const next = checked
                    ? selected.filter((s) => s !== opt.value)
                    : [...selected, opt.value];
                  setValue(next);
                } else {
                  setValue(opt.value);
                }
              };
              return (
                <div className="option-pill" key={opt.value}>
                  <input
                    type={isMulti ? 'checkbox' : 'radio'}
                    id={`${question.id}-${opt.value}`}
                    checked={checked}
                    onChange={toggle}
                  />
                  <label htmlFor={`${question.id}-${opt.value}`}>{opt.label}</label>
                </div>
              );
            })}
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="input-group">
      <label>
        {question.label}
        {question.required && <span className="required-mark"> *</span>}
        {question.unit && <span style={{ color: 'var(--grey-dark)' }}> ({question.unit})</span>}
      </label>
      {renderInput()}
      {question.help && question.type === 'text' && (
        <div style={{ fontSize: 11, color: 'var(--grey-dark)', marginTop: 4 }}>{question.help}</div>
      )}
    </div>
  );
}

import type { ReactNode } from 'react';
import { Select } from 'antd';
import type { FormSelectOption } from './FormSelect';
import { FormLabel } from './FormLabel';
import styles from './forms.module.css';

export interface FormMultiSelectProps {
  label?: string;
  hint?: string;
  error?: string;
  options: FormSelectOption[];
  value: string[];
  placeholder?: string;
  id?: string;
  className?: string;
  disabled?: boolean;
  onChange: (values: string[]) => void;
}

export function FormMultiSelect({
  label,
  hint,
  error,
  options,
  value,
  placeholder,
  id,
  className,
  disabled,
  onChange,
}: FormMultiSelectProps) {
  const selectId =
    id ?? (label ? `multiselect-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);

  const select = (
    <Select
      id={selectId}
      mode="multiple"
      allowClear
      showSearch
      optionFilterProp="label"
      disabled={disabled}
      placeholder={placeholder}
      value={value}
      options={options.map((opt) => ({
        value: opt.value,
        label: opt.label,
        disabled: opt.disabled,
      }))}
      onChange={(next) => onChange(next as string[])}
      className={[
        styles.formMultiSelect,
        error ? styles.formInputError : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      classNames={{ popup: { root: styles.formMultiSelectDropdown } }}
      aria-invalid={error ? true : undefined}
      status={error ? 'error' : undefined}
    />
  );

  if (!label) return select;

  return (
    <div className={styles.formField}>
      <FormLabel htmlFor={selectId}>{label as ReactNode}</FormLabel>
      {select}
      {error && <span className={styles.formError}>{error}</span>}
      {!error && hint && <span className={styles.formHint}>{hint}</span>}
    </div>
  );
}

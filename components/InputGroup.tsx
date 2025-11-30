import React from 'react';

interface InputGroupProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  helperText?: string;
}

export const InputGroup: React.FC<InputGroupProps> = ({
  label,
  value,
  onChange,
  prefix,
  suffix,
  min = 0,
  max,
  step = 1,
  helperText
}) => {
  return (
    <div className="flex flex-col space-y-1.5">
      <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex justify-between">
        {label}
        {helperText && <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">{helperText}</span>}
      </label>
      <div className="relative rounded-md shadow-sm">
        {prefix && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="text-slate-600 dark:text-slate-400 sm:text-sm font-medium">{prefix}</span>
          </div>
        )}
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className={`block w-full rounded-md border-0 py-2.5 text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 font-medium shadow-sm transition-colors ${
            prefix ? 'pl-12' : 'pl-3'
          } ${suffix ? 'pr-8' : 'pr-3'}`}
        />
        {suffix && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="text-slate-500 dark:text-slate-400 sm:text-sm font-medium">{suffix}</span>
          </div>
        )}
      </div>
    </div>
  );
};
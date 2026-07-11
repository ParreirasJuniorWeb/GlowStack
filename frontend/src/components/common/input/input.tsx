import { forwardRef } from 'react';
import type { InputHTMLAttributes, LabelHTMLAttributes } from 'react';

interface InputProps {
  labelProps?: LabelHTMLAttributes<HTMLLabelElement>;
  labelText?: string;
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
  classNameContainer?: string;
  classNameLabel?: string;
  classNameInput?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      labelProps = {},
      labelText,
      inputProps = {},
      classNameContainer = '',
      classNameLabel = '',
      classNameInput = '',
    },
    ref,
  ) => {
    const { className: labelPropsClassName, ...restLabelProps } = labelProps;
    const { className: inputPropsClassName, ...restInputProps } = inputProps;

    const labelClassName = [
      'text-slate-700 font-bold text-md mt-4 w-full mr-3 py-5',
      classNameLabel,
      labelPropsClassName,
    ]
      .filter(Boolean)
      .join(' ');

    const inputClassName = [
      'bg-white mt-2 border-b h-9 outline-0 px-2 mb-3 w-full',
      classNameInput,
      inputPropsClassName,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={classNameContainer || undefined}>
        {labelText ? (
          <label {...restLabelProps} className={labelClassName}>
            {labelText}
          </label>
        ) : null}
        <input ref={ref} className={inputClassName} {...restInputProps} />
      </div>
    );
  },
);

export default Input;

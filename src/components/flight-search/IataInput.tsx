import { AirportAutocomplete } from "./AirportAutocomplete";

interface IataInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

export function IataInput({
  value,
  onChange,
  placeholder = "Airport code",
  label,
  className,
  required = false,
  error,
  disabled = false,
}: IataInputProps) {
  return (
    <AirportAutocomplete
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      label={label}
      className={className}
      required={required}
      error={error}
      disabled={disabled}
    />
  );
}

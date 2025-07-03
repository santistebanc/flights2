import { AirportAutocomplete } from "./AirportAutocomplete";

interface IataInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  otherAirportValue?: string; // For checking duplicate airports
}

export function IataInput({
  value,
  onChange,
  placeholder = "Airport code",
  className,
  required = false,
  error,
  disabled = false,
  otherAirportValue,
}: IataInputProps) {
  return (
    <AirportAutocomplete
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      required={required}
      error={error}
      disabled={disabled}
      otherAirportValue={otherAirportValue}
    />
  );
}

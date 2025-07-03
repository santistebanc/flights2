import { useState, useEffect, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface ValidationState {
  isValid: boolean;
  errors: {
    from?: string;
    to?: string;
    outboundDate?: string;
    inboundDate?: string;
    general?: string;
  };
}

interface ValidationParams {
  from: string;
  to: string;
  outboundDate: string;
  inboundDate: string;
  isRoundTrip: boolean;
}

export function useFlightSearchValidation(
  params: ValidationParams
): ValidationState {
  const [validationState, setValidationState] = useState<ValidationState>({
    isValid: false,
    errors: {},
  });

  // Check if IATA codes are valid format
  const isValidIataCode = (code: string): boolean => {
    return /^[A-Z]{3}$/.test(code);
  };

  // Check if departure airport exists
  const departureAirport = useQuery(
    api.airports.getAirportByIata,
    params.from.length === 3 && isValidIataCode(params.from)
      ? { iataCode: params.from }
      : "skip"
  );

  // Check if arrival airport exists
  const arrivalAirport = useQuery(
    api.airports.getAirportByIata,
    params.to.length === 3 && isValidIataCode(params.to)
      ? { iataCode: params.to }
      : "skip"
  );

  // Memoize the validation params to prevent unnecessary re-renders
  const memoizedParams = useMemo(
    () => ({
      from: params.from,
      to: params.to,
      outboundDate: params.outboundDate,
      inboundDate: params.inboundDate,
      isRoundTrip: params.isRoundTrip,
    }),
    [
      params.from,
      params.to,
      params.outboundDate,
      params.inboundDate,
      params.isRoundTrip,
    ]
  );

  // Memoize the airport data to prevent unnecessary re-renders
  const departureAirportId = departureAirport?._id;
  const arrivalAirportId = arrivalAirport?._id;

  // Validate dates
  const validateDates = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const outboundDate = new Date(params.outboundDate);
    const inboundDate = params.inboundDate
      ? new Date(params.inboundDate)
      : null;

    const errors: ValidationState["errors"] = {};

    // Check outbound date
    if (outboundDate < today) {
      errors.outboundDate = "Departure date cannot be in the past";
    }

    // Check inbound date for round trips
    if (params.isRoundTrip) {
      if (!params.inboundDate) {
        errors.inboundDate = "Return date is required for round trips";
      } else if (inboundDate && inboundDate < outboundDate) {
        errors.inboundDate = "Return date must be after departure date";
      }
    }

    return errors;
  };

  // Main validation effect
  useEffect(() => {
    const errors: ValidationState["errors"] = {};

    // Validate departure airport
    if (params.from.length > 0) {
      if (!isValidIataCode(params.from)) {
        errors.from = "Invalid IATA code format";
      } else if (departureAirport === null) {
        errors.from = "Airport not found";
      }
    }

    // Validate arrival airport
    if (params.to.length > 0) {
      if (!isValidIataCode(params.to)) {
        errors.to = "Invalid IATA code format";
      } else if (arrivalAirport === null) {
        errors.to = "Airport not found";
      }
    }

    // Check for duplicate airports
    if (params.from && params.to && params.from === params.to) {
      errors.general = "Departure and arrival airports must be different";
    }

    // Validate dates
    const dateErrors = validateDates();
    Object.assign(errors, dateErrors);

    // Check required fields
    if (!params.from) {
      errors.from = "Departure airport is required";
    }
    if (!params.to) {
      errors.to = "Arrival airport is required";
    }
    if (!params.outboundDate) {
      errors.outboundDate = "Departure date is required";
    }

    // Determine overall validity
    const isValid = Object.keys(errors).length === 0;

    setValidationState({ isValid, errors });
  }, [memoizedParams, departureAirportId, arrivalAirportId]);

  return validationState;
}

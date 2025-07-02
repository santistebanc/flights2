/* eslint-disable max-lines */
"use client";

import { type FC, useState, useEffect, useRef, JSX } from "react";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Calendar } from "./calendar";
import DateInput from "./date-input";
import { Label } from "./label";
import { Switch } from "./switch";
import { ChevronUpIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import { cn } from "@/utils";

export interface DateRangePickerProps {
  /** Click handler for applying the updates from DateRangePicker. */
  onUpdate?: (values: { range: DateRange; isRoundTrip: boolean }) => void;
  /** Initial value for start date */
  initialDateFrom?: Date | string;
  /** Initial value for end date */
  initialDateTo?: Date | string;
  /** Initial value for round trip mode */
  initialRoundTrip?: boolean;
}

const formatDate = (date: Date, locale: string = "en-us"): string => {
  return date.toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getDateAdjustedForTimezone = (dateInput: Date | string): Date => {
  if (typeof dateInput === "string") {
    // Split the date string to get year, month, and day parts
    const parts = dateInput.split("-").map((part) => parseInt(part, 10));
    // Create a new Date object using the local timezone
    // Note: Month is 0-indexed, so subtract 1 from the month part
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    return date;
  } else {
    // If dateInput is already a Date object, return it directly
    return dateInput;
  }
};

// Helper function to get the start of today (midnight)
const getStartOfToday = (): Date => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

// Helper function to check if a date is in the past (before today)
const isDateInPast = (date: Date): boolean => {
  const startOfToday = getStartOfToday();
  return date < startOfToday;
};

interface DateRange {
  from: Date;
  to: Date | undefined;
}

/** The DateRangePicker component allows a user to select a range of dates */
export const DateRangePicker: FC<DateRangePickerProps> & {
  filePath: string;
} = ({
  initialDateFrom = new Date(new Date().setHours(0, 0, 0, 0)),
  initialDateTo,
  onUpdate,
  initialRoundTrip = false,
}): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRoundTrip, setIsRoundTrip] = useState(initialRoundTrip);

  // Ensure initial dates are not in the past
  const getValidInitialDate = (date: Date | string | undefined): Date => {
    // Treat empty strings as undefined to default to today
    const validDate = date && date !== "" ? date : undefined;
    const adjustedDate = validDate
      ? getDateAdjustedForTimezone(validDate)
      : getStartOfToday();
    return isDateInPast(adjustedDate) ? getStartOfToday() : adjustedDate;
  };

  const [range, setRange] = useState<DateRange>({
    from: getValidInitialDate(initialDateFrom),
    to:
      isRoundTrip && initialDateTo
        ? getValidInitialDate(initialDateTo)
        : undefined,
  });

  const [isSmallScreen, setIsSmallScreen] = useState(
    typeof window !== "undefined" ? window.innerWidth < 960 : false
  );

  useEffect(() => {
    const handleResize = (): void => {
      setIsSmallScreen(window.innerWidth < 960);
    };

    window.addEventListener("resize", handleResize);

    // Clean up event listener on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Auto-update when range or round trip mode changes
  useEffect(() => {
    onUpdate?.({ range, isRoundTrip });
  }, [range, isRoundTrip]);

  // Function to handle date changes with validation
  const handleDateChange = (date: Date, isFromDate: boolean) => {
    const startOfToday = getStartOfToday();

    // If the date is in the past, use today instead
    const validDate = isDateInPast(date) ? startOfToday : date;

    if (isFromDate) {
      const toDate =
        range.to == null || validDate > range.to ? validDate : range.to;
      setRange((prevRange) => ({
        ...prevRange,
        from: validDate,
        to: toDate,
      }));
    } else {
      const fromDate = validDate < range.from ? validDate : range.from;
      setRange((prevRange) => ({
        ...prevRange,
        from: fromDate,
        to: validDate,
      }));
    }
  };

  return (
    <Popover
      modal={true}
      open={isOpen}
      onOpenChange={(open: boolean) => {
        setIsOpen(open);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          size={"lg"}
          variant="outline"
          className="border-gray-600 bg-gray-700 text-white hover:bg-gray-600 hover:border-gray-500 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
        >
          <div className="text-right">
            <div className="py-1">
              <div>{`${formatDate(range.from)}${
                isRoundTrip && range.to != null
                  ? " - " + formatDate(range.to)
                  : ""
              }`}</div>
            </div>
          </div>
          <div className="pl-1 opacity-60 -mr-2 scale-125 text-gray-400">
            {isOpen ? (
              <ChevronUpIcon width={24} />
            ) : (
              <ChevronDownIcon width={24} />
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto bg-gray-800 border-gray-600 text-white shadow-lg">
        <div className="flex py-2">
          <div className="flex">
            <div className="flex flex-col">
              <div className="flex flex-col lg:flex-row gap-2 px-3 justify-start items-center lg:items-start pb-4 lg:pb-0">
                <div className="flex items-center space-x-2 py-1">
                  <Switch
                    checked={isRoundTrip}
                    onCheckedChange={(checked: boolean) => {
                      setIsRoundTrip(checked);
                      if (checked) {
                        // When switching to round trip, set the return date to the same as departure if not already set
                        setRange((prev) => ({
                          ...prev,
                          to: prev.to || prev.from,
                        }));
                      } else {
                        // When switching to one-way, clear the return date
                        setRange((prev) => ({
                          ...prev,
                          to: undefined,
                        }));
                      }
                    }}
                    id="round-trip-mode"
                  />
                  <Label htmlFor="round-trip-mode" className="text-gray-300">
                    Round Trip
                  </Label>
                </div>
                <div className="flex flex-col gap-2 ml-auto">
                  <div className="flex gap-2">
                    <DateInput
                      value={range.from}
                      onChange={(date: Date) => {
                        handleDateChange(date, true);
                      }}
                    />
                    {isRoundTrip && (
                      <>
                        <div className="py-1 text-gray-400">-</div>
                        <DateInput
                          value={range.to}
                          onChange={(date: Date) => {
                            handleDateChange(date, false);
                          }}
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div>
                {isRoundTrip ? (
                  <Calendar
                    mode="range"
                    onSelect={(
                      value: { from?: Date; to?: Date } | undefined
                    ) => {
                      if (value?.from != null) {
                        const validFrom = isDateInPast(value.from)
                          ? getStartOfToday()
                          : value.from;
                        const validTo =
                          value.to && isDateInPast(value.to)
                            ? getStartOfToday()
                            : value.to;
                        setRange({ from: validFrom, to: validTo });
                      }
                    }}
                    selected={range}
                    numberOfMonths={isSmallScreen ? 1 : 2}
                    defaultMonth={
                      new Date(
                        new Date().setMonth(
                          new Date().getMonth() - (isSmallScreen ? 0 : 1)
                        )
                      )
                    }
                    className="bg-gray-800 text-white"
                    disabled={(date) => isDateInPast(date)}
                  />
                ) : (
                  <Calendar
                    mode="single"
                    onSelect={(value: Date | undefined) => {
                      if (value) {
                        const validDate = isDateInPast(value)
                          ? getStartOfToday()
                          : value;
                        setRange({ from: validDate, to: undefined });
                      }
                    }}
                    selected={range.from}
                    numberOfMonths={isSmallScreen ? 1 : 2}
                    defaultMonth={
                      new Date(
                        new Date().setMonth(
                          new Date().getMonth() - (isSmallScreen ? 0 : 1)
                        )
                      )
                    }
                    className="bg-gray-800 text-white"
                    disabled={(date) => isDateInPast(date)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 py-2 pr-4 border-t border-gray-600">
          <Button
            onClick={() => {
              setIsOpen(false);
            }}
            className="bg-yellow-400 text-black hover:bg-yellow-500"
          >
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

DateRangePicker.displayName = "DateRangePicker";
DateRangePicker.filePath =
  "libs/shared/ui-kit/src/lib/date-range-picker/date-range-picker.tsx";

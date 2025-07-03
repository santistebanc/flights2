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

export interface DateRangePickerProps {
  /** Click handler for applying the updates from DateRangePicker. */
  onUpdate?: (values: { range: DateRange; isRoundTrip: boolean }) => void;
  /** Current value for start date */
  dateFrom: Date | string;
  /** Current value for end date */
  dateTo?: Date | string;
  /** Current value for round trip mode */
  isRoundTrip: boolean;
}

const formatDate = (date: Date, locale: string = "en-us"): string => {
  // Always day first, then month, then year
  const day = date.getDate();
  const year = date.getFullYear();
  // Use locale for month name
  const month = date.toLocaleString(locale, { month: "short" });
  return `${day} ${month} ${year}`;
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
} = ({ dateFrom, dateTo, onUpdate, isRoundTrip }): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);

  // Ensure dates are not in the past
  const getValidDate = (date: Date | string | undefined): Date => {
    // Treat empty strings as undefined to default to today
    const validDate = date && date !== "" ? date : undefined;
    const adjustedDate = validDate
      ? getDateAdjustedForTimezone(validDate)
      : getStartOfToday();
    return isDateInPast(adjustedDate) ? getStartOfToday() : adjustedDate;
  };

  // Convert props to internal range format
  const range: DateRange = {
    from: getValidDate(dateFrom),
    to: isRoundTrip && dateTo ? getValidDate(dateTo) : undefined,
  };

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

  // Add refs for manual date inputs
  const fromInputRef = useRef<HTMLInputElement>(null);
  const toInputRef = useRef<HTMLInputElement>(null);

  // Helper to blur focused date input if it's one of ours
  const handlePopoverMouseDown = () => {
    const active = document.activeElement as HTMLElement | null;
    if (fromInputRef.current && active === fromInputRef.current) {
      fromInputRef.current.blur();
    } else if (toInputRef.current && active === toInputRef.current) {
      toInputRef.current.blur();
    }
  };

  // Function to handle date changes with validation
  const handleDateChange = (date: Date, isFromDate: boolean) => {
    const startOfToday = getStartOfToday();

    // If the date is in the past, use today instead
    const validDate = isDateInPast(date) ? startOfToday : date;

    if (isFromDate) {
      const toDate =
        range.to == null || validDate > range.to ? validDate : range.to;
      onUpdate?.({
        range: { from: validDate, to: toDate },
        isRoundTrip,
      });
    } else {
      const fromDate = validDate < range.from ? validDate : range.from;
      onUpdate?.({
        range: { from: fromDate, to: validDate },
        isRoundTrip,
      });
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
          variant="outline"
          className="border-gray-600 bg-gray-700 text-white hover:bg-gray-600 hover:border-gray-500 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 min-w-[280px]"
        >
          <div className="text-right flex-1">
            <div className="py-1">
              <div className="whitespace-nowrap">{`${formatDate(range.from)}${
                isRoundTrip && range.to != null
                  ? " - " + formatDate(range.to)
                  : ""
              }`}</div>
            </div>
          </div>
          <div className="pl-1 opacity-60 -mr-2 scale-125 text-gray-400 flex-shrink-0">
            {isOpen ? (
              <ChevronUpIcon width={24} />
            ) : (
              <ChevronDownIcon width={24} />
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto bg-gray-800 border-gray-600 text-white shadow-lg"
        onMouseDown={handlePopoverMouseDown}
      >
        <div className="flex py-2">
          <div className="flex">
            <div className="flex flex-col">
              <div className="flex flex-col lg:flex-row gap-2 px-3 justify-start items-center lg:items-start pb-4 lg:pb-0">
                <div className="flex items-center space-x-2 py-1">
                  <Switch
                    checked={isRoundTrip}
                    onCheckedChange={(checked: boolean) => {
                      if (checked) {
                        // When switching to round trip, set the return date to the same as departure if not already set
                        onUpdate?.({
                          range: {
                            from: range.from,
                            to: range.to || range.from,
                          },
                          isRoundTrip: checked,
                        });
                      } else {
                        // When switching to one-way, clear the return date
                        onUpdate?.({
                          range: { from: range.from, to: undefined },
                          isRoundTrip: checked,
                        });
                      }
                    }}
                    id="round-trip-mode"
                    className="data-[state=checked]:bg-yellow-400 data-[state=unchecked]:bg-gray-600"
                  />
                  <Label htmlFor="round-trip-mode" className="text-gray-300">
                    Round Trip
                  </Label>
                </div>
                <div className="flex flex-col gap-2 ml-auto">
                  <div className="flex gap-2">
                    <DateInput
                      ref={fromInputRef}
                      value={range.from}
                      onChange={(date: Date) => {
                        handleDateChange(date, true);
                      }}
                    />
                    {isRoundTrip && (
                      <>
                        <div className="py-1 text-gray-400">-</div>
                        <DateInput
                          ref={toInputRef}
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
                        onUpdate?.({
                          range: { from: validFrom, to: validTo },
                          isRoundTrip,
                        });
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
                        onUpdate?.({
                          range: { from: validDate, to: undefined },
                          isRoundTrip,
                        });
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

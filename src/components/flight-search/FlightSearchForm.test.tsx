import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FlightSearchForm, FlightSearchParams } from "./FlightSearchForm";

// Mock the IataInput component
jest.mock("./IataInput", () => ({
  IataInput: ({ value, onChange, label, error, placeholder }: any) => (
    <div>
      <label htmlFor={label?.toLowerCase().replace(/\s+/g, "-")}>{label}</label>
      <input
        id={label?.toLowerCase().replace(/\s+/g, "-")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        data-testid={`input-${label?.toLowerCase().replace(/\s+/g, "-")}`}
      />
      {error && <span className="error">{error}</span>}
    </div>
  ),
}));

// Mock the DateRangePicker component
jest.mock("../ui/date-range-picker", () => ({
  DateRangePicker: ({ onUpdate, dateFrom, dateTo, isRoundTrip }: any) => (
    <div data-testid="date-range-picker">
      <button
        onClick={() =>
          onUpdate({
            range: {
              from: new Date("2024-01-15"),
              to: isRoundTrip ? new Date("2024-01-20") : undefined,
            },
            isRoundTrip: !isRoundTrip,
          })
        }
        data-testid="toggle-round-trip"
      >
        Toggle Round Trip
      </button>
      <span data-testid="date-from">{dateFrom?.toISOString()}</span>
      <span data-testid="date-to">{dateTo?.toISOString()}</span>
      <span data-testid="is-round-trip">{isRoundTrip.toString()}</span>
    </div>
  ),
}));

describe("FlightSearchForm", () => {
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    mockOnSearch.mockClear();
  });

  it("renders all form elements", () => {
    render(<FlightSearchForm onSearch={mockOnSearch} />);

    expect(screen.getByText("Departure Airport")).toBeInTheDocument();
    expect(screen.getByText("Arrival Airport")).toBeInTheDocument();
    expect(screen.getByText("Travel Dates")).toBeInTheDocument();
    expect(screen.getByText("Search Flights")).toBeInTheDocument();
  });

  it("shows loading state when isLoading is true", () => {
    render(<FlightSearchForm onSearch={mockOnSearch} isLoading={true} />);

    expect(screen.getByText("Searching...")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("disables search button when form is invalid", () => {
    render(<FlightSearchForm onSearch={mockOnSearch} />);

    const searchButton = screen.getByRole("button");
    expect(searchButton).toBeDisabled();
  });

  it("enables search button when form is valid", async () => {
    render(<FlightSearchForm onSearch={mockOnSearch} />);

    // Fill in valid form data
    const departureInput = screen.getByTestId("input-departure-airport");
    const arrivalInput = screen.getByTestId("input-arrival-airport");

    fireEvent.change(departureInput, { target: { value: "JFK" } });
    fireEvent.change(arrivalInput, { target: { value: "LAX" } });

    // Toggle round trip to set dates
    const toggleButton = screen.getByTestId("toggle-round-trip");
    fireEvent.click(toggleButton);

    await waitFor(() => {
      const searchButton = screen.getByRole("button");
      expect(searchButton).not.toBeDisabled();
    });
  });

  it("validates IATA codes", async () => {
    render(<FlightSearchForm onSearch={mockOnSearch} />);

    const departureInput = screen.getByTestId("input-departure-airport");
    const arrivalInput = screen.getByTestId("input-arrival-airport");

    // Test invalid IATA codes
    fireEvent.change(departureInput, { target: { value: "INVALID" } });
    fireEvent.change(arrivalInput, { target: { value: "123" } });

    const searchButton = screen.getByRole("button");
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(
        screen.getByText("Please enter a valid 3-letter airport code")
      ).toBeInTheDocument();
    });
  });

  it("prevents duplicate airports", async () => {
    render(<FlightSearchForm onSearch={mockOnSearch} />);

    const departureInput = screen.getByTestId("input-departure-airport");
    const arrivalInput = screen.getByTestId("input-arrival-airport");

    // Set same airport for both
    fireEvent.change(departureInput, { target: { value: "JFK" } });
    fireEvent.change(arrivalInput, { target: { value: "JFK" } });

    const searchButton = screen.getByRole("button");
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(
        screen.getByText("Departure and arrival airports must be different")
      ).toBeInTheDocument();
    });
  });

  it("calls onSearch with correct parameters when form is valid", async () => {
    render(<FlightSearchForm onSearch={mockOnSearch} />);

    // Fill in valid form data
    const departureInput = screen.getByTestId("input-departure-airport");
    const arrivalInput = screen.getByTestId("input-arrival-airport");

    fireEvent.change(departureInput, { target: { value: "JFK" } });
    fireEvent.change(arrivalInput, { target: { value: "LAX" } });

    // Toggle round trip to set dates
    const toggleButton = screen.getByTestId("toggle-round-trip");
    fireEvent.click(toggleButton);

    // Submit form
    const searchButton = screen.getByRole("button");
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith({
        departureAirport: "JFK",
        arrivalAirport: "LAX",
        departureDate: expect.any(Date),
        returnDate: expect.any(Date),
        isRoundTrip: true,
      });
    });
  });

  it("handles one-way trip correctly", async () => {
    render(<FlightSearchForm onSearch={mockOnSearch} />);

    // Fill in valid form data
    const departureInput = screen.getByTestId("input-departure-airport");
    const arrivalInput = screen.getByTestId("input-arrival-airport");

    fireEvent.change(departureInput, { target: { value: "JFK" } });
    fireEvent.change(arrivalInput, { target: { value: "LAX" } });

    // Submit form (one-way by default)
    const searchButton = screen.getByRole("button");
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith({
        departureAirport: "JFK",
        arrivalAirport: "LAX",
        departureDate: expect.any(Date),
        returnDate: undefined,
        isRoundTrip: false,
      });
    });
  });

  it("clears errors when user starts typing", async () => {
    render(<FlightSearchForm onSearch={mockOnSearch} />);

    const departureInput = screen.getByTestId("input-departure-airport");
    const arrivalInput = screen.getByTestId("input-arrival-airport");

    // Set invalid data and trigger validation
    fireEvent.change(departureInput, { target: { value: "INVALID" } });
    fireEvent.change(arrivalInput, { target: { value: "123" } });

    const searchButton = screen.getByRole("button");
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(
        screen.getByText("Please enter a valid 3-letter airport code")
      ).toBeInTheDocument();
    });

    // Fix the input
    fireEvent.change(departureInput, { target: { value: "JFK" } });

    await waitFor(() => {
      expect(
        screen.queryByText("Please enter a valid 3-letter airport code")
      ).not.toBeInTheDocument();
    });
  });

  it("shows form status message when form is invalid", () => {
    render(<FlightSearchForm onSearch={mockOnSearch} />);

    expect(
      screen.getByText(
        "Please fill in all required fields correctly to search for flights"
      )
    ).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <FlightSearchForm onSearch={mockOnSearch} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });
});

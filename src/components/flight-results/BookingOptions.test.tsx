import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BookingOptions, BookingOption } from "./BookingOptions";

// Mock window.open
const mockOpen = jest.fn();
Object.defineProperty(window, "open", {
  value: mockOpen,
  writable: true,
});

// Mock console.log
const mockConsoleLog = jest.spyOn(console, "log").mockImplementation();

const mockBookingOptions: BookingOption[] = [
  {
    _id: "1",
    agency: "Kiwi.com",
    price: 150.5,
    currency: "EUR",
    linkToBook: "https://kiwi.com/book/1",
    extractedAt: Date.now() - 1000 * 60 * 30, // 30 minutes ago
  },
  {
    _id: "2",
    agency: "Booking.com",
    price: 180.0,
    currency: "EUR",
    linkToBook: "https://booking.com/book/2",
    extractedAt: Date.now() - 1000 * 60 * 60, // 1 hour ago
  },
  {
    _id: "3",
    agency: "Expedia",
    price: 165.75,
    currency: "EUR",
    linkToBook: "https://expedia.com/book/3",
    extractedAt: Date.now() - 1000 * 60 * 15, // 15 minutes ago
  },
  {
    _id: "4",
    agency: "Trip.com",
    price: 200.0,
    currency: "EUR",
    linkToBook: "https://trip.com/book/4",
    extractedAt: Date.now() - 1000 * 60 * 45, // 45 minutes ago
  },
  {
    _id: "5",
    agency: "Skyscanner",
    price: 145.25,
    currency: "EUR",
    linkToBook: "https://skyscanner.com/book/5",
    extractedAt: Date.now() - 1000 * 60 * 5, // 5 minutes ago
  },
];

describe("BookingOptions", () => {
  beforeEach(() => {
    mockOpen.mockClear();
    mockConsoleLog.mockClear();
  });

  it("renders booking options with correct information", () => {
    render(<BookingOptions bookingOptions={mockBookingOptions} />);

    // Check that all booking options are rendered
    expect(screen.getByText("Kiwi.com")).toBeInTheDocument();
    expect(screen.getByText("Booking.com")).toBeInTheDocument();
    expect(screen.getByText("Expedia")).toBeInTheDocument();
    expect(screen.getByText("Trip.com")).toBeInTheDocument();
    expect(screen.getByText("Skyscanner")).toBeInTheDocument();

    // Check prices are displayed
    expect(screen.getByText("EUR 150.50")).toBeInTheDocument();
    expect(screen.getByText("EUR 180.00")).toBeInTheDocument();
    expect(screen.getByText("EUR 165.75")).toBeInTheDocument();
    expect(screen.getByText("EUR 200.00")).toBeInTheDocument();
    expect(screen.getByText("EUR 145.25")).toBeInTheDocument();
  });

  it("displays correct count of booking options", () => {
    render(<BookingOptions bookingOptions={mockBookingOptions} />);

    expect(screen.getByText("5 available")).toBeInTheDocument();
  });

  it("shows best price indicator for lowest price option", () => {
    render(<BookingOptions bookingOptions={mockBookingOptions} />);

    // Skyscanner has the lowest price (145.25)
    const bestPriceBadge = screen.getByText("Best Price");
    expect(bestPriceBadge).toBeInTheDocument();

    // Check that it's associated with the Skyscanner option
    const skyscannerOption = screen.getByText("Skyscanner").closest("div");
    expect(skyscannerOption).toContainElement(bestPriceBadge);
  });

  it("displays price range when multiple options exist", () => {
    render(<BookingOptions bookingOptions={mockBookingOptions} />);

    expect(screen.getByText("Price range:")).toBeInTheDocument();
    expect(screen.getByText("EUR 145.25 - EUR 200.00")).toBeInTheDocument();
  });

  it("shows average price when multiple options exist", () => {
    render(<BookingOptions bookingOptions={mockBookingOptions} />);

    expect(screen.getByText("Avg EUR 168.30")).toBeInTheDocument();
  });

  it("handles empty booking options", () => {
    render(<BookingOptions bookingOptions={[]} />);

    expect(
      screen.getByText("No booking options available")
    ).toBeInTheDocument();
  });

  it("limits visible options by default", () => {
    render(
      <BookingOptions bookingOptions={mockBookingOptions} maxVisible={3} />
    );

    // Should show first 3 options
    expect(screen.getByText("Kiwi.com")).toBeInTheDocument();
    expect(screen.getByText("Booking.com")).toBeInTheDocument();
    expect(screen.getByText("Expedia")).toBeInTheDocument();

    // Should not show the 4th and 5th options initially
    expect(screen.queryByText("Trip.com")).not.toBeInTheDocument();
    expect(screen.queryByText("Skyscanner")).not.toBeInTheDocument();

    // Should show "show more" button
    expect(screen.getByText("Show 2 More Options")).toBeInTheDocument();
  });

  it("expands to show all options when show more is clicked", () => {
    render(
      <BookingOptions bookingOptions={mockBookingOptions} maxVisible={3} />
    );

    // Click show more
    fireEvent.click(screen.getByText("Show 2 More Options"));

    // Should now show all options
    expect(screen.getByText("Trip.com")).toBeInTheDocument();
    expect(screen.getByText("Skyscanner")).toBeInTheDocument();

    // Should show "show less" button
    expect(screen.getByText("Show Less")).toBeInTheDocument();
  });

  it("collapses back when show less is clicked", () => {
    render(
      <BookingOptions bookingOptions={mockBookingOptions} maxVisible={3} />
    );

    // Expand first
    fireEvent.click(screen.getByText("Show 2 More Options"));

    // Then collapse
    fireEvent.click(screen.getByText("Show Less"));

    // Should hide the extra options again
    expect(screen.queryByText("Trip.com")).not.toBeInTheDocument();
    expect(screen.queryByText("Skyscanner")).not.toBeInTheDocument();

    // Should show "show more" button again
    expect(screen.getByText("Show 2 More Options")).toBeInTheDocument();
  });

  it("opens booking link in new tab when book button is clicked", () => {
    render(<BookingOptions bookingOptions={mockBookingOptions} />);

    // Click the first book button
    const bookButtons = screen.getAllByText("Book Now");
    fireEvent.click(bookButtons[0]);

    expect(mockOpen).toHaveBeenCalledWith(
      "https://kiwi.com/book/1",
      "_blank",
      "noopener,noreferrer"
    );
  });

  it("logs booking click information", () => {
    render(<BookingOptions bookingOptions={mockBookingOptions} />);

    // Click the first book button
    const bookButtons = screen.getAllByText("Book Now");
    fireEvent.click(bookButtons[0]);

    expect(mockConsoleLog).toHaveBeenCalledWith(
      "Booking clicked for Kiwi.com: https://kiwi.com/book/1"
    );
  });

  it("sorts options by price (lowest first)", () => {
    render(
      <BookingOptions bookingOptions={mockBookingOptions} showAll={true} />
    );

    // Get all price elements
    const priceElements = screen.getAllByText(/EUR \d+\.\d+/);

    // Check that they are in ascending order
    const prices = priceElements.map((el) =>
      parseFloat(el.textContent!.replace("EUR ", ""))
    );
    expect(prices).toEqual([145.25, 150.5, 165.75, 180.0, 200.0]);
  });

  it("shows position indicators for top 3 options", () => {
    render(
      <BookingOptions bookingOptions={mockBookingOptions} showAll={true} />
    );

    expect(screen.getByText("#1")).toBeInTheDocument();
    expect(screen.getByText("#2")).toBeInTheDocument();
    expect(screen.getByText("#3")).toBeInTheDocument();

    // Should not show position indicators for 4th and 5th options
    expect(screen.queryByText("#4")).not.toBeInTheDocument();
    expect(screen.queryByText("#5")).not.toBeInTheDocument();
  });

  it("formats extraction time correctly", () => {
    const recentOption: BookingOption = {
      _id: "recent",
      agency: "Recent Agency",
      price: 100,
      currency: "EUR",
      linkToBook: "https://example.com",
      extractedAt: Date.now() - 1000 * 60 * 30, // 30 minutes ago
    };

    render(<BookingOptions bookingOptions={[recentOption]} />);

    expect(screen.getByText("Updated 30m ago")).toBeInTheDocument();
  });

  it("applies correct styling for best price option", () => {
    render(<BookingOptions bookingOptions={mockBookingOptions} />);

    // The best price option (Skyscanner) should have green styling
    const skyscannerOption = screen.getByText("Skyscanner").closest("div");
    expect(skyscannerOption).toHaveClass("bg-green-50", "border-green-200");
  });
});

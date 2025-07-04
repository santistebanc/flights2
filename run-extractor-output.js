// Simple script to run the extractor functions and show output
const fs = require('fs');
const path = require('path');

// Read the HTML files
const phase1Html = fs.readFileSync(path.join(__dirname, 'test-data/phase1-kiwi.html'), 'utf8');
const phase2Html = fs.readFileSync(path.join(__dirname, 'test-data/phase2-kiwi.html'), 'utf8');

// Mock the cheerio import since we can't easily run TypeScript
const cheerio = require('cheerio');

// Simple implementation of the extractor functions for demonstration
function extractSessionDataFromPhase1Html(html) {
    const tokenMatch = html.match(/'_token':\s*'([^']+)'/);
    return {
        token: tokenMatch ? tokenMatch[1] : ""
    };
}

function extractFlightsFromPhase2Html(html) {
    const $ = cheerio.load(html);
    const flights = [];

    // Find all _panel_body divs
    $('._panel_body').each((index, element) => {
        const $panel = $(element);
        const $head = $panel.find('._head small');
        const $item = $panel.find('._item');

        if ($head.length && $item.length) {
            const flightNumberMatch = $head.text().match(/([A-Z0-9]+)\s+([A-Z0-9]+)/);
            if (flightNumberMatch) {
                const airlineCode = flightNumberMatch[1];
                const flightNum = flightNumberMatch[2];
                const flightNumber = `${airlineCode}${flightNum}`;

                const times = $item.find('.c3 p').map((i, el) => $(el).text().trim()).get();
                const airports = $item.find('.c4 p').map((i, el) => $(el).text().trim()).get();
                const durationText = $item.find('.c1 p').text().trim();

                if (times.length >= 2 && airports.length >= 2) {
                    const departureTime = times[0];
                    const arrivalTime = times[1];
                    const departureAirport = airports[0].split(' ')[0]; // Extract IATA code
                    const arrivalAirport = airports[1].split(' ')[0]; // Extract IATA code

                    // Parse duration (e.g., "2h 20" -> 140 minutes)
                    const durationMatch = durationText.match(/(\d+)h\s*(\d+)?/);
                    let duration = 0;
                    if (durationMatch) {
                        const hours = parseInt(durationMatch[1]);
                        const minutes = durationMatch[2] ? parseInt(durationMatch[2]) : 0;
                        duration = hours * 60 + minutes;
                    }

                    // Extract date from heading
                    const $heading = $panel.closest('.search_modal').find('._heading').first();
                    const dateMatch = $heading.text().match(/(\w+),\s*(\d+)\s+(\w+)\s+(\d{4})/);
                    let departureDate = "2025-10-10"; // Default fallback
                    if (dateMatch) {
                        const [, , day, month, year] = dateMatch;
                        const monthMap = {
                            Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
                            Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12"
                        };
                        const monthNum = monthMap[month] || "01";
                        const dayNum = day.padStart(2, "0");
                        departureDate = `${year}-${monthNum}-${dayNum}`;
                    }

                    const uniqueId = `flight_${flightNumber}_${departureAirport}_${arrivalAirport}`;

                    flights.push({
                        uniqueId,
                        flightNumber,
                        departureAirportIataCode: departureAirport,
                        arrivalAirportIataCode: arrivalAirport,
                        departureDate,
                        departureTime,
                        duration
                    });
                }
            }
        }
    });

    return flights;
}

function extractBundlesFromPhase2Html(html) {
    const $ = cheerio.load(html);
    const bundles = [];

    // Find all list-item rows
    $('.list-item.row').each((index, element) => {
        const $item = $(element);
        const outboundFlights = [];
        const inboundFlights = [];

        // Extract flight IDs from the modal
        const modalId = $item.find('.modal').attr('id');
        if (modalId) {
            const $modal = $(`#${modalId}`);
            $modal.find('._panel_body').each((i, panel) => {
                const $panel = $(panel);
                const $head = $panel.find('._head small');
                const $item = $panel.find('._item');

                if ($head.length && $item.length) {
                    const flightNumberMatch = $head.text().match(/([A-Z0-9]+)\s+([A-Z0-9]+)/);
                    if (flightNumberMatch) {
                        const airlineCode = flightNumberMatch[1];
                        const flightNum = flightNumberMatch[2];
                        const flightNumber = `${airlineCode}${flightNum}`;

                        const airports = $item.find('.c4 p').map((i, el) => $(el).text().trim()).get();
                        if (airports.length >= 2) {
                            const departureAirport = airports[0].split(' ')[0];
                            const arrivalAirport = airports[1].split(' ')[0];
                            const flightId = `flight_${flightNumber}_${departureAirport}_${arrivalAirport}`;

                            // Determine if outbound or inbound based on heading
                            const $heading = $panel.closest('._panel').prevAll('._heading').first();
                            const headingText = $heading.text();
                            if (headingText.includes('Outbound')) {
                                outboundFlights.push(flightId);
                            } else if (headingText.includes('Return')) {
                                inboundFlights.push(flightId);
                            }
                        }
                    }
                }
            });

            if (outboundFlights.length > 0 || inboundFlights.length > 0) {
                const uniqueId = `bundle_${outboundFlights.join('_')}${inboundFlights.length > 0 ? '_' + inboundFlights.join('_') : ''}`;
                bundles.push({
                    uniqueId,
                    outboundFlightUniqueIds: outboundFlights,
                    inboundFlightUniqueIds: inboundFlights
                });
            }
        }
    });

    return bundles;
}

function extractBookingOptionsFromPhase2Html(html) {
    const $ = cheerio.load(html);
    const bookingOptions = [];

    // Find all list-item rows
    $('.list-item.row').each((index, element) => {
        const $item = $(element);
        const priceText = $item.find('.prices').text().trim();
        const priceMatch = priceText.match(/€(\d+)/);

        if (priceMatch) {
            const price = parseInt(priceMatch[1]);
            const linkElement = $item.find('a[href*="kiwi.com"]').first();
            const linkToBook = linkElement.attr('href') || '';

            // Extract bundle ID
            const bundleId = `bundle_${index}`; // Simplified for demo

            const uniqueId = `booking_${bundleId}_Kiwi.com_${price}_EUR`;

            bookingOptions.push({
                uniqueId,
                targetUniqueId: bundleId,
                agency: "Kiwi.com",
                price,
                linkToBook,
                currency: "EUR",
                extractedAt: new Date().toISOString()
            });
        }
    });

    return bookingOptions;
}

// Run the functions and show output
console.log("=== EXTRACTOR OUTPUT ===");
console.log();

console.log("1. Session Data from Phase 1 HTML:");
const session = extractSessionDataFromPhase1Html(phase1Html);
console.log(JSON.stringify(session, null, 2));
console.log();

console.log("2. Flights from Phase 2 HTML:");
const flights = extractFlightsFromPhase2Html(phase2Html);
console.log(JSON.stringify(flights, null, 2));
console.log();

console.log("3. Bundles from Phase 2 HTML:");
const bundles = extractBundlesFromPhase2Html(phase2Html);
console.log(JSON.stringify(bundles, null, 2));
console.log();

console.log("4. Booking Options from Phase 2 HTML:");
const bookingOptions = extractBookingOptionsFromPhase2Html(phase2Html);
console.log(JSON.stringify(bookingOptions, null, 2));
console.log(); 
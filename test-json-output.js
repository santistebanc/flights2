import { testPhase2Extraction } from './lib/kiwi-html-extractor.js';

// Sample Phase 2 HTML from the test file
const phase2Html = `
<div class="list-item row">
  <div class="modal">
    <div class="search_modal">
      <p class="_heading">Sat, 11 Oct 2025</p>
      <p class="_heading">Sun, 12 Oct 2025</p>
      <div class="_panel">
        <div class="_head">
          <small>AA123</small>
        </div>
        <div class="_item">
          <div>10:30</div>
          <div>JFK</div>
          <div>13:45</div>
          <div>LAX</div>
        </div>
      </div>
      <div class="_panel">
        <div class="_head">
          <small>AA456</small>
        </div>
        <div class="_item">
          <div>15:20</div>
          <div>LAX</div>
          <div>23:35</div>
          <div>JFK</div>
        </div>
      </div>
      <div class="_similar">
        <div class="booking-option" data-agency="Expedia" data-price="450" data-currency="USD" data-link="https://expedia.com/book">
          <span>Expedia</span>
          <span>$450</span>
        </div>
        <div class="booking-option" data-agency="Booking.com" data-price="465" data-currency="USD" data-link="https://booking.com/book">
          <span>Booking.com</span>
          <span>$465</span>
        </div>
      </div>
    </div>
  </div>
</div>
<div class="list-item row">
  <div class="modal">
    <div class="search_modal">
      <p class="_heading">Sat, 11 Oct 2025</p>
      <div class="_panel">
        <div class="_head">
          <small>DL789</small>
        </div>
        <div class="_item">
          <div>08:15</div>
          <div>JFK</div>
          <div>11:30</div>
          <div>LAX</div>
        </div>
      </div>
      <div class="_similar">
        <div class="booking-option" data-agency="Delta" data-price="380" data-currency="USD" data-link="https://delta.com/book">
          <span>Delta</span>
          <span>$380</span>
        </div>
      </div>
    </div>
  </div>
</div>
`;

console.log('=== PHASE 2 KIWI EXTRACTOR JSON OUTPUT ===\n');

try {
    const result = testPhase2Extraction(phase2Html);

    console.log('FLIGHTS:');
    console.log(JSON.stringify(result.flights, null, 2));
    console.log('\nBUNDLES:');
    console.log(JSON.stringify(result.bundles, null, 2));
    console.log('\nBOOKING OPTIONS:');
    console.log(JSON.stringify(result.bookingOptions, null, 2));

    console.log('\n=== DATA TYPE VERIFICATION ===');
    console.log('Flight duration type:', typeof result.flights[0]?.duration);
    console.log('Flight departureDate type:', typeof result.flights[0]?.departureDate);
    console.log('Flight departureTime type:', typeof result.flights[0]?.departureTime);
    console.log('Booking option price type:', typeof result.bookingOptions[0]?.price);

} catch (error) {
    console.error('Error during extraction:', error);
} 
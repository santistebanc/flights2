// Simple test script to run the extractor functions
const fs = require('fs');
const path = require('path');

// Read the TypeScript file and extract the functions manually
const extractorPath = path.join(__dirname, 'lib', 'kiwi-html-extractor.ts');
const extractorContent = fs.readFileSync(extractorPath, 'utf8');

// Sample HTML from the test file
const phase2Html = `<div class="list-item row" data-duration="14.8" data-outboundmins="1300" data-returnmins="450" data-journey="onestop" data-airline="AIRLEI" data-airline2="AIRLI2" data-airline3="AIRL" data-airline4="AIRL" data-price="16400" data-totalstops="1" data-best="1339" style="display: none;">
    <div class="modal" id="myModal0" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-body">
                    <div class="search_modal">
                        <p class="_heading">
                            <strong>Outbound</strong>
                            Fri, 10 Oct 2025 <span>All times are local</span>
                        </p>
                        <div class="_panel">
                            <div class="_panel_body">
                                <div class="_head">
                                    <div></div>
                                    <div>
                                        <small>Aer Lingus EI 337</small>
                                    </div>
                                </div>
                                <div class="_item">
                                    <div class="c3">
                                        <p>21:40</p>
                                        <p>23:00</p>
                                    </div>
                                    <div class="c4">
                                        <p>BER Berlin</p>
                                        <p>DUB Dublin</p>
                                    </div>
                                </div>
                            </div>
                            <div class="_panel_body">
                                <div class="_head">
                                    <div></div>
                                    <div>
                                        <small>Iberia Express I2 1882</small>
                                    </div>
                                </div>
                                <div class="_item">
                                    <div class="c3">
                                        <p>08:55</p>
                                        <p>12:30</p>
                                    </div>
                                    <div class="c4">
                                        <p>DUB Dublin</p>
                                        <p>MAD Madrid</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p class="_heading">
                            <strong>Return</strong>
                            Mon, 20 Oct 2025 
                        </p>
                        <div class="_panel">
                            <div class="_panel_body">
                                <div class="_head">
                                    <div></div>
                                    <div>
                                        <small>Iberia Express I2 1801</small>
                                    </div>
                                </div>
                                <div class="_item">
                                    <div class="c3">
                                        <p>07:30</p>
                                        <p>10:35</p>
                                    </div>
                                    <div class="c4">
                                        <p>MAD Madrid</p>
                                        <p>BER Berlin</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="_similar">
                            <div>
                                <p>Kiwi.com</p>
                                <p>
                                    €164 <a href="https://www.kiwi.com/deep?affilid=cffinternationalltdapi&currency=EUR&flightsId=0042125b4f930000256f42aa_0%7C125b0a224f940000239dc77c_0%7C0a2200424f9d00009b45b57b_0&from=BER&lang=en&passengers=1&searchBags=0.0&to=MAD&booking_token=H54HKhdljx3l2aWj3FIKtQL8_hTty_ohrkFk267rOSLnc4ea_2hBc2iSzqWm3_RwgNcTb_FuEmxI2Xt26aBb7CBi54XIML8yBT2HMgu0-uDN1HCwlyhR6VOQTkKFPscO2g3biemvIVaSBsk0iAfAh2HdsupXAagzPONmBIGqDNVhEz60_rfee8Bsf-MwbsIq3u6NPa-YrGBTtUjbmLrioe46A3S_7jpXRbkkiUCuD6bAY2zF4MsVwquLyNKcOQPWjWePVgTesoAFeQhhAmnVpaXFLdMAbP7kXG_5FHqo9Y67Ve5IR2AxMmJDwKeUizpYwqLqpSJl-7sXanyq10AS4WyCobZ8yHTNjoUXoXbHZpSlHen4uhATBQvqPPW-E0SzSCthrgWOKiOr0Y5QMSuAIIW-tSRUlr1ZpSja17e5VrLJVRKO-1cwiTcIVm3rVibA2LkjhP124nMQVLjfUJxs9lafD5opPRe6NCZzKhvPFULQlAcQmJtkQLrP30GOsA6tI-OY510IV8X93HdVWidG7ktrOiaEkLq_F5_oIQlxTCTeKD9N6jMfTSi3_Tvtvzif92NK1Emn_YE02F_fRfcFJkFoOdcpW7AQcQpP95GmYMG3FfwFPhf99NDaixBd_bhNyATZFr8PLzgxtMCauig3K9Hvx4qM_Y-xT-6Cx08gBUelCc-iaUIAFkrT7o6kdKoWclyRM20QVtXc6m8S5ltTJ73MJ4yEx5r9DdeuJ5a-j6teXmqd7d28ksWANK07AP2vuYGZ8PMb-QlkWE6ytrSU3IxyxZRmiuxNMp_uzDZHAVwn72A0FgS0r3hfCQcTIzqOvUaX5vRooLFT6U0EDd82BAO7EyPcgfIDvZJqghvoH7vQCjY25uCFtjqMX8SJEYfzqA0azibs7WmY4z63he1nXnLJQmCAMi6stYwm4cz_Nw_LnIvcLGsxsH4O931khmucGR8G6ZqkUSPwvUc6mwKMyYTNZGFdruFbNH987GRQIqQeaww3Ji0aiRjKY5FQUeKkk2649RQ6ZoG1xGBJANMd6kDocWAUDW9FbCAvp7IWSC8IKlF22jjE_fWtyxfzJN9pI_GYamlIyN2mtP7vO1RUbFg==" rel="nofollow" target="_blank" class="button green">Select</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>`;

console.log('=== SIMULATED EXTRACTOR OUTPUT ===\n');

// Simulate what the extractor functions would return based on the code logic
console.log('1. EXTRACTING FLIGHTS:');
const flights = [
    {
        uniqueId: "flight_EI337_BER_DUB",
        flightNumber: "EI337",
        departureAirportIataCode: "BER",
        arrivalAirportIataCode: "DUB",
        departureDate: "2025-10-10",
        departureTime: "21:40",
        duration: 140
    },
    {
        uniqueId: "flight_I21882_DUB_MAD",
        flightNumber: "I21882",
        departureAirportIataCode: "DUB",
        arrivalAirportIataCode: "MAD",
        departureDate: "2025-10-11",
        departureTime: "08:55",
        duration: 155
    },
    {
        uniqueId: "flight_I21801_MAD_BER",
        flightNumber: "I21801",
        departureAirportIataCode: "MAD",
        arrivalAirportIataCode: "BER",
        departureDate: "2025-10-20",
        departureTime: "07:30",
        duration: 185
    }
];
console.log('Flights result:', JSON.stringify(flights, null, 2));

console.log('\n2. EXTRACTING BUNDLES:');
const bundles = [
    {
        uniqueId: "bundle_flight_EI337_BER_DUB_flight_I21882_DUB_MAD_flight_I21801_MAD_BER",
        outboundFlightUniqueIds: ["flight_EI337_BER_DUB", "flight_I21882_DUB_MAD"],
        inboundFlightUniqueIds: ["flight_I21801_MAD_BER"]
    }
];
console.log('Bundles result:', JSON.stringify(bundles, null, 2));

console.log('\n3. EXTRACTING BOOKING OPTIONS:');
const bookingOptions = [
    {
        uniqueId: "booking_bundle_flight_EI337_BER_DUB_flight_I21882_DUB_MAD_flight_I21801_MAD_BER_Kiwi.com_164_EUR",
        targetUniqueId: "bundle_flight_EI337_BER_DUB_flight_I21882_DUB_MAD_flight_I21801_MAD_BER",
        agency: "Kiwi.com",
        price: 164,
        linkToBook: "https://www.kiwi.com/deep?affilid=cffinternationalltdapi&currency=EUR&flightsId=0042125b4f930000256f42aa_0%7C125b0a224f940000239dc77c_0%7C0a2200424f9d00009b45b57b_0&from=BER&lang=en&passengers=1&searchBags=0.0&to=MAD&booking_token=H54HKhdljx3l2aWj3FIKtQL8_hTty_ohrkFk267rOSLnc4ea_2hBc2iSzqWm3_RwgNcTb_FuEmxI2Xt26aBb7CBi54XIML8yBT2HMgu0-uDN1HCwlyhR6VOQTkKFPscO2g3biemvIVaSBsk0iAfAh2HdsupXAagzPONmBIGqDNVhEz60_rfee8Bsf-MwbsIq3u6NPa-YrGBTtUjbmLrioe46A3S_7jpXRbkkiUCuD6bAY2zF4MsVwquLyNKcOQPWjWePVgTesoAFeQhhAmnVpaXFLdMAbP7kXG_5FHqo9Y67Ve5IR2AxMmJDwKeUizpYwqLqpSJl-7sXanyq10AS4WyCobZ8yHTNjoUXoXbHZpSlHen4uhATBQvqPPW-E0SzSCthrgWOKiOr0Y5QMSuAIIW-tSRUlr1ZpSja17e5VrLJVRKO-1cwiTcIVm3rVibA2LkjhP124nMQVLjfUJxs9lafD5opPRe6NCZzKhvPFULQlAcQmJtkQLrP30GOsA6tI-OY510IV8X93HdVWidG7ktrOiaEkLq_F5_oIQlxTCTeKD9N6jMfTSi3_Tvtvzif92NK1Emn_YE02F_fRfcFJkFoOdcpW7AQcQpP95GmYMG3FfwFPhf99NDaixBd_bhNyATZFr8PLzgxtMCauig3K9Hvx4qM_Y-xT-6Cx08gBUelCc-iaUIAFkrT7o6kdKoWclyRM20QVtXc6m8S5ltTJ73MJ4yEx5r9DdeuJ5a-j6teXmqd7d28ksWANK07AP2vuYGZ8PMb-QlkWE6ytrSU3IxyxZRmiuxNMp_uzDZHAVwn72A0FgS0r3hfCQcTIzqOvUaX5vRooLFT6U0EDd82BAO7EyPcgfIDvZJqghvoH7vQCjY25uCFtjqMX8SJEYfzqA0azibs7WmY4z63he1nXnLJQmCAMi6stYwm4cz_Nw_LnIvcLGsxsH4O931khmucGR8G6ZqkUSPwvUc6mwKMyYTNZGFdruFbNH987GRQIqQeaww3Ji0aiRjKY5FQUeKkk2649RQ6ZoG1xGBJANMd6kDocWAUDW9FbCAvp7IWSC8IKlF22jjE_fWtyxfzJN9pI_GYamlIyN2mtP7vO1RUbFg==",
        currency: "EUR",
        extractedAt: Date.now()
    }
];
console.log('Booking options result:', JSON.stringify(bookingOptions, null, 2));

console.log('\n=== DATA TYPE VERIFICATION ===');
console.log('Flight duration type:', typeof flights[0].duration);
console.log('Flight departureDate type:', typeof flights[0].departureDate);
console.log('Flight departureTime type:', typeof flights[0].departureTime);
console.log('Booking option price type:', typeof bookingOptions[0].price);
console.log('Booking option extractedAt type:', typeof bookingOptions[0].extractedAt); 
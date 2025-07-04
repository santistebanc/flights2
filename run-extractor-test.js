// Import the extractor functions
import {
    extractFlightsFromPhase2Html,
    extractBundlesFromPhase2Html,
    extractBookingOptionsFromPhase2Html
} from './lib/kiwi-html-extractor.js';

// Sample Phase 2 HTML from the test file
const phase2Html = `<div class="list-item row" data-duration="14.8" data-outboundmins="1300" data-returnmins="450" data-journey="onestop" data-airline="AIRLEI" data-airline2="AIRLI2" data-airline3="AIRL" data-airline4="AIRL" data-price="16400" data-totalstops="1" data-best="1339" style="display: none;">
    <a class="modal_responsive" href="https://www.kiwi.com/deep?affilid=cffinternationalltdapi&currency=EUR&flightsId=0042125b4f930000256f42aa_0%7C125b0a224f940000239dc77c_0%7C0a2200424f9d00009b45b57b_0&from=BER&lang=en&passengers=1&searchBags=0.0&to=MAD&booking_token=H54HKhdljx3l2aWj3FIKtQL8_hTty_ohrkFk267rOSLnc4ea_2hBc2iSzqWm3_RwgNcTb_FuEmxI2Xt26aBb7CBi54XIML8yBT2HMgu0-uDN1HCwlyhR6VOQTkKFPscO2g3biemvIVaSBsk0iAfAh2HdsupXAagzPONmBIGqDNVhEz60_rfee8Bsf-MwbsIq3u6NPa-YrGBTtUjbmLrioe46A3S_7jpXRbkkiUCuD6bAY2zF4MsVwquLyNKcOQPWjWePVgTesoAFeQhhAmnVpaXFLdMAbP7kXG_5FHqo9Y67Ve5IR2AxMmJDwKeUizpYwqLqpSJl-7sXanyq10AS4WyCobZ8yHTNjoUXoXbHZpSlHen4uhATBQvqPPW-E0SzSCthrgWOKiOr0Y5QMSuAIIW-tSRUlr1ZpSja17e5VrLJVRKO-1cwiTcIVm3rVibA2LkjhP124nMQVLjfUJxs9lafD5opPRe6NCZzKhvPFULQlAcQmJtkQLrP30GOsA6tI-OY510IV8X93HdVWidG7ktrOiaEkLq_F5_oIQlxTCTeKD9N6jMfTSi3_Tvtvzif92NK1Emn_YE02F_fRfcFJkFoOdcpW7AQcQpP95GmYMG3FfwFPhf99NDaixBd_bhNyATZFr8PLzgxtMCauig3K9Hvx4qM_Y-xT-6Cx08gBUelCc-iaUIAFkrT7o6kdKoWclyRM20QVtXc6m8S5ltTJ73MJ4yEx5r9DdeuJ5a-j6teXmqd7d28ksWANK07AP2vuYGZ8PMb-QlkWE6ytrSU3IxyxZRmiuxNMp_uzDZHAVwn72A0FgS0r3hfCQcTIzqOvUaX5vRooLFT6U0EDd82BAO7EyPcgfIDvZJqghvoH7vQCjY25uCFtjqMX8SJEYfzqA0azibs7WmY4z63he1nXnLJQmCAMi6stYwm4cz_Nw_LnIvcLGsxsH4O931khmucGR8G6ZqkUSPwvUc6mwKMyYTNZGFdruFbNH987GRQIqQeaww3Ji0aiRjKY5FQUeKkk2649RQ6ZoG1xGBJANMd6kDocWAUDW9FbCAvp7IWSC8IKlF22jjE_fWtyxfzJN9pI_GYamlIyN2mtP7vO1RUbFg==" rel="nofollow" onclick="$('#myModalX').html($('#myModal0').html());$('#myModalX').modal();return false;">
        <div class="col-xs-9 left">
            <div class="item">
                <p class="airlines-name">Aer Lingus + Iberia Express</p>
                <div class="logo">
                    <img src="https://images.kiwi.com/airlines/64/EI.png" alt="Aer Lingus" title="Aer Lingus">
                    <img src="https://images.kiwi.com/airlines/64/I2.png" alt="Iberia Express" title="Iberia Express">
                    <p></p>
                </div>
                <div class="stops">
                    <p>
                        <span>21:40</span>
                        <span>BER</span>
                    </p>
                    <div class="stop-arrow">
                        <span>14h 50</span>
                        <span class="1-stops">1 stop</span>
                        <span class="hidden-airline-name"></span>
                    </div>
                    <p>
                        <span>12:30</span>
                        <span>MAD</span>
                    </p>
                </div>
            </div>
            <div class="item">
                <p class="airlines-name">Iberia Express</p>
                <div class="logo">
                    <img src="https://images.kiwi.com/airlines/64/I2.png" alt="Iberia Express" title="Iberia Express">
                    <p></p>
                </div>
                <div class="stops">
                    <p>
                        <span>07:30</span>
                        <span>MAD</span>
                    </p>
                    <div class="stop-arrow">
                        <span>3h 05</span>
                        <span class="direct">direct</span>
                        <span class="hidden-airline-name"></span>
                    </div>
                    <p>
                        <span>10:35</span>
                        <span>BER</span>
                    </p>
                </div>
            </div>
        </div>
    </a>
    <div class="col-xs-3 right">
        <div class="price">
            <img src="/static/portal-kiwi/images/space.png" alt="">
            <div class="price-summary">
                <p></p>
                <p class="prices">€164</p>
                <a href="https://www.kiwi.com/deep?affilid=cffinternationalltdapi&currency=EUR&flightsId=0042125b4f930000256f42aa_0%7C125b0a224f940000239dc77c_0%7C0a2200424f9d00009b45b57b_0&from=BER&lang=en&passengers=1&searchBags=0.0&to=MAD&booking_token=H54HKhdljx3l2aWj3FIKtQL8_hTty_ohrkFk267rOSLnc4ea_2hBc2iSzqWm3_RwgNcTb_FuEmxI2Xt26aBb7CBi54XIML8yBT2HMgu0-uDN1HCwlyhR6VOQTkKFPscO2g3biemvIVaSBsk0iAfAh2HdsupXAagzPONmBIGqDNVhEz60_rfee8Bsf-MwbsIq3u6NPa-YrGBTtUjbmLrioe46A3S_7jpXRbkkiUCuD6bAY2zF4MsVwquLyNKcOQPWjWePVgTesoAFeQhhAmnVpaXFLdMAbP7kXG_5FHqo9Y67Ve5IR2AxMmJDwKeUizpYwqLqpSJl-7sXanyq10AS4WyCobZ8yHTNjoUXoXbHZpSlHen4uhATBQvqPPW-E0SzSCthrgWOKiOr0Y5QMSuAIIW-tSRUlr1ZpSja17e5VrLJVRKO-1cwiTcIVm3rVibA2LkjhP124nMQVLjfUJxs9lafD5opPRe6NCZzKhvPFULQlAcQmJtkQLrP30GOsA6tI-OY510IV8X93HdVWidG7ktrOiaEkLq_F5_oIQlxTCTeKD9N6jMfTSi3_Tvtvzif92NK1Emn_YE02F_fRfcFJkFoOdcpW7AQcQpP95GmYMG3FfwFPhf99NDaixBd_bhNyATZFr8PLzgxtMCauig3K9Hvx4qM_Y-xT-6Cx08gBUelCc-iaUIAFkrT7o6kdKoWclyRM20QVtXc6m8S5ltTJ73MJ4yEx5r9DdeuJ5a-j6teXmqd7d28ksWANK07AP2vuYGZ8PMb-QlkWE6ytrSU3IxyxZRmiuxNMp_uzDZHAVwn72A0FgS0r3hfCQcTIzqOvUaX5vRooLFT6U0EDd82BAO7EyPcgfIDvZJqghvoH7vQCjY25uCFtjqMX8SJEYfzqA0azibs7WmY4z63he1nXnLJQmCAMi6stYwm4cz_Nw_LnIvcLGsxsH4O931khmucGR8G6ZqkUSPwvUc6mwKMyYTNZGFdruFbNH987GRQIqQeaww3Ji0aiRjKY5FQUeKkk2649RQ6ZoG1xGBJANMd6kDocWAUDW9FbCAvp7IWSC8IKlF22jjE_fWtyxfzJN9pI_GYamlIyN2mtP7vO1RUbFg==" rel="nofollow" target="_blank">view deal</a>
            </div>
        </div>
    </div>
    <div class="modal" id="myModal0" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="_text_right">
                    <button type="button" class="close _modal" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="search_modal">
                        <p class="_heading">
                            <strong>Outbound</strong>
                            Fri, 10 Oct 2025 <span>All times are local</span>
                        </p>
                        <div class="_panel">
                            <div class="_panel_heading">
                                <div class="img">
                                    <p class="_ahn">Aer Lingus + Iberia Express</p>
                                    <img src="https://images.kiwi.com/airlines/64/EI.png" alt="Aer Lingus" title="Aer Lingus">
                                    <img src="https://images.kiwi.com/airlines/64/I2.png" alt="Iberia Express" title="Iberia Express">
                                    <p></p>
                                </div>
                                <div class="trip">
                                    <p class="time">
                                        21:40 <span>BER</span>
                                    </p>
                                    <div class="_stops">
                                        <p class="time">14h 50</p>
                                        <ul>
                                            <li></li>
                                        </ul>
                                        <p class="stop">1 stop</p>
                                    </div>
                                    <p class="time">
                                        12:30 <span>MAD</span>
                                    </p>
                                </div>
                                <div class="clearfix"></div>
                            </div>
                            <div class="_panel_body">
                                <div class="_head">
                                    <div></div>
                                    <div>
                                        <small>Aer Lingus EI 337</small>
                                    </div>
                                </div>
                                <div class="_item">
                                    <div class="clearfix"></div>
                                    <div class="c1">
                                        <p>2h 20</p>
                                    </div>
                                    <div class="c2">
                                        <p></p>
                                    </div>
                                    <div class="c3">
                                        <p>21:40</p>
                                        <p>23:00</p>
                                    </div>
                                    <div class="c4">
                                        <p>BER Berlin</p>
                                        <p>DUB Dublin</p>
                                    </div>
                                    <div class="clearfix"></div>
                                    <p class="connect_airport">
                                        <span>9h 55 </span>
                                        Connection
                                    </p>
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
                                    <div class="clearfix"></div>
                                    <div class="c1">
                                        <p>2h 35</p>
                                    </div>
                                    <div class="c2">
                                        <p></p>
                                    </div>
                                    <div class="c3">
                                        <p>08:55</p>
                                        <p>12:30</p>
                                    </div>
                                    <div class="c4">
                                        <p>DUB Dublin</p>
                                        <p>MAD Madrid</p>
                                    </div>
                                    <div class="clearfix"></div>
                                    <p class="_summary">
                                        Arrives: <span>Sat, 11 Oct 2025</span>
                                        &nbsp;&middot;&nbsp;Journey Duration: <span>14h 50</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <p class="_heading">
                            <strong>Return</strong>
                            Mon, 20 Oct 2025 
                        </p>
                        <div class="_panel">
                            <div class="_panel_heading">
                                <div class="img">
                                    <p class="_ahn">Iberia Express</p>
                                    <img src="https://images.kiwi.com/airlines/64/I2.png" alt="Iberia Express" title="Iberia Express">
                                    <p></p>
                                </div>
                                <div class="trip">
                                    <p class="time">
                                        07:30 <span>MAD</span>
                                    </p>
                                    <div class="_stops">
                                        <p class="time">3h 05</p>
                                        <ul></ul>
                                        <p class="stop" style="color:#3ba891;">Direct</p>
                                    </div>
                                    <p class="time">
                                        10:35 <span>BER</span>
                                    </p>
                                </div>
                                <div class="clearfix"></div>
                            </div>
                            <div class="_panel_body">
                                <div class="_head">
                                    <div></div>
                                    <div>
                                        <small>Iberia Express I2 1801</small>
                                    </div>
                                </div>
                                <div class="_item">
                                    <div class="clearfix"></div>
                                    <div class="c1">
                                        <p>3h 05</p>
                                    </div>
                                    <div class="c2">
                                        <p></p>
                                    </div>
                                    <div class="c3">
                                        <p>07:30</p>
                                        <p>10:35</p>
                                    </div>
                                    <div class="c4">
                                        <p>MAD Madrid</p>
                                        <p>BER Berlin</p>
                                    </div>
                                    <div class="clearfix"></div>
                                    <p class="_summary">
                                        Arrives: <span>Mon, 20 Oct 2025</span>
                                        &nbsp;&middot;&nbsp;Journey Duration: <span>3h 05</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <p class="_heading">
                            <strong>Book Your Ticket</strong>
                        </p>
                        <div class="_similar">
                            <div>
                                <p>Kiwi.com</p>
                                <p>
                                    €164 <a href="https://www.kiwi.com/deep?affilid=cffinternationalltdapi&currency=EUR&flightsId=0042125b4f930000256f42aa_0%7C125b0a224f940000239dc77c_0%7C0a2200424f9d00009b45b57b_0&from=BER&lang=en&passengers=1&searchBags=0.0&to=MAD&booking_token=H54HKhdljx3l2aWj3FIKtQL8_hTty_ohrkFk267rOSLnc4ea_2hBc2iSzqWm3_RwgNcTb_FuEmxI2Xt26aBb7CBi54XIML8yBT2HMgu0-uDN1HCwlyhR6VOQTkKFPscO2g3biemvIVaSBsk0iAfAh2HdsupXAagzPONmBIGqDNVhEz60_rfee8Bsf-MwbsIq3u6NPa-YrGBTtUjbmLrioe46A3S_7jpXRbkkiUCuD6bAY2zF4MsVwquLyNKcOQPWjWePVgTesoAFeQhhAmnVpaXFLdMAbP7kXG_5FHqo9Y67Ve5IR2AxMmJDwKeUizpYwqLqpSJl-7sXanyq10AS4WyCobZ8yHTNjoUXoXbHZpSlHen4uhATBQvqPPW-E0SzSCthrgWOKiOr0Y5QMSuAIIW-tSRUlr1ZpSja17e5VrLJVRKO-1cwiTcIVm3rVibA2LkjhP124nMQVLjfUJxs9lafD5opPRe6NCZzKhvPFULQlAcQmJtkQLrP30GOsA6tI-OY510IV8X93HdVWidG7ktrOiaEkLq_F5_oIQlxTCTeKD9N6jMfTSi3_Tvtvzif92NK1Emn_YE02F_fRfcFJkFoOdcpW7AQcQpP95GmYMG3FfwFPhf99NDaixBd_bhNyATZFr8PLzgxtMCauig3K9Hvx4qM_Y-xT-6Cx08gBUelCc-iaUIAFkrT7o6kdKoWclyRM20QVtXc6m8S5ltTJ73MJ4yEx5r9DdeuJ5a-j6teXmqd7d28ksWANK07AP2vuYGZ8PMb-QlkWE6ytrSU3IxyxZRmiuxNMp_uzDZHAVwn72A0FgS0r3hfCQcTIzqOvUaX5vRooLFT6U0EDd82BAO7EyPcgfIDvZJqghvoH7vQCjY25uCFtjqMX8SJEYfzqA0azibs7WmY4z63he1nXnLJQmCAMi6stYwm4cz_Nw_LnIvcLGsxsH4O931khmucGR8G6ZqkUSPwvUc6mwKMyYTNZGFdruFbNH987GRQIqQeaww3Ji0aiRjKY5FQUeKkk2649RQ6ZoG1xGBJANMd6kDocWAUDW9FbCAvp7IWSC8IKlF22jjE_fWtyxfzJN9pI_GYamlIyN2mtP7vO1RUbFg==" rel="nofollow" target="_blank" class="button green">Select</a>
                                </p>
                                <div class="clearfix"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>`;

console.log('=== RUNNING ACTUAL EXTRACTOR FUNCTIONS ===\n');

try {
    console.log('1. EXTRACTING FLIGHTS:');
    const flights = extractFlightsFromPhase2Html(phase2Html);
    console.log('Flights result:', JSON.stringify(flights, null, 2));

    console.log('\n2. EXTRACTING BUNDLES:');
    const bundles = extractBundlesFromPhase2Html(phase2Html);
    console.log('Bundles result:', JSON.stringify(bundles, null, 2));

    console.log('\n3. EXTRACTING BOOKING OPTIONS:');
    const bookingOptions = extractBookingOptionsFromPhase2Html(phase2Html);
    console.log('Booking options result:', JSON.stringify(bookingOptions, null, 2));

    console.log('\n=== DATA TYPE VERIFICATION ===');
    if (flights.length > 0) {
        console.log('Flight duration type:', typeof flights[0].duration);
        console.log('Flight departureDate type:', typeof flights[0].departureDate);
        console.log('Flight departureTime type:', typeof flights[0].departureTime);
    }
    if (bookingOptions.length > 0) {
        console.log('Booking option price type:', typeof bookingOptions[0].price);
    }

} catch (error) {
    console.error('Error during extraction:', error);
} 
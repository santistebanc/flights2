import {
  extractSessionDataFromPhase1Html,
  extractBundlesFromPhase2Html,
} from "./skyscanner-html-extractor";

describe("skyscanner-html-extractor", () => {
  const phase1Html = `
    <html>
      <head>
        <title>Find Prices...</title>
      </head>
      <script>
        // Other scripts...
      </script>
      <head>
        <body>
          <div id="app">
          </div>
          <script type="text/javascript">
          var CFFLive = {
          polling: true,
          intervalRef: null,
          objAllResults: Object,
          objFilteredResults: Object,
          current_page: 1,
          results_added: false,
          blink_started: false,
          pollSession: function () {
              //$('#msgoverlay', parent.document).fadeOut(200);
              $.ajax({type: 'POST', url: '/portal/sky/poll',
                  complete: function (transport) {
                      var resp = transport.responseText;
                      var resp_array = resp.split('|');

                      if (resp_array[6].length > 0) {
                          CFFLive.setTableData(resp_array);
                      }

                      if (resp_array[0] == 'Y') {
                          CFFLive.endPolling();
                          //$('.main .heading').addClass('loaded');
                          //$('.spinner').fadeOut();
                          $('#hidden-on-load').fadeIn(200);

                          if (parseInt(resp_array[1]) == 0) {
                              $('#found_zone').html('<span>No Results Found</span>');
                              $('.jplist-pagination').hide();
                              $('#results').html('<p>No results found. Please change destination or dates.</p>');
                          }
                      } else {
                          if (parseInt(resp_array[1]) != 0) {
                              //$('.loading-iframe p', parent.document).html('Loading results, please wait (found ' + resp_array[1] + ')...');
                              $('#found_zone').html('<span>Searching (found ' + resp_array[1] + ')...</span>');
                          }
                          setTimeout(CFFLive.pollSession, 100);
                      }
                  },
                  data: {
                      '_token': '1XiMiR5s6GbdvkWghMEH6maCeZVGNOXdlINUjVhI',
                      'session': 'CrQBS0xVdl9TQ045UU1Ba2tnZEhyRHJETU13YUFVWHdtaFgyV1FhamZGVEpVcWk1Q1I0ekRWb29vTU5BVkFVSUpiOFo4ZzQyekxxOUcyVnpXT1ZNNzVDNkUxSGY5UjFZVW9CR050dFdzWVJqTVBZVmU5Vy04cVJhWlc5Tk90azlzWDVreU1nM250TDNHOTZydFIzLUdveHpnb2J1anJ2dVJPcm1RelBJQldBTUEwQkFRQ1BvRUFCIi0KAlVTEgVlbi1HQhoDRVVSIhcKBQoDQkVSEgUKA01BRBoHCOkPEAoYCigBMAEqJGVkNzhhMDA4LWE1OTUtNGEzZi1iNWFiLWMyZTk2YjI3MTAwMA==-cells1',
                      'suuid': '7d9fa5a8-853d-4782-81cd-f5cd064faec8',
                      'noc': $.now(),
                      'deeplink': 'https://www.tkqlhce.com/click-3476948-11839040-1440520708000?sid=cff&amp;url=https://www.skyscanner.net/transport/flights/BER/MAD/251010/?adults=1&amp;adultsv2=1&amp;children=0&amp;infants=0&amp;cabinclass=Economy&amp;rtn=1&amp;currency=EUR',
                      's': 'www',
                      'adults': '1',
                      'children': '0',
                      'infants': '0',
                      'currency': 'EUR',
                  }
              });
          },

          $(document).ready(function() {
              //$('.loading-iframe p', parent.document).html('Loading...');
              CFFLive.checkResults();
              CFFLive.pollSession();
          });
          </script>
        </body>
      </html>
  `;

  const phase2Html = `<div class="list-item row" data-duration="6.1" data-outboundmins="360" data-returnmins="680" data-journey="onestop" data-airline="AIRL-32132" data-price="29100" data-totalstops="2" data-best="1176" data-sortduration="685" style="display:none;">
    <a class="modal_responsive" href="https://agw.skyscnr.com/v1/redirect?pageUrl=https%3A%2F%2Fskyscanner.pxf.io%2Fc%2F2988255%2F1103265%2F13416%3Fu%3Dhttps%253A%252F%252Fwww.skyscanner.com%252Ftransport_deeplink%252F4.0%252FUS%252Fen-GB%252FEUR%252Fairf%252F2%252F9828.13870.2025-10-10%252C13870.9828.2025-10-20%252Fair%252Fairli%252Fflights%253Fitinerary%253Dflight%25257C-32132%25257C1770%25257C9828%25257C2025-10-10T06%25253A00%25257C9451%25257C2025-10-10T07%25253A25%25257C85%25257CRYQ32ALA%25257CR%25257CLIGHT%25253Bflight%25257C-32132%25257C1503%25257C9451%25257C2025-10-10T09%25253A30%25257C13870%25257C2025-10-10T12%25253A05%25257C155%25257CRYQ32ALA%25257CR%25257CLIGHT%25252Cflight%25257C-32132%25257C1500%25257C13870%25257C2025-10-20T06%25253A00%25257C9451%25257C2025-10-20T08%25253A25%25257C145%25257CEYQ12ALA%25257CE%25257CLIGHT%25253Bflight%25257C-32132%25257C1775%25257C9451%25257C2025-10-20T10%25253A05%25257C9828%25257C2025-10-20T11%25253A20%25257C75%25257CEYQ12ALA%25257CE%25257CLIGHT%2526carriers%253D-32132%2526operators%253D-32132%25253B-32132%25252C-32132%25253B-32132%2526passengers%253D1%2526channel%253Ddataapi%2526cabin_class%253Deconomy%2526fps_session_id%253D6c502c82-6767-4c64-be37-8fa5dae29c2d%2526ticket_price%253D291.21%2526is_npt%253Dfalse%2526is_multipart%253Dfalse%2526client_id%253Dskyscanner_b2b%2526request_id%253D61b72853-0831-469f-af50-88f0c7248bb9%2526q_ids%253DH4sIAAAAAAAA_-NS4GJJzCxKE2LmeOIjxcyxLkehYebC42waDd-vHmczYlJgBACm5xlzIgAAAA%25257C-5790370261155891916%25257C2%2526q_sources%253DJACQUARD%2526commercial_filters%253Dfalse%2526q_datetime_utc%253D2025-07-04T04%25253A18%25253A07%2526pqid%253Dfalse%2526fare_type%253Dbase_fare%2526api_logo%253Dhttps%25253A%25252F%25252Flogos.skyscnr.com%25252Fimages%25252Fpartners%25252Fdefault.png%2526api_pbs%253Dtrue%2526app_id%253Ddrmo%2525252F%2525252B%2525252BLZWahakSAJkRrfdsE%2525252BxNAAl0Gp6SRtLZpicJX5XC4Nca%2525252Bjff5kzs%2525252BdeFm&impactMediaPartnerId=2988255" onclick="$('#myModalX').html($('#myModal0').html());$('#myModalX').modal();return false;" rel="nofollow">
        <div class="col-xs-9 left">
            <div class="item">
                <p class="airlines-name">KLM</p>
                <div class="logo">
                    <img src="https://logos.skyscnr.com/images/airlines/KL.png" alt="KLM" title="KLM">
                </div>
                <div class="stops">
                    <p>
                        <span>06:00</span>
                        <span>BER</span>
                    </p>
                    <div class="stop-arrow">
                        <span>6h 05</span>
                        <span class="1-stops">1 stop</span>
                        <span class="hidden-airline-name"></span>
                    </div>
                    <p>
                        <span>12:05</span>
                        <span>MAD</span>
                    </p>
                </div>
            </div>
            <div class="item">
                <p class="airlines-name">KLM</p>
                <div class="logo">
                    <img src="https://logos.skyscnr.com/images/airlines/KL.png" alt="KLM" title="KLM">
                </div>
                <div class="stops">
                    <p>
                        <span>06:00</span>
                        <span>MAD</span>
                    </p>
                    <div class="stop-arrow">
                        <span>5h 20</span>
                        <span class="1-stops">1 stop</span>
                        <span class="hidden-airline-name"></span>
                    </div>
                    <p>
                        <span>11:20</span>
                        <span>BER</span>
                    </p>
                </div>
            </div>
        </div>
    </a>
    <div class="col-xs-3 right">
        <div class="price">
            <img src="https://flightsfinder.s3.us-east-1.amazonaws.com/public/airports/000/002/413/160x213/1534238437_KRPzq_madrid-3021998_1280.jpg" alt="">
            <div class="price-summary">
                <p></p>
                <p class="prices">€291</p>
                <a href="https://agw.skyscnr.com/v1/redirect?pageUrl=https%3A%2F%2Fskyscanner.pxf.io%2Fc%2F2988255%2F1103265%2F13416%3Fu%3Dhttps%253A%252F%252Fwww.skyscanner.com%252Ftransport_deeplink%252F4.0%252FUS%252Fen-GB%252FEUR%252Fairf%252F2%252F9828.13870.2025-10-10%252C13870.9828.2025-10-20%252Fair%252Fairli%252Fflights%253Fitinerary%253Dflight%25257C-32132%25257C1770%25257C9828%25257C2025-10-10T06%25253A00%25257C9451%25257C2025-10-10T07%25253A25%25257C85%25257CRYQ32ALA%25257CR%25257CLIGHT%25253Bflight%25257C-32132%25257C1503%25257C9451%25257C2025-10-10T09%25253A30%25257C13870%25257C2025-10-10T12%25253A05%25257C155%25257CRYQ32ALA%25257CR%25257CLIGHT%25252Cflight%25257C-32132%25257C1500%25257C13870%25257C2025-10-20T06%25253A00%25257C9451%25257C2025-10-20T08%25253A25%25257C145%25257CEYQ12ALA%25257CE%25257CLIGHT%25253Bflight%25257C-32132%25257C1775%25257C9451%25257C2025-10-20T10%25253A05%25257C9828%25257C2025-10-20T11%25253A20%25257C75%25257CEYQ12ALA%25257CE%25257CLIGHT%2526carriers%253D-32132%2526operators%253D-32132%25253B-32132%25252C-32132%25253B-32132%2526passengers%253D1%2526channel%253Ddataapi%2526cabin_class%253Deconomy%2526fps_session_id%253D6c502c82-6767-4c64-be37-8fa5dae29c2d%2526ticket_price%253D291.21%2526is_npt%253Dfalse%2526is_multipart%253Dfalse%2526client_id%253Dskyscanner_b2b%2526request_id%253D61b72853-0831-469f-af50-88f0c7248bb9%2526q_ids%253DH4sIAAAAAAAA_-NS4GJJzCxKE2LmeOIjxcyxLkehYebC42waDd-vHmczYlJgBACm5xlzIgAAAA%25257C-5790370261155891916%25257C2%2526q_sources%253DJACQUARD%2526commercial_filters%253Dfalse%2526q_datetime_utc%253D2025-07-04T04%25253A18%25253A07%2526pqid%253Dfalse%2526fare_type%253Dbase_fare%2526api_logo%253Dhttps%25253A%25252F%25252Flogos.skyscnr.com%25252Fimages%25252Fpartners%25252Fdefault.png%2526api_pbs%253Dtrue%2526app_id%253Ddrmo%2525252F%2525252B%2525252BLZWahakSAJkRrfdsE%2525252BxNAAl0Gp6SRtLZpicJX5XC4Nca%2525252Bjff5kzs%2525252BdeFm&impactMediaPartnerId=2988255" rel="nofollow" target="_blank">view deal</a>
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
                                    <p class="_ahn">KLM</p>
                                    <img src="https://logos.skyscnr.com/images/airlines/KL.png" alt="KLM" title="KLM">
                                </div>
                                <div class="trip">
                                    <p class="time">
                                        06:00 <span>BER</span>
                                    </p>
                                    <div class="_stops">
                                        <p class="time">6h 05</p>
                                        <ul>
                                            <li></li>
                                        </ul>
                                        <p class="stop">
                                            1 stop <span></span>
                                        </p>
                                    </div>
                                    <p class="time">
                                        12:05 <span>MAD</span>
                                    </p>
                                </div>
                                <div class="clearfix"></div>
                            </div>
                            <div class="_panel_body">
                                <div class="_head">
                                    <div></div>
                                    <div>
                                        <small>KLM KL1770</small>
                                    </div>
                                </div>
                                <div class="_item">
                                    <div class="clearfix"></div>
                                    <div class="c1">
                                        <p>1h 25</p>
                                    </div>
                                    <div class="c2">
                                        <p></p>
                                    </div>
                                    <div class="c3">
                                        <p>06:00</p>
                                        <p>07:25</p>
                                    </div>
                                    <div class="c4">
                                        <p>BER</p>
                                        <p>AMS</p>
                                    </div>
                                    <div class="c5">
                                        <p></p>
                                    </div>
                                    <div class="c6">
                                        <p></p>
                                    </div>
                                    <div class="clearfix"></div>
                                </div>
                                <div class="_panel_body">
                                    <div class="_head">
                                        <div></div>
                                        <div>
                                            <small>KLM KL1503</small>
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
                                            <p>09:30</p>
                                            <p>12:05</p>
                                        </div>
                                        <div class="c4">
                                            <p>AMS</p>
                                            <p>MAD</p>
                                        </div>
                                        <div class="c5">
                                            <p></p>
                                        </div>
                                        <div class="c6">
                                            <p></p>
                                        </div>
                                        <div class="clearfix"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p class="_heading">
                            <strong>Return</strong>
                            Mon, 20 Oct 2025 <span>All times are local</span>
                        </p>
                        <div class="_panel">
                            <div class="_panel_heading">
                                <div class="img">
                                    <p class="_ahn">KLM</p>
                                    <img src="https://logos.skyscnr.com/images/airlines/KL.png" alt="KLM" title="KLM">
                                </div>
                                <div class="trip">
                                    <p class="time">
                                        06:00 <span>MAD</span>
                                    </p>
                                    <div class="_stops">
                                        <p class="time">5h 20</p>
                                        <ul>
                                            <li></li>
                                        </ul>
                                        <p class="stop">
                                            1 stop <span></span>
                                        </p>
                                    </div>
                                    <p class="time">
                                        11:20 <span>BER</span>
                                    </p>
                                </div>
                                <div class="clearfix"></div>
                            </div>
                            <div class="_panel_body">
                                <div class="_head">
                                    <div></div>
                                    <div>
                                        <small>KLM KL1500</small>
                                    </div>
                                </div>
                                <div class="_item">
                                    <div class="clearfix"></div>
                                    <div class="c1">
                                        <p>2h 25</p>
                                    </div>
                                    <div class="c2">
                                        <p></p>
                                    </div>
                                    <div class="c3">
                                        <p>06:00</p>
                                        <p>08:25</p>
                                    </div>
                                    <div class="c4">
                                        <p>MAD</p>
                                        <p>AMS</p>
                                    </div>
                                    <div class="c5">
                                        <p></p>
                                    </div>
                                    <div class="c6">
                                        <p></p>
                                    </div>
                                    <div class="clearfix"></div>
                                </div>
                                <div class="_panel_body">
                                    <div class="_head">
                                        <div></div>
                                        <div>
                                            <small>KLM KL1775</small>
                                        </div>
                                    </div>
                                    <div class="_item">
                                        <div class="clearfix"></div>
                                        <div class="c1">
                                            <p>1h 15</p>
                                        </div>
                                        <div class="c2">
                                            <p></p>
                                        </div>
                                        <div class="c3">
                                            <p>10:05</p>
                                            <p>11:20</p>
                                        </div>
                                        <div class="c4">
                                            <p>AMS</p>
                                            <p>BER</p>
                                        </div>
                                        <div class="c5">
                                            <p></p>
                                        </div>
                                        <div class="c6">
                                            <p></p>
                                        </div>
                                        <div class="clearfix"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p class="_heading">
                            <strong>Book Your Ticket</strong>
                        </p>
                        <div class="_similar">
                            <div class="c1">
                                <p>Kiwi.com</p>
                            </div>
                            <div class="c2">
                                <p>€291 <a href="https://agw.skyscnr.com/v1/redirect?pageUrl=https%3A%2F%2Fskyscanner.pxf.io%2Fc%2F2988255%2F1103265%2F13416%3Fu%3Dhttps%253A%252F%252Fwww.skyscanner.com%252Ftransport_deeplink%252F4.0%252FUS%252Fen-GB%252FEUR%252Fairf%252F2%252F9828.13870.2025-10-10%252C13870.9828.2025-10-20%252Fair%252Fairli%252Fflights%253Fitinerary%253Dflight%25257C-32132%25257C1770%25257C9828%25257C2025-10-10T06%25253A00%25257C9451%25257C2025-10-10T07%25253A25%25257C85%25257CRYQ32ALA%25257CR%25257CLIGHT%25253Bflight%25257C-32132%25257C1503%25257C9451%25257C2025-10-10T09%25253A30%25257C13870%25257C2025-10-10T12%25253A05%25257C155%25257CRYQ32ALA%25257CR%25257CLIGHT%25252Cflight%25257C-32132%25257C1503%25257C13870%25257C2025-10-20T06%25253A00%25257C9451%25257C2025-10-20T08%25253A25%25257C145%25257CEYQ12ALA%25257CE%25257CLIGHT%25253Bflight%25257C-32132%25257C1775%25257C9451%25257C2025-10-20T10%25253A05%25257C9828%25257C2025-10-20T11%25253A20%25257C75%25257CEYQ12ALA%25257CE%25257CLIGHT%2526carriers%253D-32132%2526operators%253D-32132%25253B-32132%25252C-32132%25253B-32132%2526passengers%253D1%2526channel%253Ddataapi%2526cabin_class%253Deconomy%2526fps_session_id%253D6c502c82-6767-4c64-be37-8fa5dae29c2d%2526ticket_price%253D291.21%2526is_npt%253Dfalse%2526is_multipart%253Dfalse%2526client_id%253Dskyscanner_b2b%2526request_id%253D61b72853-0831-469f-af50-88f0c7248bb9%2526q_ids%253DH4sIAAAAAAAA_-NS4GJJzCxKE2LmeOIjxcyxLkehYebC42waDd-vHmczYlJgBACm5xlzIgAAAA%25257C-5790370261155891916%25257C2%2526q_sources%253DJACQUARD%2526commercial_filters%253Dfalse%2526q_datetime_utc%253D2025-07-04T04%25253A18%25253A07%2526pqid%253Dfalse%2526fare_type%253Dbase_fare%2526api_logo%253Dhttps%25253A%25252F%25252Flogos.skyscnr.com%25252Fimages%25252Fpartners%25252Fdefault.png%2526api_pbs%253Dtrue%2526app_id%253Ddrmo%2525252F%2525252B%2525252BLZWahakSAJkRrfdsE%2525252BxNAAl0Gp6SRtLZpicJX5XC4Nca%2525252Bjff5kzs%2525252BdeFm&impactMediaPartnerId=2988255" rel="nofollow" target="_blank">view deal</a></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>`;

  it("extracts session data from Phase 1 HTML", () => {
    const session = extractSessionDataFromPhase1Html(phase1Html);
    expect(session).toEqual({
      token: "1XiMiR5s6GbdvkWghMEH6maCeZVGNOXdlINUjVhI",
      session:
        "CrQBS0xVdl9TQ045UU1Ba2tnZEhyRHJETU13YUFVWHdtaFgyV1FhamZGVEpVcWk1Q1I0ekRWb29vTU5BVkFVSUpiOFo4ZzQyekxxOUcyVnpXT1ZNNzVDNkUxSGY5UjFZVW9CR050dFdzWVJqTVBZVmU5Vy04cVJhWlc5Tk90azlzWDVreU1nM250TDNHOTZydFIzLUdveHpnb2J1anJ2dVJPcm1RelBJQldBTUEwQkFRQ1BvRUFCIi0KAlVTEgVlbi1HQhoDRVVSIhcKBQoDQkVSEgUKA01BRBoHCOkPEAoYCigBMAEqJGVkNzhhMDA4LWE1OTUtNGEzZi1iNWFiLWMyZTk2YjI3MTAwMA==-cells1",
      suuid: "7d9fa5a8-853d-4782-81cd-f5cd064faec8",
      deeplink:
        "https://www.tkqlhce.com/click-3476948-11839040-1440520708000?sid=cff&amp;url=https://www.skyscanner.net/transport/flights/BER/MAD/251010/?adults=1&amp;adultsv2=1&amp;children=0&amp;infants=0&amp;cabinclass=Economy&amp;rtn=1&amp;currency=EUR",
    });
  });

  it("extracts bundles from Phase 2 HTML", () => {
    const bundles = extractBundlesFromPhase2Html(phase2Html);
    expect(bundles).toHaveLength(1);

    const bundle = bundles[0];
    expect(bundle.outboundFlights).toHaveLength(2);
    expect(bundle.inboundFlights).toHaveLength(2);
    expect(bundle.bookingOptions).toHaveLength(1);
    expect(bundle.departureDate).toBe("2025-10-10");
    expect(bundle.returnDate).toBe("2025-10-20");

    // Check outbound flights
    expect(bundle.outboundFlights[0]).toEqual({
      flightNumber: "KL1770",
      departureAirportIataCode: "BER",
      arrivalAirportIataCode: "AMS",
      departureTime: "06:00",
      duration: 85,
      connectionDurationFromPreviousFlight: undefined,
    });

    expect(bundle.outboundFlights[1]).toEqual({
      flightNumber: "KL1503",
      departureAirportIataCode: "AMS",
      arrivalAirportIataCode: "MAD",
      departureTime: "09:30",
      duration: 155,
      connectionDurationFromPreviousFlight: undefined,
    });

    // Check inbound flights
    expect(bundle.inboundFlights[0]).toEqual({
      flightNumber: "KL1500",
      departureAirportIataCode: "MAD",
      arrivalAirportIataCode: "AMS",
      departureTime: "06:00",
      duration: 145,
      connectionDurationFromPreviousFlight: undefined,
    });

    expect(bundle.inboundFlights[1]).toEqual({
      flightNumber: "KL1775",
      departureAirportIataCode: "AMS",
      arrivalAirportIataCode: "BER",
      departureTime: "10:05",
      duration: 75,
      connectionDurationFromPreviousFlight: undefined,
    });

    // Check booking option
    expect(bundle.bookingOptions[0]).toEqual({
      agency: "Kiwi.com",
      price: 291,
      linkToBook: expect.stringMatching(
        /^https:\/\/agw\.skyscnr\.com\/v1\/redirect\?pageUrl=/
      ),
      currency: "EUR",
      extractedAt: expect.any(Number),
    });
  });
});

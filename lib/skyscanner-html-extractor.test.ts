import {
  extractSessionDataFromPhase1Html,
  extractFlightsFromPhase2Html,
  extractBundlesFromPhase2Html,
  extractBookingOptionsFromPhase2Html,
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

  const phase2Html = `<div class="list-item row" data-duration="7.9" data-outboundmins="360" data-returnmins="0" data-journey="twostops" data-airline="AIRL-31915" data-price="10700" data-totalstops="1" data-best="682" data-sortduration="475" style="display:none;">
    <a class="modal_responsive" href="https://agw.skyscnr.com/v1/redirect?pageUrl=https%3A%2F%2Fskyscanner.pxf.io%2Fc%2F2988255%2F1103265%2F13416%3Fu%3Dhttps%253A%252F%252Fwww.skyscanner.com%252Ftransport_deeplink%252F4.0%252FUS%252Fen-GB%252FEUR%252Fdhop%252F1%252F9828.13870.2025-10-10%252Fair%252Ftrava%252Fflights%253Fitinerary%253Dflight%25257C-31915%25257C314%25257C9828%25257C2025-10-10T06%25253A00%25257C15116%25257C2025-10-10T09%25253A10%25257C130%25257C-%25257C-%25257C-%25253Bflight%25257C-31915%25257C2514%25257C15116%25257C2025-10-10T11%25253A00%25257C13870%25257C2025-10-10T13%25253A55%25257C235%25257C-%25257C-%25257C-%2526carriers%253D-31915%2526operators%253D-30823%25253B-31915%2526passengers%253D1%2526channel%253Ddataapi%2526cabin_class%253Deconomy%2526fps_session_id%253D4f527b2e-1570-4b74-938c-3c093965b933%2526ticket_price%253D107.10%2526is_npt%253Dfalse%2526is_multipart%253Dfalse%2526client_id%253Dskyscanner_b2b%2526request_id%253D4dc5003b-a47b-427f-b6b8-e315641bf77a%2526q_ids%253DH4sIAAAAAAAA_-OS4mJJycgvEGLmeOIjxcyxLkehYebC42xGTAqMAJNeP9ccAAAA%25257C5755615638798927033%25257C2%2526q_sources%253DJACQUARD%2526commercial_filters%253Dfalse%2526q_datetime_utc%253D2025-07-03T21%25253A48%25253A49%2526transfer_protection%253Dprotected%2526pqid%253Dfalse%2526fare_type%253Dbase_fare%2526api_logo%253Dhttps%25253A%25252F%25252Flogos.skyscnr.com%25252Fimages%25252Fpartners%25252Fdefault.png%2526api_pbs%253Dtrue%2526app_id%253Ddrmo%2525252F%2525252B%2525252BLZWahakSAJkRrfdsE%2525252BxNAAl0Gp6SRtLZpicJX5XC4Nca%2525252Bjff5kzs%2525252BdeFm&impactMediaPartnerId=2988255" onclick="$('#myModalX').html($('#myModal0').html());$('#myModalX').modal();return false;" rel="nofollow">
        <div class="col-xs-9 left">
            <div class="item">
                <p class="airlines-name">Ryanair</p>
                <div class="logo">
                    <img src="/static/portal-sky/images/default.png?_m=1670235876" alt="Ryanair" title="Ryanair">
                    <p>Partly operated by Malta Air</p>
                </div>
                <div class="stops">
                    <p>
                        <span>06:00</span>
                        <span>BER</span>
                    </p>
                    <div class="stop-arrow">
                        <span>7h 55</span>
                        <span class="1-stops">1 stop</span>
                        <span class="hidden-airline-name"></span>
                    </div>
                    <p>
                        <span>13:55</span>
                        <span>MAD</span>
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
                <p class="prices">€107</p>
                <a href="https://agw.skyscnr.com/v1/redirect?pageUrl=https%3A%2F%2Fskyscanner.pxf.io%2Fc%2F2988255%2F1103265%2F13416%3Fu%3Dhttps%253A%252F%252Fwww.skyscanner.com%252Ftransport_deeplink%252F4.0%252FUS%252Fen-GB%252FEUR%252Fdhop%252F1%252F9828.13870.2025-10-10%252Fair%252Ftrava%252Fflights%253Fitinerary%253Dflight%25257C-31915%25257C314%25257C9828%25257C2025-10-10T06%25253A00%25257C15116%25257C2025-10-10T09%25253A10%25257C130%25257C-%25257C-%25257C-%25253Bflight%25257C-31915%25257C2514%25257C15116%25257C2025-10-10T11%25253A00%25257C13870%25257C2025-10-10T13%25253A55%25257C235%25257C-%25257C-%25257C-%2526carriers%253D-31915%2526operators%253D-30823%25253B-31915%2526passengers%253D1%2526channel%253Ddataapi%2526cabin_class%253Deconomy%2526fps_session_id%253D4f527b2e-1570-4b74-938c-3c093965b933%2526ticket_price%253D107.10%2526is_npt%253Dfalse%2526is_multipart%253Dfalse%2526client_id%253Dskyscanner_b2b%2526request_id%253D4dc5003b-a47b-427f-b6b8-e315641bf77a%2526q_ids%253DH4sIAAAAAAAA_-OS4mJJycgvEGLmeOIjxcyxLkehYebC42xGTAqMAJNeP9ccAAAA%25257C5755615638798927033%25257C2%2526q_sources%253DJACQUARD%2526commercial_filters%253Dfalse%2526q_datetime_utc%253D2025-07-03T21%25253A48%25253A49%2526transfer_protection%253Dprotected%2526pqid%253Dfalse%2526fare_type%253Dbase_fare%2526api_logo%253Dhttps%25253A%25252F%25252Flogos.skyscnr.com%25252Fimages%25252Fpartners%25252Fdefault.png%2526api_pbs%253Dtrue%2526app_id%253Ddrmo%2525252F%2525252B%2525252BLZWahakSAJkRrfdsE%2525252BxNAAl0Gp6SRtLZpicJX5XC4Nca%2525252Bjff5kzs%2525252BdeFm&impactMediaPartnerId=2988255" rel="nofollow" target="_blank">view deal</a>
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
                                    <p class="_ahn">Ryanair</p>
                                    <img src="/static/portal-sky/images/default.png?_m=1670235876" alt="Ryanair" title="Ryanair">
                                    <p>Partly operated by Malta Air</p>
                                </div>
                                <div class="trip">
                                    <p class="time">
                                        06:00 <span>BER</span>
                                    </p>
                                    <div class="_stops">
                                        <p class="time">7h 55</p>
                                        <ul>
                                            <li></li>
                                        </ul>
                                        <p class="stop">
                                            1 stop <span></span>
                                        </p>
                                    </div>
                                    <p class="time">
                                        13:55 <span>MAD</span>
                                    </p>
                                </div>
                                <div class="clearfix"></div>
                            </div>
                            <div class="_panel_body">
                                <div class="_head">
                                    <div></div>
                                    <div>
                                        <small>Ryanair FR314</small>
                                    </div>
                                </div>
                                <div class="_item">
                                    <div class="clearfix"></div>
                                    <div class="c1">
                                        <p>2h 10</p>
                                    </div>
                                    <div class="c2">
                                        <p></p>
                                    </div>
                                    <div class="c3">
                                        <p>06:00</p>
                                        <p>09:10</p>
                                    </div>
                                    <div class="c4">
                                        <p>BER Berlin Brandenburg</p>
                                        <p>OTP Bucharest Otopeni</p>
                                    </div>
                                    <div class="clearfix"></div>
                                    <p class="connect_airport">
                                        <span>1h 50 </span>
                                        Connect in airport
                                    </p>
                                </div>
                            </div>
                            <div class="_panel_body">
                                <div class="_head">
                                    <div></div>
                                    <div>
                                        <small>Ryanair FR2514</small>
                                    </div>
                                </div>
                                <div class="_item">
                                    <div class="clearfix"></div>
                                    <div class="c1">
                                        <p>3h 55</p>
                                    </div>
                                    <div class="c2">
                                        <p></p>
                                    </div>
                                    <div class="c3">
                                        <p>11:00</p>
                                        <p>13:55</p>
                                    </div>
                                    <div class="c4">
                                        <p>OTP Bucharest Otopeni</p>
                                        <p>MAD Madrid</p>
                                    </div>
                                    <div class="clearfix"></div>
                                    <p class="_summary">
                                        Arrives: <span>Fri, 10 Oct 2025</span>
                                        &nbsp;&middot;&nbsp;Journey Duration: <span>7h 55</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <p class="_heading">
                            <strong>Book Your Ticket</strong>
                        </p>
                        <div class="_similar">
                            <div>
                                <p>WAYA</p>
                                <p>
                                    €107 <a href="https://agw.skyscnr.com/v1/redirect?pageUrl=https%3A%2F%2Fskyscanner.pxf.io%2Fc%2F2988255%2F1103265%2F13416%3Fu%3Dhttps%253A%252F%252Fwww.skyscanner.com%252Ftransport_deeplink%252F4.0%252FUS%252Fen-GB%252FEUR%252Fdhop%252F1%252F9828.13870.2025-10-10%252Fair%252Ftrava%252Fflights%253Fitinerary%253Dflight%25257C-31915%25257C314%25257C9828%25257C2025-10-10T06%25253A00%25257C15116%25257C2025-10-10T09%25253A10%25257C130%25257C-%25257C-%25257C-%25253Bflight%25257C-31915%25257C2514%25257C15116%25257C2025-10-10T11%25253A00%25257C13870%25257C2025-10-10T13%25253A55%25257C235%25257C-%25257C-%25257C-%2526carriers%253D-31915%2526operators%253D-30823%25253B-31915%2526passengers%253D1%2526channel%253Ddataapi%2526cabin_class%253Deconomy%2526fps_session_id%253D4f527b2e-1570-4b74-938c-3c093965b933%2526ticket_price%253D107.10%2526is_npt%253Dfalse%2526is_multipart%253Dfalse%2526client_id%253Dskyscanner_b2b%2526request_id%253D4dc5003b-a47b-427f-b6b8-e315641bf77a%2526q_ids%253DH4sIAAAAAAAA_-OS4mJJycgvEGLmeOIjxcyxLkehYebC42xGTAqMAJNeP9ccAAAA%25257C5755615638798927033%25257C2%2526q_sources%253DJACQUARD%2526commercial_filters%253Dfalse%2526q_datetime_utc%253D2025-07-03T21%25253A48%25253A49%2526transfer_protection%253Dprotected%2526pqid%253Dfalse%2526fare_type%253Dbase_fare%2526api_logo%253Dhttps%25253A%25252F%25252Flogos.skyscnr.com%25252Fimages%25252Fpartners%25252Fdefault.png%2526api_pbs%253Dtrue%2526app_id%253Ddrmo%2525252F%2525252B%2525252BLZWahakSAJkRrfdsE%2525252BxNAAl0Gp6SRtLZpicJX5XC4Nca%2525252Bjff5kzs%2525252BdeFm&impactMediaPartnerId=2988255" rel="nofollow" target="_blank" class="button green">Select</a>
                                </p>
                                <div class="clearfix"></div>
                            </div>
                            <div>
                                <p>Kiwi.com</p>
                                <p>
                                    €113 <a href="https://agw.skyscnr.com/v1/redirect?pageUrl=https%3A%2F%2Fskyscanner.pxf.io%2Fc%2F2988255%2F1103265%2F13416%3Fu%3Dhttps%253A%252F%252Fwww.skyscanner.com%252Ftransport_deeplink%252F4.0%252FUS%252Fen-GB%252FEUR%252Fskyp%252F1%252F9828.13870.2025-10-10%252Fair%252Ftrava%252Fflights%253Fitinerary%253Dflight%25257C-31915%25257C314%25257C9828%25257C2025-10-10T06%25253A00%25257C15116%25257C2025-10-10T09%25253A10%25257C130%25257C-%25257CN%25257C-%25253Bflight%25257C-31915%25257C2514%25257C15116%25257C2025-10-10T11%25253A00%25257C13870%25257C2025-10-10T13%25253A55%25257C235%25257C-%25257CT%25257C-%2526carriers%253D-31915%2526operators%253D-30823%25253B-31915%2526passengers%253D1%2526channel%253Ddataapi%2526cabin_class%253Deconomy%2526fps_session_id%253D4f527b2e-1570-4b74-938c-3c093965b933%2526ticket_price%253D113.05%2526is_npt%253Dfalse%2526is_multipart%253Dfalse%2526client_id%253Dskyscanner_b2b%2526request_id%253D4dc5003b-a47b-427f-b6b8-e315641bf77a%2526q_ids%253DH4sIAAAAAAAA_-OS4mIpzq4sEGLmeOIjxcyxLkehYebC42xGTAqMACU_rzQcAAAA%25257C864450518458680668%25257C2%2526q_sources%253DJACQUARD%2526commercial_filters%253Dfalse%2526q_datetime_utc%253D2025-07-03T21%25253A48%25253A52%2526transfer_protection%253Dprotected%2526pqid%253Dtrue%2526fare_type%253Dbase_fare%2526api_logo%253Dhttps%25253A%25252F%25252Flogos.skyscnr.com%25252Fimages%25252Fpartners%25252Fdefault.png%2526api_pbs%253Dtrue%2526app_id%253Ddrmo%2525252F%2525252B%2525252BLZWahakSAJkRrfdsE%2525252BxNAAl0Gp6SRtLZpicJX5XC4Nca%2525252Bjff5kzs%2525252BdeFm&impactMediaPartnerId=2988255" rel="nofollow" target="_blank" class="button green">Select</a>
                                </p>
                                <div class="clearfix"></div>
                            </div>
                            <div>
                                <p>Mytrip</p>
                                <p>
                                    €121 <a href="https://agw.skyscnr.com/v1/redirect?pageUrl=https%3A%2F%2Fskyscanner.pxf.io%2Fc%2F2988255%2F1103265%2F13416%3Fu%3Dhttps%253A%252F%252Fwww.skyscanner.com%252Ftransport_deeplink%252F4.0%252FUS%252Fen-GB%252FEUR%252Farus%252F1%252F9828.13870.2025-10-10%252Fair%252Ftrava%252Fflights%253Fitinerary%253Dflight%25257C-31915%25257C314%25257C9828%25257C2025-10-10T06%25253A00%25257C15116%25257C2025-10-10T09%25253A10%25257C130%25257C-%25257C-%25257C-%25253Bflight%25257C-31915%25257C2514%25257C15116%25257C2025-10-10T11%25253A00%25257C13870%25257C2025-10-10T13%25253A55%25257C235%25257C-%25257C-%25257C-%2526carriers%253D-31915%2526operators%253D-30823%25253B-31915%2526passengers%253D1%2526channel%253Ddataapi%2526cabin_class%253Deconomy%2526fps_session_id%253D4f527b2e-1570-4b74-938c-3c093965b933%2526ticket_price%253D120.81%2526is_npt%253Dfalse%2526is_multipart%253Dfalse%2526client_id%253Dskyscanner_b2b%2526request_id%253D4dc5003b-a47b-427f-b6b8-e315641bf77a%2526q_ids%253DH4sIAAAAAAAA_-OS52JJLCotFmLmeOIjxcyxLkehYebC42xGTAqMVcyuoUEAiWMsHSEAAAA%25257C5755615638798927033%25257C2%2526q_sources%253DJACQUARD%2526commercial_filters%253Dfalse%2526q_datetime_utc%253D2025-07-03T21%25253A48%25253A52%2526transfer_protection%253Dprotected%2526pqid%253Dtrue%2526fare_type%253Dbase_fare%2526api_logo%253Dhttps%25253A%25252F%25252Flogos.skyscnr.com%25252Fimages%25252Fpartners%25252Fdefault.png%2526api_pbs%253Dtrue%2526app_id%253Ddrmo%2525252F%2525252B%2525252BLZWahakSAJkRrfdsE%2525252BxNAAl0Gp6SRtLZpicJX5XC4Nca%2525252Bjff5kzs%2525252BdeFm&impactMediaPartnerId=2988255" rel="nofollow" target="_blank" class="button green">Select</a>
                                </p>
                                <div class="clearfix"></div>
                            </div>
                            <div>
                                <p>Flightnetwork</p>
                                <p>
                                    €121 <a href="https://agw.skyscnr.com/v1/redirect?pageUrl=https%3A%2F%2Fskyscanner.pxf.io%2Fc%2F2988255%2F1103265%2F13416%3Fu%3Dhttps%253A%252F%252Fwww.skyscanner.com%252Ftransport_deeplink%252F4.0%252FUS%252Fen-GB%252FEUR%252Ffnus%252F1%252F9828.13870.2025-10-10%252Fair%252Ftrava%252Fflights%253Fitinerary%253Dflight%25257C-31915%25257C314%25257C9828%25257C2025-10-10T06%25253A00%25257C15116%25257C2025-10-10T09%25253A10%25257C130%25257C-%25257C-%25257C-%25253Bflight%25257C-31915%25257C2514%25257C15116%25257C2025-10-10T11%25253A00%25257C13870%25257C2025-10-10T13%25253A55%25257C235%25257C-%25257C-%25257C-%2526carriers%253D-31915%2526operators%253D-30823%25253B-31915%2526passengers%253D1%2526channel%253Ddataapi%2526cabin_class%253Deconomy%2526fps_session_id%253D4f527b2e-1570-4b74-938c-3c093965b933%2526ticket_price%253D120.81%2526is_npt%253Dfalse%2526is_multipart%253Dfalse%2526client_id%253Dskyscanner_b2b%2526request_id%253D4dc5003b-a47b-427f-b6b8-e315641bf77a%2526q_ids%253DH4sIAAAAAAAA_-OS52JJyystFmLmeOIjxcyxLkehYebC42xGTAqMVcyuoUEAeKdt_yEAAAA%25257C5755615638798927033%25257C2%2526q_sources%253DJACQUARD%2526commercial_filters%253Dfalse%2526q_datetime_utc%253D2025-07-03T21%25253A48%25253A52%2526transfer_protection%253Dprotected%2526pqid%253Dtrue%2526fare_type%253Dbase_fare%2526api_logo%253Dhttps%25253A%25252F%25252Flogos.skyscnr.com%25252Fimages%25252Fpartners%25252Fdefault.png%2526api_pbs%253Dtrue%2526app_id%253Ddrmo%2525252F%2525252B%2525252BLZWahakSAJkRrfdsE%2525252BxNAAl0Gp6SRtLZpicJX5XC4Nca%2525252Bjff5kzs%2525252BdeFm&impactMediaPartnerId=2988255" rel="nofollow" target="_blank" class="button green">Select</a>
                                </p>
                                <div class="clearfix"></div>
                            </div>
                            <div>
                                <p>Gotogate</p>
                                <p>
                                    €121 <a href="https://agw.skyscnr.com/v1/redirect?pageUrl=https%3A%2F%2Fskyscanner.pxf.io%2Fc%2F2988255%2F1103265%2F13416%3Fu%3Dhttps%253A%252F%252Fwww.skyscanner.com%252Ftransport_deeplink%252F4.0%252FUS%252Fen-GB%252FEUR%252Fgtus%252F1%252F9828.13870.2025-10-10%252Fair%252Ftrava%252Fflights%253Fitinerary%253Dflight%25257C-31915%25257C314%25257C9828%25257C2025-10-10T06%25253A00%25257C15116%25257C2025-10-10T09%25253A10%25257C130%25257C-%25257C-%25257C-%25253Bflight%25257C-31915%25257C2514%25257C15116%25257C2025-10-10T11%25253A00%25257C13870%25257C2025-10-10T13%25253A55%25257C235%25257C-%25257C-%25257C-%2526carriers%253D-31915%2526operators%253D-30823%25253B-31915%2526passengers%253D1%2526channel%253Ddataapi%2526cabin_class%253Deconomy%2526fps_session_id%253D4f527b2e-1570-4b74-938c-3c093965b933%2526ticket_price%253D120.81%2526is_npt%253Dfalse%2526is_multipart%253Dfalse%2526client_id%253Dskyscanner_b2b%2526request_id%253D4dc5003b-a47b-427f-b6b8-e315641bf77a%2526q_ids%253DH4sIAAAAAAAA_-OS52JJLyktFmLmeOIjxcyxLkehYebC42xGTAqMVcyuoUEAXr3xiSEAAAA%25257C5755615638798927033%25257C2%2526q_sources%253DJACQUARD%2526commercial_filters%253Dfalse%2526q_datetime_utc%253D2025-07-03T21%25253A48%25253A52%2526transfer_protection%253Dprotected%2526pqid%253Dtrue%2526fare_type%253Dbase_fare%2526api_logo%253Dhttps%25253A%25252F%25252Flogos.skyscnr.com%25252Fimages%25252Fpartners%25252Fdefault.png%2526api_pbs%253Dtrue%2526app_id%253Ddrmo%2525252F%2525252B%2525252BLZWahakSAJkRrfdsE%2525252BxNAAl0Gp6SRtLZpicJX5XC4Nca%2525252Bjff5kzs%2525252BdeFm&impactMediaPartnerId=2988255" rel="nofollow" target="_blank" class="button green">Select</a>
                                </p>
                                <div class="clearfix"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<div class="list-item row" data-duration="7.7" data-outboundmins="360" data-returnmins="0" data-journey="twostops" data-airline="AIRL000" data-price="36100" data-totalstops="1" data-best="921" data-sortduration="460" style="display:none;">
    <a class="modal_responsive" href="https://agw.skyscnr.com/v1/redirect?pageUrl=https%3A%2F%2Fskyscanner.pxf.io%2Fc%2F2988255%2F1103265%2F13416%3Fu%3Dhttps%253A%252F%252Fwww.skyscanner.com%252Ftransport_deeplink%252F4.0%252FUS%252Fen-GB%252FEUR%252Felin%252F1%252F9828.13870.2025-10-10%252Fair%252Fairli%252Fflights%253Fitinerary%253Dflight%25257C-32132%25257C1770%25257C9828%25257C2025-10-10T06%25253A00%25257C9451%25257C2025-10-10T07%25253A25%25257C85%25257CHHYOCS%25257CV%25257CTURISTA%252BECONOMY%25253Bflight%25257C-32680%25257C1098%25257C9451%25257C2025-10-10T11%25253A00%25257C13870%25257C2025-10-10T13%25253A40%25257C160%25257CHHYOCS%25257CH%25257CTURISTA%252BECONOMY%2526carriers%253D-32132%25252C-32680%2526operators%253D-32132%25253B-32680%2526passengers%253D1%2526channel%253Ddataapi%2526cabin_class%253Deconomy%2526fps_session_id%253D4f527b2e-1570-4b74-938c-3c093965b933%2526ticket_price%253D361.03%2526is_npt%253Dfalse%2526is_multipart%253Dfalse%2526client_id%253Dskyscanner_b2b%2526request_id%253D4dc5003b-a47b-427f-b6b8-e315641bf77a%2526q_ids%253DH4sIAAAAAAAA_-OS4mJJzcnME2LmeOIjxcyxLkehYebC42xGTAqMAPvenLwcAAAA%25257C3871978277134729233%25257C2%2526q_sources%253DJACQUARD%2526commercial_filters%253Dfalse%2526q_datetime_utc%253D2025-07-03T09%25253A34%25253A17%2526pqid%253Dfalse%2526fare_type%253Dbase_fare%2526api_logo%253Dhttps%25253A%25252F%25252Flogos.skyscnr.com%25252Fimages%25252Fpartners%25252Fdefault.png%2526api_pbs%253Dtrue%2526app_id%253Ddrmo%2525252F%2525252B%2525252BLZWahakSAJkRrfdsE%2525252BxNAAl0Gp6SRtLZpicJX5XC4Nca%2525252Bjff5kzs%2525252BdeFm&impactMediaPartnerId=2988255" onclick="$('#myModalX').html($('#myModal1').html());$('#myModalX').modal();return false;" rel="nofollow">
        <div class="col-xs-9 left">
            <div class="item">
                <p class="airlines-name">KLM</p>
                <div class="logo">
                    <p class="_flight_name">KLM + Air Europa</p>
                </div>
                <div class="stops">
                    <p>
                        <span>06:00</span>
                        <span>BER</span>
                    </p>
                    <div class="stop-arrow">
                        <span>7h 40</span>
                        <span class="1-stops">1 stop</span>
                        <span class="hidden-airline-name"></span>
                    </div>
                    <p>
                        <span>13:40</span>
                        <span>MAD</span>
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
                <p class="prices">€361</p>
                <a href="https://agw.skyscnr.com/v1/redirect?pageUrl=https%3A%2F%2Fskyscanner.pxf.io%2Fc%2F2988255%2F1103265%2F13416%3Fu%3Dhttps%253A%252F%252Fwww.skyscanner.com%252Ftransport_deeplink%252F4.0%252FUS%252Fen-GB%252FEUR%252Felin%252F1%252F9828.13870.2025-10-10%252Fair%252Fairli%252Fflights%253Fitinerary%253Dflight%25257C-32132%25257C1770%25257C9828%25257C2025-10-10T06%25253A00%25257C9451%25257C2025-10-10T07%25253A25%25257C85%25257CHHYOCS%25257CV%25257CTURISTA%252BECONOMY%25253Bflight%25257C-32680%25257C1098%25257C9451%25257C2025-10-10T11%25253A00%25257C13870%25257C2025-10-10T13%25253A40%25257C160%25257CHHYOCS%25257CH%25257CTURISTA%252BECONOMY%2526carriers%253D-32132%25252C-32680%2526operators%253D-32132%25253B-32680%2526passengers%253D1%2526channel%253Ddataapi%2526cabin_class%253Deconomy%2526fps_session_id%253D4f527b2e-1570-4b74-938c-3c093965b933%2526ticket_price%253D361.03%2526is_npt%253Dfalse%2526is_multipart%253Dfalse%2526client_id%253Dskyscanner_b2b%2526request_id%253D4dc5003b-a47b-427f-b6b8-e315641bf77a%2526q_ids%253DH4sIAAAAAAAA_-OS4mJJzcnME2LmeOIjxcyxLkehYebC42xGTAqMAPvenLwcAAAA%25257C3871978277134729233%25257C2%2526q_sources%253DJACQUARD%2526commercial_filters%253Dfalse%2526q_datetime_utc%253D2025-07-03T09%25253A34%25253A17%2526pqid%253Dfalse%2526fare_type%253Dbase_fare%2526api_logo%253Dhttps%25253A%25252F%25252Flogos.skyscnr.com%25252Fimages%25252Fpartners%25252Fdefault.png%2526api_pbs%253Dtrue%2526app_id%253Ddrmo%2525252F%2525252B%2525252BLZWahakSAJkRrfdsE%2525252BxNAAl0Gp6SRtLZpicJX5XC4Nca%2525252Bjff5kzs%2525252BdeFm&impactMediaPartnerId=2988255" rel="nofollow" target="_blank">view deal</a>
            </div>
        </div>
    </div>
    <div class="modal" id="myModal1" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
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
                                    <p class="_flight_name">KLM + Air Europa</p>
                                </div>
                                <div class="trip">
                                    <p class="time">
                                        06:00 <span>BER</span>
                                    </p>
                                    <div class="_stops">
                                        <p class="time">7h 40</p>
                                        <ul>
                                            <li></li>
                                        </ul>
                                        <p class="stop">
                                            1 stop <span></span>
                                        </p>
                                    </div>
                                    <p class="time">
                                        13:40 <span>MAD</span>
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
                                        <p>BER Berlin Brandenburg</p>
                                        <p>AMS Amsterdam Schiphol</p>
                                    </div>
                                    <div class="clearfix"></div>
                                    <p class="connect_airport">
                                        <span>3h 35 </span>
                                        Connect in airport
                                    </p>
                                </div>
                            </div>
                            <div class="_panel_body">
                                <div class="_head">
                                    <div></div>
                                    <div>
                                        <small>Air Europa UX1098</small>
                                    </div>
                                </div>
                                <div class="_item">
                                    <div class="clearfix"></div>
                                    <div class="c1">
                                        <p>2h 40</p>
                                    </div>
                                    <div class="c2">
                                        <p></p>
                                    </div>
                                    <div class="c3">
                                        <p>11:00</p>
                                        <p>13:40</p>
                                    </div>
                                    <div class="c4">
                                        <p>AMS Amsterdam Schiphol</p>
                                        <p>MAD Madrid</p>
                                    </div>
                                    <div class="clearfix"></div>
                                    <p class="_summary">
                                        Arrives: <span>Fri, 10 Oct 2025</span>
                                        &nbsp;&middot;&nbsp;Journey Duration: <span>7h 40</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <p class="_heading">
                            <strong>Book Your Ticket</strong>
                        </p>
                        <div class="_similar">
                            <div>
                                <p>Air Europa</p>
                                <p>
                                    €361 <a href="https://agw.skyscnr.com/v1/redirect?pageUrl=https%3A%2F%2Fskyscanner.pxf.io%2Fc%2F2988255%2F1103265%2F13416%3Fu%3Dhttps%253A%252F%252Fwww.skyscanner.com%252Ftransport_deeplink%252F4.0%252FUS%252Fen-GB%252FEUR%252Felin%252F1%252F9828.13870.2025-10-10%252Fair%252Fairli%252Fflights%253Fitinerary%253Dflight%25257C-32132%25257C1770%25257C9828%25257C2025-10-10T06%25253A00%25257C9451%25257C2025-10-10T07%25253A25%25257C85%25257CHHYOCS%25257CV%25257CTURISTA%252BECONOMY%25253Bflight%25257C-32680%25257C1098%25257C9451%25257C2025-10-10T11%25253A00%25257C13870%25257C2025-10-10T13%25253A40%25257C160%25257CHHYOCS%25257CH%25257CTURISTA%252BECONOMY%2526carriers%253D-32132%25252C-32680%2526operators%253D-32132%25253B-32680%2526passengers%253D1%2526channel%253Ddataapi%2526cabin_class%253Deconomy%2526fps_session_id%253D4f527b2e-1570-4b74-938c-3c093965b933%2526ticket_price%253D361.03%2526is_npt%253Dfalse%2526is_multipart%253Dfalse%2526client_id%253Dskyscanner_b2b%2526request_id%253D4dc5003b-a47b-427f-b6b8-e315641bf77a%2526q_ids%253DH4sIAAAAAAAA_-OS4mJJzcnME2LmeOIjxcyxLkehYebC42xGTAqMAPvenLwcAAAA%25257C3871978277134729233%25257C2%2526q_sources%253DJACQUARD%2526commercial_filters%253Dfalse%2526q_datetime_utc%253D2025-07-03T09%25253A34%25253A17%2526pqid%253Dfalse%2526fare_type%253Dbase_fare%2526api_logo%253Dhttps%25253A%25252F%25252Flogos.skyscnr.com%25252Fimages%25252Fpartners%25252Fdefault.png%2526api_pbs%253Dtrue%2526app_id%253Ddrmo%2525252F%2525252B%2525252BLZWahakSAJkRrfdsE%2525252BxNAAl0Gp6SRtLZpicJX5XC4Nca%2525252Bjff5kzs%2525252BdeFm&impactMediaPartnerId=2988255" rel="nofollow" target="_blank" class="button green">Select</a>
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

  it("extracts session data from Phase 1 HTML", () => {
    const session = extractSessionDataFromPhase1Html(phase1Html);
    expect(session).toHaveProperty("token");
    expect(session).toHaveProperty("session");
    expect(session).toHaveProperty("suuid");
    expect(session).toHaveProperty("deeplink");
    expect(session.token).toBe("1XiMiR5s6GbdvkWghMEH6maCeZVGNOXdlINUjVhI");
    expect(session.session).toBe(
      "CrQBS0xVdl9TQ045UU1Ba2tnZEhyRHJETU13YUFVWHdtaFgyV1FhamZGVEpVcWk1Q1I0ekRWb29vTU5BVkFVSUpiOFo4ZzQyekxxOUcyVnpXT1ZNNzVDNkUxSGY5UjFZVW9CR050dFdzWVJqTVBZVmU5Vy04cVJhWlc5Tk90azlzWDVreU1nM250TDNHOTZydFIzLUdveHpnb2J1anJ2dVJPcm1RelBJQldBTUEwQkFRQ1BvRUFCIi0KAlVTEgVlbi1HQhoDRVVSIhcKBQoDQkVSEgUKA01BRBoHCOkPEAoYCigBMAEqJGVkNzhhMDA4LWE1OTUtNGEzZi1iNWFiLWMyZTk2YjI3MTAwMA==-cells1"
    );
    expect(session.suuid).toBe("7d9fa5a8-853d-4782-81cd-f5cd064faec8");
    expect(session.deeplink).toBe(
      "https://www.tkqlhce.com/click-3476948-11839040-1440520708000?sid=cff&amp;url=https://www.skyscanner.net/transport/flights/BER/MAD/251010/?adults=1&amp;adultsv2=1&amp;children=0&amp;infants=0&amp;cabinclass=Economy&amp;rtn=1&amp;currency=EUR"
    );
  });

  it("handles HTML without session data gracefully", () => {
    const htmlWithoutSession = `<html><body><script>var x = 1;</script></body></html>`;
    const session = extractSessionDataFromPhase1Html(htmlWithoutSession);
    expect(session.token).toBe("");
    expect(session.session).toBe("");
    expect(session.suuid).toBe("");
    expect(session.deeplink).toBe("");
  });

  it("extracts flights from Phase 2 HTML", () => {
    const flights = extractFlightsFromPhase2Html(phase2Html);
    expect(Array.isArray(flights)).toBe(true);
    expect(flights.length).toBeGreaterThan(0);

    // Check first flight structure
    const firstFlight = flights[0];
    expect(firstFlight).toHaveProperty("uniqueId");
    expect(firstFlight).toHaveProperty("flightNumber");
    expect(firstFlight).toHaveProperty("departureAirportId");
    expect(firstFlight).toHaveProperty("arrivalAirportId");
    expect(firstFlight).toHaveProperty("departureDateTime");
    expect(firstFlight).toHaveProperty("arrivalDateTime");

    // Check that uniqueId follows expected pattern
    expect(firstFlight.uniqueId).toMatch(
      /^flight_[A-Z0-9]+_[A-Z]{3}_[A-Z]{3}$/
    );
  });

  it("extracts bundles from Phase 2 HTML", () => {
    const bundles = extractBundlesFromPhase2Html(phase2Html);
    expect(Array.isArray(bundles)).toBe(true);
    expect(bundles.length).toBeGreaterThan(0);

    // Check first bundle structure
    const firstBundle = bundles[0];
    expect(firstBundle).toHaveProperty("uniqueId");
    expect(firstBundle).toHaveProperty("outboundFlightUniqueIds");
    expect(firstBundle).toHaveProperty("inboundFlightUniqueIds");
    expect(Array.isArray(firstBundle.outboundFlightUniqueIds)).toBe(true);
    expect(Array.isArray(firstBundle.inboundFlightUniqueIds)).toBe(true);

    // Check that uniqueId follows expected pattern
    expect(firstBundle.uniqueId).toMatch(/^bundle_[A-Z0-9-]+_[0-9.]+_[0-9]+$/);
  });

  it("extracts booking options from Phase 2 HTML", () => {
    const bookingOptions = extractBookingOptionsFromPhase2Html(phase2Html);
    expect(Array.isArray(bookingOptions)).toBe(true);
    expect(bookingOptions.length).toBeGreaterThan(0);

    // Check first booking option structure
    const firstBooking = bookingOptions[0];
    expect(firstBooking).toHaveProperty("uniqueId");
    expect(firstBooking).toHaveProperty("targetUniqueId");
    expect(firstBooking).toHaveProperty("agency");
    expect(firstBooking).toHaveProperty("price");
    expect(firstBooking).toHaveProperty("linkToBook");
    expect(firstBooking).toHaveProperty("currency");
    expect(firstBooking).toHaveProperty("extractedAt");

    // Check that uniqueId follows expected pattern
    expect(firstBooking.uniqueId).toMatch(/^booking_[A-Za-z.]+_[0-9]+$/);
    expect(firstBooking.currency).toBe("EUR");
    expect(typeof firstBooking.price).toBe("number");
    expect(firstBooking.price).toBeGreaterThan(0);
  });
});

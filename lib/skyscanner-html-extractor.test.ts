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

  const phase2Html = `<html><body><!-- TODO: Add real Phase 2 sample HTML here --></body></html>`;

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
    // TODO: Add more specific assertions when sample HTML is available
  });

  it("extracts bundles from Phase 2 HTML", () => {
    const bundles = extractBundlesFromPhase2Html(phase2Html);
    expect(Array.isArray(bundles)).toBe(true);
    // TODO: Add more specific assertions when sample HTML is available
  });

  it("extracts booking options from Phase 2 HTML", () => {
    const bookingOptions = extractBookingOptionsFromPhase2Html(phase2Html);
    expect(Array.isArray(bookingOptions)).toBe(true);
    // TODO: Add more specific assertions when sample HTML is available
  });
});

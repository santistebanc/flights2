import {
  extractSessionDataFromPhase1Html,
  extractFlightsFromPhase2Html,
  extractBundlesFromPhase2Html,
  extractBookingOptionsFromPhase2Html,
} from "./kiwi-html-extractor";

describe("kiwi-html-extractor", () => {
  const phase1Html = `
    <html>
      <head>
      <title>Find Prices...</title>
      <script>
        // Other scripts...
      </script>
      </head>
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
            pollSession: function () {
                //$('#msgoverlay', parent.document).fadeOut(200);
                $.ajax({type: 'POST', url: '/portal/kiwi/search',
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
                                CFFLive.results_added = true;
                                $('#tb-best-price').html('-');
                                $('#tb-best-time').html('-');
                                $('#tb-cheapest-price').html('-');
                                $('#tb-cheapest-time').html('-');
                                $('#tb-fastest-price').html('-');
                                $('#tb-fastest-time').html('-');

                                $('#found_zone').html('<span>No Results Found</span>');
                                $('.jplist-pagination').hide();
                                $('#results').html('<p>No results found. Please change destination or dates.</p>');
                            }
                        } else {
                            if (parseInt(resp_array[1]) != 0) {
                                //$('.loading-iframe p', parent.document).html('Loading results, please wait (found ' + resp_array[1] + ')...');
                                $('#found_zone').html('<span>Searching (found ' + resp_array[1] + ')...</span>');
                            }
                            //setTimeout(CFFLive.pollSession, 100);
                        }
                    },
                    data: {
                        '_token': '1XiMiR5s6GbdvkWghMEH6maCeZVGNOXdlINUjVhI',
                        'originplace': 'BER',
                        'destinationplace': 'MAD',
                        'outbounddate': '10/10/2025',
                        'inbounddate': '',
                        'cabinclass': 'M',
                        'adults': '1',
                        'children': '0',
                        'infants': '0',
                        'currency': 'EUR',
                        'type': 'oneway',
                        'bags-cabin': '0',
                        'bags-checked': '0',
                    }
                });
            }
        };

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
    expect(session.token).toBe("1XiMiR5s6GbdvkWghMEH6maCeZVGNOXdlINUjVhI");
  });

  it("handles HTML without token gracefully", () => {
    const htmlWithoutToken = `<html><body><script>var x = 1;</script></body></html>`;
    const session = extractSessionDataFromPhase1Html(htmlWithoutToken);
    expect(session.token).toBe("");
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

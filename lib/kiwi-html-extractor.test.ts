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

  const phase2Html = `<div class="list-item row" data-duration="14.8" data-outboundmins="1300" data-returnmins="0" data-journey="onestop" data-airline="AIRLEI" data-airline2="AIRLI2" data-airline3="AIRL" data-airline4="AIRL" data-price="9900" data-totalstops="1" data-best="1089" style="display: none;">
    <a class="modal_responsive" href="https://www.kiwi.com/deep?affilid=cffinternationalltdapi&currency=EUR&flightsId=0042125b4f930000256f42aa_0%7C125b0a224f940000239dc77c_0&from=BER&lang=en&passengers=1&searchBags=0.0&to=MAD&booking_token=HdsO_QwxgBE1AVfGfgUNUw5SPcQQII0n9FAOPcml5-t311qiZQ-1ezmcU9xt3sNtnk-lqMXbMlX8fM24JdpR27BTbwxnM19iEct_4blJoAAzRo3FoiEdRjPdRKTCqRdn_o2gWCxh6TAyQ6l5EzYEUNZfq08dON0riKR08HDV5nymt-8923Qe-j91d1kkv76bbsfTR3b3TDq8Vx07ZZyxMTlnPadzxMVIGvxAguYrkM19ccz8bIilUndjnWUUbjA02xcouax52g6lABB8sNMLykBdYoBz8XbpVdD2buOCzFA2GT0WLbzi0735xtmWB11YIDt8ojjw8t4WaLLPdkRtR52Oz0LGGGAUXM8iIIgE2kIe3gda8ix_9Mmwcqt9nX7c8qnX_Bk5-4vj_FFPwqyAd4k0JWGh5D2X9k_7qm6Qxtb5iwVbG3J66jp9FPFA-hEulfBG-_HZPu4aVyaHnaMHvjWdBlktqyABiY-boqRMJXYDYBPwd0NrIA14aTEFBsJf9Mn2eV5fl3P4xX0CZN-2iFOAZ_-t6-XrfdWifrgdh9eTQ-jULoIaZus83-JpBLln7s40SIvjqhonNTBoX13-ba5BwJ0flhXhaNoAMqZBk8rTamRZ5zLIWIonKMUOtfuUamOfVdAkT5wQxyKNK6IoRIff43cfRHEKuIEcECaOhcjZB7TIRwGeJLRBaAeWZhPD-hc8aB2NWahNXjnNIFmVN3x1KKi0lJOP9OIBMcXJVXp0Ht9E9co_VR5XUCG9j6WFP9SwYIzPKbcdruJEcgLsTY2vp8ZSNcnB48UgtsdKt24_WNJyqZcmeA0fPvrL42cal1h8FT67MPxHrgw2w1s3eToH8di2CUKpuoegdsm0l3Pem5rwksWSTgkKTApaX9JnjgEw3e4aAMyuFV97D8B6PD-RLT7qQt7bTpOB6oaqy9qDoK_eZwQtmupPxE6InIJfmFfWJvv5Xqc4_xmSYY4W85WYFcbJRLjBxh5Y8JYaUuMWqbQb6sL5O3YTLiQHcIO9n" rel="nofollow" onclick="$('#myModalX').html($('#myModal0').html());$('#myModalX').modal();return false;">
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
        </div>
    </a>
    <div class="col-xs-3 right">
        <div class="price">
            <img src="/static/portal-kiwi/images/space.png" alt="">
            <div class="price-summary">
                <p></p>
                <p class="prices">€99</p>
                <a href="https://www.kiwi.com/deep?affilid=cffinternationalltdapi&currency=EUR&flightsId=0042125b4f930000256f42aa_0%7C125b0a224f940000239dc77c_0&from=BER&lang=en&passengers=1&searchBags=0.0&to=MAD&booking_token=HdsO_QwxgBE1AVfGfgUNUw5SPcQQII0n9FAOPcml5-t311qiZQ-1ezmcU9xt3sNtnk-lqMXbMlX8fM24JdpR27BTbwxnM19iEct_4blJoAAzRo3FoiEdRjPdRKTCqRdn_o2gWCxh6TAyQ6l5EzYEUNZfq08dON0riKR08HDV5nymt-8923Qe-j91d1kkv76bbsfTR3b3TDq8Vx07ZZyxMTlnPadzxMVIGvxAguYrkM19ccz8bIilUndjnWUUbjA02xcouax52g6lABB8sNMLykBdYoBz8XbpVdD2buOCzFA2GT0WLbzi0735xtmWB11YIDt8ojjw8t4WaLLPdkRtR52Oz0LGGGAUXM8iIIgE2kIe3gda8ix_9Mmwcqt9nX7c8qnX_Bk5-4vj_FFPwqyAd4k0JWGh5D2X9k_7qm6Qxtb5iwVbG3J66jp9FPFA-hEulfBG-_HZPu4aVyaHnaMHvjWdBlktqyABiY-boqRMJXYDYBPwd0NrIA14aTEFBsJf9Mn2eV5fl3P4xX0CZN-2iFOAZ_-t6-XrfdWifrgdh9eTQ-jULoIaZus83-JpBLln7s40SIvjqhonNTBoX13-ba5BwJ0flhXhaNoAMqZBk8rTamRZ5zLIWIonKMUOtfuUamOfVdAkT5wQxyKNK6IoRIff43cfRHEKuIEcECaOhcjZB7TIRwGeJLRBaAeWZhPD-hc8aB2NWahNXjnNIFmVN3x1KKi0lJOP9OIBMcXJVXp0Ht9E9co_VR5XUCG9j6WFP9SwYIzPKbcdruJEcgLsTY2vp8ZSNcnB48UgtsdKt24_WNJyqZcmeA0fPvrL42cal1h8FT67MPxHrgw2w1s3eToH8di2CUKpuoegdsm0l3Pem5rwksWSTgkKTApaX9JnjgEw3e4aAMyuFV97D8B6PD-RLT7qQt7bTpOB6oaqy9qDoK_eZwQtmupPxE6InIJfmFfWJvv5Xqc4_xmSYY4W85WYFcbJRLjBxh5Y8JYaUuMWqbQb6sL5O3YTLiQHcIO9n" rel="nofollow" target="_blank">view deal</a>
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
                            <strong>Book Your Ticket</strong>
                        </p>
                        <div class="_similar">
                            <div>
                                <p>Kiwi.com</p>
                                <p>
                                    €99 <a href="https://www.kiwi.com/deep?affilid=cffinternationalltdapi&currency=EUR&flightsId=0042125b4f930000256f42aa_0%7C125b0a224f940000239dc77c_0&from=BER&lang=en&passengers=1&searchBags=0.0&to=MAD&booking_token=HdsO_QwxgBE1AVfGfgUNUw5SPcQQII0n9FAOPcml5-t311qiZQ-1ezmcU9xt3sNtnk-lqMXbMlX8fM24JdpR27BTbwxnM19iEct_4blJoAAzRo3FoiEdRjPdRKTCqRdn_o2gWCxh6TAyQ6l5EzYEUNZfq08dON0riKR08HDV5nymt-8923Qe-j91d1kkv76bbsfTR3b3TDq8Vx07ZZyxMTlnPadzxMVIGvxAguYrkM19ccz8bIilUndjnWUUbjA02xcouax52g6lABB8sNMLykBdYoBz8XbpVdD2buOCzFA2GT0WLbzi0735xtmWB11YIDt8ojjw8t4WaLLPdkRtR52Oz0LGGGAUXM8iIIgE2kIe3gda8ix_9Mmwcqt9nX7c8qnX_Bk5-4vj_FFPwqyAd4k0JWGh5D2X9k_7qm6Qxtb5iwVbG3J66jp9FPFA-hEulfBG-_HZPu4aVyaHnaMHvjWdBlktqyABiY-boqRMJXYDYBPwd0NrIA14aTEFBsJf9Mn2eV5fl3P4xX0CZN-2iFOAZ_-t6-XrfdWifrgdh9eTQ-jULoIaZus83-JpBLln7s40SIvjqhonNTBoX13-ba5BwJ0flhXhaNoAMqZBk8rTamRZ5zLIWIonKMUOtfuUamOfVdAkT5wQxyKNK6IoRIff43cfRHEKuIEcECaOhcjZB7TIRwGeJLRBaAeWZhPD-hc8aB2NWahNXjnNIFmVN3x1KKi0lJOP9OIBMcXJVXp0Ht9E9co_VR5XUCG9j6WFP9SwYIzPKbcdruJEcgLsTY2vp8ZSNcnB48UgtsdKt24_WNJyqZcmeA0fPvrL42cal1h8FT67MPxHrgw2w1s3eToH8di2CUKpuoegdsm0l3Pem5rwksWSTgkKTApaX9JnjgEw3e4aAMyuFV97D8B6PD-RLT7qQt7bTpOB6oaqy9qDoK_eZwQtmupPxE6InIJfmFfWJvv5Xqc4_xmSYY4W85WYFcbJRLjBxh5Y8JYaUuMWqbQb6sL5O3YTLiQHcIO9n" rel="nofollow" target="_blank" class="button green">Select</a>
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
<div class="list-item row" data-duration="25.5" data-outboundmins="435" data-returnmins="0" data-journey="twostops" data-airline="AIRLU2" data-airline2="AIRLVY" data-airline3="AIRLW4" data-airline4="AIRL" data-price="10500" data-totalstops="2" data-best="1835" style="display: none;">
    <a class="modal_responsive" href="https://www.kiwi.com/deep?affilid=cffinternationalltdapi&currency=EUR&flightsId=004200094f930000b7f92f02_0%7C00090f0c4f9300006c680046_0%7C0f0c0a224f9400007efa26d7_0&from=BER&lang=en&passengers=1&searchBags=0.0&to=MAD&booking_token=H3UrYAZ26FEopfn0yGfG-O-pWiuAlpoaKmYQ8j2Go_rsn0amAuJ3qeOx0O1k89kl85rAyNLxJfjvfCYhh0_1vGu7cqeEmOhxWBs6mTxFgxLitOFJ74gNFLpO75qCjE9LSdbVJD6RvVFUN757H3Lwb7JNeM1rnp9K36YLvhA-lIUvm4TCZKX7axIEi-2XhtU4iJljqeXKeA9_BE0iWEd500bcr23NAKwVW8gInIb47O2il5DhNddx3IBzuaIxu-qEQmEV-hc8tOFCv0irYpriFW3K04zGSMmyUeZTsVxwN4Chw9UT5sjZcmXGPBS6qFHR1vfIf-FPy9UQb1Fln2ly9DgoDb23HC95kcJgYqKfisw9GBFmIKLT0b36azyDh0LULlBKJb1ReLM0nz3p_LuHKYpS5JnHIg2frAP0jMdVSjIvxy_HwDdTpDGibNJwQoKWgb4eYuyK0m9DSFR2mkFKamaEgEADNhVF3kszRhCbRA0HiiOPcWUOMSTclz8sWdlPeQPzrEMHOaZ5MSYVte7f8S9fsiFleZ7Us5PtR2zfeBaY730fVt8UrzZxoKgVfUlEk0Hfpd4QwMuP0VD-2bR8UrswOxt8YLXgQlq8yktixLC0xyurs02wRCRgEHwiVFqefMPXT5Ux7KlxJ3hyz8mzEPbhOXEPubLS11wxLNhIvmanlXgjmjzYE2nQZnyCQ4or64uEi41cepL3MU9PhkiURkLO6L03gDLogFzwVBBSw1z4S8hY6c8Kmgl3iZAUFhIUOI4EZgxgfsaY_HBxuBIDHlHba8yNUsIT3-8Fhz0qX3H6NppfdsKysdFgBO4UCu2okl717QuNe8iRDtYt9_SjDDSsQ4dkKfnBYM7SeWpzBEGc6y4juOBQBtbuglF_Pt7LtkvIWVKRoSzJGMlA2jTGnGKoU9jJ-fNsGXALze4HT_NYkGPs6qcTzhVwQ3Mh5T2oreuFrymhpnAVB_CEdYNKiTTEMUTV6Rc91RGk2E01oLcyBxelLol_R7NTDxE6kguX03pz_MUANchjM1DlIzcDMYQCFIExibgYuHSLycf9Sbhw=" rel="nofollow" onclick="$('#myModalX').html($('#myModal1').html());$('#myModalX').modal();return false;">
        <div class="col-xs-9 left">
            <div class="item">
                <p class="airlines-name">easyJet + Vueling</p>
                <div class="logo">
                    <img src="https://images.kiwi.com/airlines/64/U2.png" alt="easyJet" title="easyJet">
                    <img src="https://images.kiwi.com/airlines/64/VY.png" alt="Vueling" title="Vueling">
                    <p>Additional carriers: Wizz Air Malta</p>
                </div>
                <div class="stops">
                    <p>
                        <span>07:15</span>
                        <span>BER</span>
                    </p>
                    <div class="stop-arrow">
                        <span>25h 30</span>
                        <span class="1-stops">2 stops</span>
                        <span class="hidden-airline-name"></span>
                    </div>
                    <p>
                        <span>08:45</span>
                        <span>MAD</span>
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
                <p class="prices">€105</p>
                <a href="https://www.kiwi.com/deep?affilid=cffinternationalltdapi&currency=EUR&flightsId=004200094f930000b7f92f02_0%7C00090f0c4f9300006c680046_0%7C0f0c0a224f9400007efa26d7_0&from=BER&lang=en&passengers=1&searchBags=0.0&to=MAD&booking_token=H3UrYAZ26FEopfn0yGfG-O-pWiuAlpoaKmYQ8j2Go_rsn0amAuJ3qeOx0O1k89kl85rAyNLxJfjvfCYhh0_1vGu7cqeEmOhxWBs6mTxFgxLitOFJ74gNFLpO75qCjE9LSdbVJD6RvVFUN757H3Lwb7JNeM1rnp9K36YLvhA-lIUvm4TCZKX7axIEi-2XhtU4iJljqeXKeA9_BE0iWEd500bcr23NAKwVW8gInIb47O2il5DhNddx3IBzuaIxu-qEQmEV-hc8tOFCv0irYpriFW3K04zGSMmyUeZTsVxwN4Chw9UT5sjZcmXGPBS6qFHR1vfIf-FPy9UQb1Fln2ly9DgoDb23HC95kcJgYqKfisw9GBFmIKLT0b36azyDh0LULlBKJb1ReLM0nz3p_LuHKYpS5JnHIg2frAP0jMdVSjIvxy_HwDdTpDGibNJwQoKWgb4eYuyK0m9DSFR2mkFKamaEgEADNhVF3kszRhCbRA0HiiOPcWUOMSTclz8sWdlPeQPzrEMHOaZ5MSYVte7f8S9fsiFleZ7Us5PtR2zfeBaY730fVt8UrzZxoKgVfUlEk0Hfpd4QwMuP0VD-2bR8UrswOxt8YLXgQlq8yktixLC0xyurs02wRCRgEHwiVFqefMPXT5Ux7KlxJ3hyz8mzEPbhOXEPubLS11wxLNhIvmanlXgjmjzYE2nQZnyCQ4or64uEi41cepL3MU9PhkiURkLO6L03gDLogFzwVBBSw1z4S8hY6c8Kmgl3iZAUFhIUOI4EZgxgfsaY_HBxuBIDHlHba8yNUsIT3-8Fhz0qX3H6NppfdsKysdFgBO4UCu2okl717QuNe8iRDtYt9_SjDDSsQ4dkKfnBYM7SeWpzBEGc6y4juOBQBtbuglF_Pt7LtkvIWVKRoSzJGMlA2jTGnGKoU9jJ-fNsGXALze4HT_NYkGPs6qcTzhVwQ3Mh5T2oreuFrymhpnAVB_CEdYNKiTTEMUTV6Rc91RGk2E01oLcyBxelLol_R7NTDxE6kguX03pz_MUANchjM1DlIzcDMYQCFIExibgYuHSLycf9Sbhw=" rel="nofollow" target="_blank">view deal</a>
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
                                    <p class="_ahn">easyJet + Vueling</p>
                                    <img src="https://images.kiwi.com/airlines/64/U2.png" alt="easyJet" title="easyJet">
                                    <img src="https://images.kiwi.com/airlines/64/VY.png" alt="Vueling" title="Vueling">
                                    <p>Additional carriers: Wizz Air Malta</p>
                                </div>
                                <div class="trip">
                                    <p class="time">
                                        07:15 <span>BER</span>
                                    </p>
                                    <div class="_stops">
                                        <p class="time">25h 30</p>
                                        <ul>
                                            <li></li>
                                            <li></li>
                                        </ul>
                                        <p class="stop">2 stops</p>
                                    </div>
                                    <p class="time">
                                        08:45 <span>MAD</span>
                                    </p>
                                </div>
                                <div class="clearfix"></div>
                            </div>
                            <div class="_panel_body">
                                <div class="_head">
                                    <div></div>
                                    <div>
                                        <small>easyJet U2 5213</small>
                                    </div>
                                </div>
                                <div class="_item">
                                    <div class="clearfix"></div>
                                    <div class="c1">
                                        <p>1h 50</p>
                                    </div>
                                    <div class="c2">
                                        <p></p>
                                    </div>
                                    <div class="c3">
                                        <p>07:15</p>
                                        <p>09:05</p>
                                    </div>
                                    <div class="c4">
                                        <p>BER Berlin</p>
                                        <p>SPU Split</p>
                                    </div>
                                    <div class="clearfix"></div>
                                    <p class="connect_airport">
                                        <span>11h 45 </span>
                                        Connection
                                    </p>
                                </div>
                            </div>
                            <div class="_panel_body">
                                <div class="_head">
                                    <div></div>
                                    <div>
                                        <small>Vueling VY 6723</small>
                                    </div>
                                </div>
                                <div class="_item">
                                    <div class="clearfix"></div>
                                    <div class="c1">
                                        <p>1h 10</p>
                                    </div>
                                    <div class="c2">
                                        <p></p>
                                    </div>
                                    <div class="c3">
                                        <p>20:50</p>
                                        <p>22:00</p>
                                    </div>
                                    <div class="c4">
                                        <p>SPU Split</p>
                                        <p>FCO Rome</p>
                                    </div>
                                    <div class="clearfix"></div>
                                    <p class="connect_airport">
                                        <span>8h 05 </span>
                                        Connection
                                    </p>
                                </div>
                            </div>
                            <div class="_panel_body">
                                <div class="_head">
                                    <div></div>
                                    <div>
                                        <small>Wizz Air Malta W4 6011</small>
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
                                        <p>06:05</p>
                                        <p>08:45</p>
                                    </div>
                                    <div class="c4">
                                        <p>FCO Rome</p>
                                        <p>MAD Madrid</p>
                                    </div>
                                    <div class="clearfix"></div>
                                    <p class="_summary">
                                        Arrives: <span>Sat, 11 Oct 2025</span>
                                        &nbsp;&middot;&nbsp;Journey Duration: <span>25h 30</span>
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
                                    €105 <a href="https://www.kiwi.com/deep?affilid=cffinternationalltdapi&currency=EUR&flightsId=004200094f930000b7f92f02_0%7C00090f0c4f9300006c680046_0%7C0f0c0a224f9400007efa26d7_0&from=BER&lang=en&passengers=1&searchBags=0.0&to=MAD&booking_token=H3UrYAZ26FEopfn0yGfG-O-pWiuAlpoaKmYQ8j2Go_rsn0amAuJ3qeOx0O1k89kl85rAyNLxJfjvfCYhh0_1vGu7cqeEmOhxWBs6mTxFgxLitOFJ74gNFLpO75qCjE9LSdbVJD6RvVFUN757H3Lwb7JNeM1rnp9K36YLvhA-lIUvm4TCZKX7axIEi-2XhtU4iJljqeXKeA9_BE0iWEd500bcr23NAKwVW8gInIb47O2il5DhNddx3IBzuaIxu-qEQmEV-hc8tOFCv0irYpriFW3K04zGSMmyUeZTsVxwN4Chw9UT5sjZcmXGPBS6qFHR1vfIf-FPy9UQb1Fln2ly9DgoDb23HC95kcJgYqKfisw9GBFmIKLT0b36azyDh0LULlBKJb1ReLM0nz3p_LuHKYpS5JnHIg2frAP0jMdVSjIvxy_HwDdTpDGibNJwQoKWgb4eYuyK0m9DSFR2mkFKamaEgEADNhVF3kszRhCbRA0HiiOPcWUOMSTclz8sWdlPeQPzrEMHOaZ5MSYVte7f8S9fsiFleZ7Us5PtR2zfeBaY730fVt8UrzZxoKgVfUlEk0Hfpd4QwMuP0VD-2bR8UrswOxt8YLXgQlq8yktixLC0xyurs02wRCRgEHwiVFqefMPXT5Ux7KlxJ3hyz8mzEPbhOXEPubLS11wxLNhIvmanlXgjmjzYE2nQZnyCQ4or64uEi41cepL3MU9PhkiURkLO6L03gDLogFzwVBBSw1z4S8hY6c8Kmgl3iZAUFhIUOI4EZgxgfsaY_HBxuBIDHlHba8yNUsIT3-8Fhz0qX3H6NppfdsKysdFgBO4UCu2okl717QuNe8iRDtYt9_SjDDSsQ4dkKfnBYM7SeWpzBEGc6y4juOBQBtbuglF_Pt7LtkvIWVKRoSzJGMlA2jTGnGKoU9jJ-fNsGXALze4HT_NYkGPs6qcTzhVwQ3Mh5T2oreuFrymhpnAVB_CEdYNKiTTEMUTV6Rc91RGk2E01oLcyBxelLol_R7NTDxE6kguX03pz_MUANchjM1DlIzcDMYQCFIExibgYuHSLycf9Sbhw=" rel="nofollow" target="_blank" class="button green">Select</a>
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
    expect(firstBundle.uniqueId).toMatch(/^bundle_[A-Z0-9]+_[0-9.]+_[0-9]+$/);
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

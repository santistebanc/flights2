// Show expected output structure based on the HTML content
console.log("=== EXPECTED EXTRACTOR OUTPUT ===");
console.log();

console.log("1. Session Data from Phase 1 HTML:");
console.log(JSON.stringify({
    token: "1XiMiR5s6GbdvkWghMEH6maCeZVGNOXdlINUjVhI"
}, null, 2));
console.log();

console.log("2. Flights from Phase 2 HTML:");
console.log(JSON.stringify([
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
    },
    {
        uniqueId: "flight_U25213_BER_SPU",
        flightNumber: "U25213",
        departureAirportIataCode: "BER",
        arrivalAirportIataCode: "SPU",
        departureDate: "2025-10-10",
        departureTime: "07:15",
        duration: 110
    },
    {
        uniqueId: "flight_VY6723_SPU_FCO",
        flightNumber: "VY6723",
        departureAirportIataCode: "SPU",
        arrivalAirportIataCode: "FCO",
        departureDate: "2025-10-10",
        departureTime: "20:50",
        duration: 70
    },
    {
        uniqueId: "flight_W46011_FCO_MAD",
        flightNumber: "W46011",
        departureAirportIataCode: "FCO",
        arrivalAirportIataCode: "MAD",
        departureDate: "2025-10-11",
        departureTime: "06:05",
        duration: 160
    }
], null, 2));
console.log();

console.log("3. Bundles from Phase 2 HTML:");
console.log(JSON.stringify([
    {
        uniqueId: "bundle_flight_EI337_BER_DUB_flight_I21882_DUB_MAD_flight_I21801_MAD_BER",
        outboundFlightUniqueIds: [
            "flight_EI337_BER_DUB",
            "flight_I21882_DUB_MAD"
        ],
        inboundFlightUniqueIds: [
            "flight_I21801_MAD_BER"
        ]
    },
    {
        uniqueId: "bundle_flight_U25213_BER_SPU_flight_VY6723_SPU_FCO_flight_W46011_FCO_MAD_flight_I21801_MAD_BER",
        outboundFlightUniqueIds: [
            "flight_U25213_BER_SPU",
            "flight_VY6723_SPU_FCO",
            "flight_W46011_FCO_MAD"
        ],
        inboundFlightUniqueIds: [
            "flight_I21801_MAD_BER"
        ]
    }
], null, 2));
console.log();

console.log("4. Booking Options from Phase 2 HTML:");
console.log(JSON.stringify([
    {
        uniqueId: "booking_bundle_flight_EI337_BER_DUB_flight_I21882_DUB_MAD_flight_I21801_MAD_BER_Kiwi.com_164_EUR",
        targetUniqueId: "bundle_flight_EI337_BER_DUB_flight_I21882_DUB_MAD_flight_I21801_MAD_BER",
        agency: "Kiwi.com",
        price: 164,
        linkToBook: "https://www.kiwi.com/deep?affilid=cffinternationalltdapi&currency=EUR&flightsId=0042125b4f930000256f42aa_0%7C125b0a224f940000239dc77c_0%7C0a2200424f9d00009b45b57b_0&from=BER&lang=en&passengers=1&searchBags=0.0&to=MAD&booking_token=H54HKhdljx3l2aWj3FIKtQL8_hTty_ohrkFk267rOSLnc4ea_2hBc2iSzqWm3_RwgNcTb_FuEmxI2Xt26aBb7CBi54XIML8yBT2HMgu0-uDN1HCwlyhR6VOQTkKFPscO2g3biemvIVaSBsk0iAfAh2HdsupXAagzPONmBIGqDNVhEz60_rfee8Bsf-MwbsIq3u6NPa-YrGBTtUjbmLrioe46A3S_7jpXRbkkiUCuD6bAY2zF4MsVwquLyNKcOQPWjWePVgTesoAFeQhhAmnVpaXFLdMAbP7kXG_5FHqo9Y67Ve5IR2AxMmJDwKeUizpYwqLqpSJl-7sXanyq10AS4WyCobZ8yHTNjoUXoXbHZpSlHen4uhATBQvqPPW-E0SzSCthrgWOKiOr0Y5QMSuAIIW-tSRUlr1ZpSja17e5VrLJVRKO-1cwiTcIVm3rVibA2LkjhP124nMQVLjfUJxs9lafD5opPRe6NCZzKhvPFULQlAcQmJtkQLrP30GOsA6tI-OY510IV8X93HdVWidG7ktrOiaEkLq_F5_oIQlxTCTeKD9N6jMfTSi3_Tvtvzif92NK1Emn_YE02F_fRfcFJkFoOdcpW7AQcQpP95GmYMG3FfwFPhf99NDaixBd_bhNyATZFr8PLzgxtMCauig3K9Hvx4qM_Y-xT-6Cx08gBUelCc-iaUIAFkrT7o6kdKoWclyRM20QVtXc6m8S5ltTJ73MJ4yEx5r9DdeuJ5a-j6teXmqd7d28ksWANK07AP2vuYGZ8PMb-QlkWE6ytrSU3IxyxZRmiuxNMp_uzDZHAVwn72A0FgS0r3hfCQcTIzqOvUaX5vRooLFT6U0EDd82BAO7EyPcgfIDvZJqghvoH7vQCjY25uCFtjqMX8SJEYfzqA0azibs7WmY4z63he1nXnLJQmCAMi6stYwm4cz_Nw_LnIvcLGsxsH4O931khmucGR8G6ZqkUSPwvUc6mwKMyYTNZGFdruFbNH987GRQIqQeaww3Ji0aiRjKY5FQUeKkk2649RQ6ZoG1xGBJANMd6kDocWAUDW9FbCAvp7IWSC8IKlF22jjE_fWtyxfzJN9pI_GYamlIyN2mtP7vO1RUbFg==",
        currency: "EUR",
        extractedAt: "2025-01-27T12:00:00.000Z"
    },
    {
        uniqueId: "booking_bundle_flight_U25213_BER_SPU_flight_VY6723_SPU_FCO_flight_W46011_FCO_MAD_flight_I21801_MAD_BER_Kiwi.com_170_EUR",
        targetUniqueId: "bundle_flight_U25213_BER_SPU_flight_VY6723_SPU_FCO_flight_W46011_FCO_MAD_flight_I21801_MAD_BER",
        agency: "Kiwi.com",
        price: 170,
        linkToBook: "https://www.kiwi.com/deep?affilid=cffinternationalltdapi&currency=EUR&flightsId=004200094f930000b7f92f02_0%7C00090f0c4f9300006c680046_0%7C0f0c0a224f9400007efa26d7_0%7C0a2200424f9d00009b45b57b_0&from=BER&lang=en&passengers=1&searchBags=0.0&to=MAD&booking_token=HphiKgyMur5zl5srqVwlsaUSNsYt7uX_rjj0abCMZfsJy8WrGN-vp5QG-ygYzXpZvHj8U6RPvoIBEbgLIjzmHbg6JM9jfVnAIsQmsJvfrDUgbNx1Rp3-MnRdG4z-XHN7qLbY7JUFBohjJhexh_FHINEv-TkpcuaeK4wqHEDbLU-h8DnuIqDMV-4UpSHgfN29KcLL19OJieyBxj9VNOu6Ii-Pb-FIFdVUo5MQAsffQGzIB3qTgST86PhH2XeGXmUKsMULPtakijLcWj3loPs9yW-oXTn9_8DHuXRgwRPAwpphcJHXRgIVGqrCdoqOEpZ5OcBsHM7wsCYX_HETBJefBXzjHyBuXh_zsv4huh7wNJByaQo93MU0e80j-0U0pBBa5aBPZJ-b3-Jsr4TeCCA9EnbD2SwfBPlyGuzWajDnRuN9PywQP3Qjagw9xYUMqaAi0Zk_SSJzJEnmG4PB9J8ywxgoop_kcrIuKWa-JS30jSyxvNcKpH_4Ci4Jt-zjpX9eQ0M5sY1kAeHHdpwbFhix6OoGYqDLzWrL3aOn9W-XyOJjuJw4b8wPTEVhtffmezu-zCwulmbsa-acraGgVtruB8DrnStD08ECS9GOsVjhjQcGcjcgG5M-k4I4W4fR1C8k3t4WfNIUAZkFJ-iwYh5iub0ugf-9vcHy_dkjMxhZK-Lhz37-p-5GbomEKhB8NV_7O5wAyTCxuXL6pUedh0-X7eYyDWnooM9BuXNBeA_342xCYUfmltZtYigl5in3uL7SN7henSwSdTR9nS4V-dCBS4jeE--4QPtiCMymyspudShk0K55acK74Isbj4_ULg_4VJyH3x9EklvZ4LXoEyUVIlkJZ8I8_SqCOyPfBVV_eA3j_DTCk9HYr1XGLCrnTrmb-hKbWm1AWsb_2IGkTPQFgRtUWK8pGCOOaDG8TBUHxSW1vW3WHF2dErLgPQFsBBL5YOo88qDpk7ZvMsnG7s2QZ6ExZXTPbNYjUJly57mcu8wqroiWrATMEZGI3yKDDjeYiFCWDePBIKKrTwpYGmISlC3btHfUM3CQy5iQd0St2OkUEhPPIfPK3KjF008n5mvHHt01nMdEsXbRX68K4_slmBm039xUuqkQqkbN-wkAInnE=",
        currency: "EUR",
        extractedAt: "2025-01-27T12:00:00.000Z"
    }
], null, 2));
console.log();

console.log("=== DATA TYPE SUMMARY ===");
console.log();
console.log("Flight duration: number (minutes) - e.g., 140 for '2h 20'");
console.log("Flight departureDate: string (YYYY-MM-DD format) - e.g., '2025-10-10'");
console.log("Flight departureTime: string (HH:MM format) - e.g., '21:40'");
console.log("Booking price: number (integer) - e.g., 164 for '€164'");
console.log("All uniqueId fields: strings following PRD patterns");
console.log("Currency: always 'EUR' for this data"); 
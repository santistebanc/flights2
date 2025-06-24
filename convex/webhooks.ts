import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

export type Airport = {
  uniqueId: string;
  iata: string;
  name: string;
  city: string;
  country: string;
  timezone: string;
};

export type Airline = {
  uniqueId: string;
  name: string;
};

export type Flight = {
  uniqueId: string;
  airline: string;
  flightNumber: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
};

export type Deal = {
  uniqueId: string;
  flights: string[];
  price: number;
  dealer: string;
  link: string;
  date: string;
};

export const addEntities = httpAction(async (ctx, request) => {
  const {
    airports = [],
    airlines = [],
    flights = [],
    deals = [],
  }: {
    airports: Airport[];
    airlines: Airline[];
    flights: Flight[];
    deals: Deal[];
  } = await request.json();

  await Promise.all([
    ...airlines.map(async (airline) => {
      await ctx.runMutation(internal.mutations.createAirline, airline);
    }),
    ...airports.map(async (airport) => {
      await ctx.runMutation(internal.mutations.createAirport, airport);
    }),
  ]);

  await Promise.all(
    flights.map(async (flight) => {
      const from = await ctx.runQuery(internal.queries.getAirportByUniqueId, {
        uniqueId: flight.from,
      });
      const to = await ctx.runQuery(internal.queries.getAirportByUniqueId, {
        uniqueId: flight.to,
      });
      const airline = await ctx.runQuery(
        internal.queries.getAirlineByUniqueId,
        {
          uniqueId: flight.airline,
        }
      );
      if (from && to && airline) {
        await ctx.runMutation(internal.mutations.createFlight, {
          ...flight,
          from: from._id,
          to: to._id,
          airline: airline._id,
        });
      }
    })
  );

  await Promise.all(
    deals.map(async (deal) => {
      const flights = await Promise.all(
        deal.flights.map(async (flight) => {
          return await ctx.runQuery(internal.queries.getFlightByUniqueId, {
            uniqueId: flight,
          });
        })
      );
      if (flights.every((flight) => flight !== null)) {
        await ctx.runMutation(internal.mutations.createDeal, {
          ...deal,
          flights: flights.map((flight) => flight._id),
        });
      }
    })
  );

  return new Response(null, {
    status: 200,
  });
});

import { Express, Request, Response } from "express";
import { client, db } from "../services/db";
import { verifyAuth } from "./auth-handler";
import { scanKeys } from "../utils";
import { toArray, filter, from, mergeMap, of } from "rxjs";
import { infer, z } from "zod";
import { schema } from "sage-pg-db";
import { listings } from "sage-pg-db/dist/cjs/scheme";
import { eq } from "drizzle-orm";

export const ListingZod = z.object({
  uuid: z.string(),
  userId: z.string(),
  meta: z.object({
    league: z.string(),
    category: z.string(),
    subCategory: z.string(),
    ign: z.string(),
    timestampMs: z.number(),
    listingMode: z.string(),
    tabs: z.array(z.string()),
  }),
  items: z.array(z.object({
    hash: z.string(),
    price: z.number(),
    quantity: z.number()
  })),
  deleted: z.boolean(),
})

export type Listing = z.infer<typeof ListingZod>

export function setupListingApi(app: Express) {
  app.post("/list", (req: Request, res: Response) => {
    const userId = verifyAuth(req).profile.uuid;
    const listing: Listing = ListingZod.parse(req.body);

    console.log("adding listing", listing);

    const key = `${listing.meta.league}:${listing.userId}:${listing.meta.category}:${listing.meta.subCategory}`
    db.insert(schema.listings).values({
      key: key,
      league: listing.meta.league,
      category: listing.meta.category,
      subCategory: listing.meta.subCategory,
      userId: userId,
      ign: listing.meta.ign,
      tabs: JSON.stringify(listing.meta.tabs),
      uuid: listing.uuid,
      items: JSON.stringify(listing.items),
      deleted: false,
      timestamp: new Date(),
      listingMode: listing.meta.listingMode
    }).onConflictDoUpdate({
      target: schema.listings.key,
      set: {
        league: listing.meta.league,
        category: listing.meta.category,
        subCategory: listing.meta.subCategory,
        userId: userId,
        ign: listing.meta.ign,
        tabs: JSON.stringify(listing.meta.tabs),
        uuid: listing.uuid,
        items: JSON.stringify(listing.items),
        deleted: false,
        timestamp: new Date(),
        listingMode: listing.meta.listingMode
      }
    }).catch((e) => {
      res.send(500);
    }).then(() => {
      res.send(200);
    });
  });

  app.post("/delete/listing/:league/:category/:subCategory", (req: Request, res: Response) => {
    const userId = verifyAuth(req).profile.uuid;
    const league = req.params.league;
    const category = req.params.category;
    const subCategory = req.params.subCategory;
    const key = `${league}:${userId}:${category}:${subCategory}`
    db.delete(schema.listings).where(eq(schema.listings.key, key)).then((e) => {
      res.send(200)
    })
  });

  function loadListings(league: string, category: string, startTimestampMs: number) {
    return from(
      db.query.listings.findMany({
        where: (a, b) => b.and(
          b.eq(a.category, category),
          b.eq(a.league, league),
          b.eq(a.deleted, false),
          b.gte(a.timestamp, new Date(startTimestampMs))
        )
      })
    ).pipe(
      mergeMap((e) => {
        const out = e.map((o) => {
          const listing: Listing = {
            meta: {
              league: o.league,
              category: o.category,
              ign: o.ign,
              tabs: JSON.parse(o.tabs),
              listingMode: o.listingMode,
              subCategory: o.subCategory,
              timestampMs: o.timestamp.getTime(),
            },
            userId: o.userId,
            uuid: o.uuid,
            items: JSON.parse(o.items),
            deleted: o.deleted
          }

          return listing
        })

        return of(out)
      })
    )
  }

  app.get("/listings/:league/:tag/:startTimestampMs", (req: Request, res: Response) => {
    const league = req.params.league;
    const tag = req.params.tag;
    const startTimestampMs = parseInt(req.params.startTimestampMs);
    loadListings(league, tag, startTimestampMs).subscribe((out) => {
      res.send(out)
    })
  });

  app.get("/my/listings", (req: Request, res: Response) => {
    const userId = verifyAuth(req).profile.uuid;

    function loadMyListings() {
      return from(
        db.query.listings.findMany({
          where: (a, b) => b.and(
            b.eq(a.userId, userId),
            b.eq(a.deleted, false),
          )
        })
      ).pipe(
        mergeMap((e) => {
          const out = e.map((o) => {
            const listing: Listing = {
              meta: {
                league: o.league,
                category: o.category,
                ign: o.ign,
                tabs: JSON.parse(o.tabs),
                listingMode: o.listingMode,
                subCategory: o.subCategory,
                timestampMs: o.timestamp.getTime(),
              },
              userId: o.userId,
              uuid: o.uuid,
              items: JSON.parse(o.items),
              deleted: o.deleted
            }

            return listing
          })

          return of(out)
        })
      )
    }

    loadMyListings().subscribe((a) => {
      res.send(a)
    })
  });
}

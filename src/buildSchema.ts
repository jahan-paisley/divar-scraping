require('lovefield')

import lf from 'lovefield';

export class GeolocationCoord {
    public lat: number;
    public lon: number;

    constructor(latitude: number, longitude: number) {
        this.lat = latitude;
        this.lon = longitude;
    }
}

export interface ListingInterface {
    id?: number;
    ext_id?: string;
    title?: string;
    desc?: string;
    advertiser?: string;
    area?: number;
    land_area?: number;
    rooms?: number;
    price?: number;
    price_meter?: number;
    district?: string;
    location?: GeolocationCoord;
    accuracy?: number;
    category?: string;
    mobile?: number;
    built_at?: number;
    created?: Date;
}

export class Listing implements ListingInterface {
    public constructor(init?: Partial<Listing>) {
        Object.assign(this, init);
    }

    public id?: number;
    public ext_id?: string;
    public title?: string;
    public desc?: string;
    public advertiser?: string;
    public area?: number;
    public land_area?: number;
    public rooms?: number;
    public price?: number;
    public price_meter?: number;
    public district?: string;
    public category?: string;
    public mobile?: number;
    public built_at?: number;
    public location?: GeolocationCoord;
    public accuracy?: number;
    public revision?: boolean;
    public created?: Date;
}

let schemaBuilder: lf.schema.Builder | null = null;

export function buildSchema() {
    schemaBuilder = lf.schema.create('listings', 1);

    schemaBuilder.createTable('listing')
        .addColumn('id', lf.Type.INTEGER)
        .addColumn('ext_id', lf.Type.STRING)
        .addColumn('title', lf.Type.STRING)
        .addColumn('category', lf.Type.STRING)
        .addColumn('area', lf.Type.INTEGER)
        .addColumn('land_area', lf.Type.INTEGER)
        .addColumn('rooms', lf.Type.INTEGER)
        .addColumn('price', lf.Type.INTEGER)
        .addColumn('price_meter', lf.Type.INTEGER)
        .addColumn('district', lf.Type.STRING)
        .addColumn('location', lf.Type.OBJECT)
        .addColumn('mobile', lf.Type.NUMBER)
        .addColumn('built_at', lf.Type.INTEGER)
        .addColumn('advertiser', lf.Type.STRING)
        .addColumn('desc', lf.Type.STRING)
        .addColumn('created', lf.Type.DATE_TIME)
        .addPrimaryKey(['id'], true)
        .addNullable(['land_area', 'rooms', 'built_at']);
}

export let listingDb: lf.Database;
export let listing: lf.schema.Table;

export function insertRecord(item: Listing) {
    // Start of the Promise chaining
    schemaBuilder!!.connect().then(function (db) {
        // Asynchronous call connect() returned object: db
        listingDb = db;

        // Get the schema representation of table Item.
        // All schema-related APIs are synchronous.
        listing = db.getSchema().table('listing');

        // Creates a row. Lovefield does not accept plain objects as row.
        // Use the createRow() API provided in table schema to create a row.
        let promise = listingDb.select().from(listing)
            .where(listing.ext_id.eq(item.ext_id!!))
            .exec();
        let result: Promise<object[]>;
        return promise.then(function (results: object[]) {
            if (results.length == 0) {
                const row = listing.createRow(item);
                console.log('{} inserted', row)
                return result = db.insertOrReplace().into(listing).values([row]).exec();
            } else
                console.log('{} exists already', item.title)
        })
    }).then(function () {
        // When reached here, Lovefield guarantees previous INSERT OR REPLACE
        // has been committed with its implicit transaction.

        // SELECT * FROM Item WHERE Item.done = false;
        // Return another Promise by calling this SELECT query's exec() method.
        return listingDb.select().from(listing).where(listing.id.isNotNull()).exec();

    }).then(function (results: object[]) {
        // The SELECT query's Promise will return array of rows selected.
        // If there were no rows, the array will be empty.

        results.forEach(function (row) {
            // Use column name to directly dereference the columns from a row.
            console.log(row);
        });
    });
}
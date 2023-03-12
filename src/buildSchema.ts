require('lovefield')

import lf from 'lovefield';

export type ListingMap = {
    [Property in keyof Listing]?: Listing[Property]
}

export class Listing {
    public constructor(init?:Partial<Listing>) {
        Object.assign(this, init);
        this.created = this.created || new Date()
    }

    public id?: number;
    public ext_id?: string;
    public title?: string;
    public desc?: string;
    public advertiser?: string;
    public area?: number;
    public price?: number;
    public price_meter?: number;
    public district?: string;
    public mobile?: number;
    public created?: Date;
}

let schemaBuilder: lf.schema.Builder | null = null;

function buildSchema() {
    schemaBuilder = lf.schema.create('listings', 1);

    schemaBuilder.createTable('listing')
        .addColumn('id', lf.Type.INTEGER)
        .addColumn('ext_id', lf.Type.STRING)
        .addColumn('title', lf.Type.STRING)
        .addColumn('desc', lf.Type.STRING)
        .addColumn('area', lf.Type.INTEGER)
        .addColumn('price', lf.Type.INTEGER)
        .addColumn('district', lf.Type.STRING)
        .addColumn('mobile', lf.Type.NUMBER)
        .addColumn('created', lf.Type.DATE_TIME)
        .addPrimaryKey(['id']);
}

let listingDb: lf.Database;
let listing: lf.schema.Table;

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
        const row = listing.createRow(item);

        // INSERT OR REPLACE INTO Item VALUES row;
        // The exec() method returns a Promise.
        return db.insertOrReplace().into(listing).values([row]).exec();

    }).then(function () {
        // When reached here, Lovefield guarantees previous INSERT OR REPLACE
        // has been committed with its implicit transaction.

        // SELECT * FROM Item WHERE Item.done = false;
        // Return another Promise by calling this SELECT query's exec() method.
        return listingDb.select().from(listing).where(listing.done.eq(false)).exec();

    }).then(function (results: object[]) {
        // The SELECT query's Promise will return array of rows selected.
        // If there were no rows, the array will be empty.

        results.forEach(function (row) {
            // Use column name to directly dereference the columns from a row.
            console.log(row);
        });
    });
}

buildSchema();
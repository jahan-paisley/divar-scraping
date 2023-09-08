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

export class IdPrice {
    public constructor(ext_id: string, price: number) {
        this.ext_id = ext_id;
        this.price = price;
    }

    public ext_id: string;
    public price: number;
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
    public agent?: string;
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
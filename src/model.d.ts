export declare class GeolocationCoord {
    lat: number;
    lon: number;
    constructor(latitude: number, longitude: number);
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
export declare class IdPrice {
    constructor(ext_id: string, price: number);
    ext_id: string;
    price: number;
}
export declare class Listing implements ListingInterface {
    constructor(init?: Partial<Listing>);
    id?: number;
    ext_id?: string;
    title?: string;
    desc?: string;
    advertiser?: string;
    agent?: string;
    area?: number;
    land_area?: number;
    rooms?: number;
    price?: number;
    price_meter?: number;
    district?: string;
    category?: string;
    mobile?: number;
    built_at?: number;
    location?: GeolocationCoord;
    accuracy?: number;
    revision?: boolean;
    created?: Date;
}

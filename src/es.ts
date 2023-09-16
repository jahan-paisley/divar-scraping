import {Client} from 'elasticsearch-browser';
import {ListingInterface} from './model';

const client = new Client({
    node: 'http://localhost:9200',
    auth: {
        apiKey: {
            id: "6os_9YYBzVE0CJnHxELk",
            api_key: "Rp5u2jh5SxmXqpOM2EotJA",
        }
    }
});

async function search(ext_id: string) {
    // Let's search!
    return await client.search<ListingInterface>({
        index: 'listings',
        q: '{match: {ext_id: ext_id}}'
    }).then((res: { hits: { hits: any; }; }) => {
        res.hits.hits
    });
}

export async function insert_es(listing: ListingInterface) {
    // Let's start by indexing some data
    /*
        search(listing.ext_id!!).then(hits => {
            console.log(hits)
        });
    */
    await client.index({
        index: 'listings',
        document: listing
    }, {headers: {ApiKey: 'ZWxhc3RpYzpNWVBYcTBGWTJzVmJNZFZ6emlFeQ=='}})

    // here we are forcing an index refresh, otherwise we will not
    // get any result in the consequent search
    await client.indices.refresh({index: 'listings'},
        {headers: {ApiKey: 'ZWxhc3RpYzpNWVBYcTBGWTJzVmJNZFZ6emlFeQ=='}})
}
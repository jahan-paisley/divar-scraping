import {IdPrice, ListingInterface} from "./model";

import {addStyles, openPopup} from "./popup"

addStyles();

function buildKibanaQuery(query: string) {
    const urlBase = `http://localhost:5601/app/discover#/view/d2902950-cfa5-11ed-a29d-a987bbee855d?_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:now-1y,to:now))&_a=(columns:!(title,desc,price,price_meter,area,land_area,location,mobile,advertiser,accuracy,built_at,category,rooms,revision,ext_id,created,watch),filters:!(),grid:(),hideChart:!t,index:be06188d-cc1c-4370-a0dd-d848317841d3,interval:auto,query:(language:kuery,query:`;
    const sort = `),rowHeight:20,sort:!(!(created,desc)))`;
    return `${urlBase}'${query}'${sort}`;
}

const {Listing, GeolocationCoord} = require('./model');

console.clear();

let interval: number | null = null;
let found = false;

function save(listing: typeof Listing) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://localhost:9200/listing/_doc', true);
    setAuthHeader(xhr);
    xhr.send(JSON.stringify(listing));
}

function setAuthHeader(xhr: XMLHttpRequest) {
    xhr.setRequestHeader("Authorization", 'Basic ZWxhc3RpYzp2dHB6c3hLSEFjRFRrbnk3c2FTaQ==')
    xhr.setRequestHeader("Content-Type", 'application/json')
}

async function findByExtId(listing: typeof Listing): Promise<typeof Listing[]> {
    return new Promise((resolve, _) => {
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if (xhr.readyState == XMLHttpRequest.DONE) {
                resolve(JSON.parse(xhr.response).hits.hits.map((o: { _source: any; }) => o._source));
            }
        }

        xhr.open('GET', `https://localhost:9200/listing/_search?q=ext_id:"${listing.ext_id}"`, true);
        setAuthHeader(xhr);
        xhr.send();
    });
}

async function findAll(): Promise<IdPrice[]> {
    return new Promise((resolve, _) => {
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if (xhr.readyState == XMLHttpRequest.DONE) {
                const results = JSON.parse(xhr.response).hits.hits
                    .map((o: { _source: { ext_id: string; price: number; }; }) =>
                        new IdPrice(o._source.ext_id, o._source.price));
                resolve(results);
            }
        }

        xhr.open('GET', "https://localhost:9200/listing/_search?size=10000&_source=ext_id,price", true);
        setAuthHeader(xhr);
        xhr.send();
    });
}

async function find_similar(listing: typeof Listing): Promise<typeof Listing[]> {
    return new Promise((resolve, _) => {
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if (xhr.readyState == XMLHttpRequest.DONE) {
                resolve(JSON.parse(xhr.response).hits.hits.map((o: { _source: ListingInterface }) => o._source));
            }
        }

        let url = `https://localhost:9200/listing/_search?q=`
        url += `mobile:${listing.mobile} `;
        if (!!listing.area) {
            url += ` AND area:${listing.area}`;
        }
        if (!!listing.land_area)
            url += ` AND land_area:${listing.land_area}`;
        url += ` AND price_meter:[${listing.price_meter * 0.7} TO ${listing.price_meter * 1.3}]`;
        xhr.open('GET', url, true);
        setAuthHeader(xhr);
        xhr.send();
    });
}

async function find_by_mobile(listing: typeof Listing): Promise<typeof Listing[]> {
    return new Promise((resolve, _) => {
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if (xhr.readyState == XMLHttpRequest.DONE) {
                resolve(JSON.parse(xhr.response).hits.hits.map((o: { _source: ListingInterface }) => o._source));
            }
        }

        let url = `https://localhost:9200/listing/_search?q=`
        url += `ext_id:${listing.ext_id}`;
        url += ` OR mobile:${listing.mobile}`;
        xhr.open('GET', url, true);
        setAuthHeader(xhr);
        xhr.send();
    });
}

function equals(a: typeof Listing, b: typeof Listing): boolean {
    return a.title == b.title && a.price == b.price && a.desc == b.desc;
}

let allIdPrices: IdPrice[] = await findAll();

enum Action {
    Save,
    Bookmark
}

const callback = async function () {
    const contactBtn: HTMLElement | null = document.querySelector("button[class*=get-contact]");
    const bookmarkBtn: HTMLElement | null = document.querySelector("button[aria-labelledby*=post-bookmark]");
    let searchEl = document.querySelector('div.kt-nav-text-field__field > form > input') as HTMLInputElement;
    /*
        if (searchEl!!.value!! != 'کردان')
            document.querySelectorAll('article[class^=kt-post-card]').forEach(elem => {
                    let content = elem.textContent;
                    const excludedDistricts = ['کردان']
                    if (excludedDistricts.filter(o => content!!.indexOf(o) !== -1).length > 0)
                        elem.remove();
                }
            )
        if (searchEl!!.value!!.trim() === 'کوهسار')
            document.querySelectorAll('article[class^=kt-post-card]').forEach(elem => {
                    let content = elem.querySelector('span[class^=kt-post-card__bottom-description]')!!.textContent;
                    const excludedDistricts = ['کوهسار']
                    if (excludedDistricts.filter(o => content!!.indexOf(o) !== -1).length > 0)
                        elem.remove();
                }
            )
    */

    const excludedDistricts = [
        'سهیلیه', 'سهلیه', 'سهیله',
        'چهارباغ', 'چهار باغ',
        'زعفرانیه', 'سرخاب', 'افشاریه', 'رامجین', 'تنکمان',
        'لشکرآباد', 'لشکراباد', 'لشگراباد', 'لشگرآباد', 'لشگر اباد',
        'فشند', 'اقدسیه', 'طاووسیه',
        'جنوب کردان', 'کردان جنوب',
        'گردان جنوب', 'جنوب گردان',
        'کردان پایین', 'کردان‌پایین',
        'تهران دشت', 'تهراندشت', 'تهران‌دشت',
        'زکی آباد', 'زکی‌آباد',
        'سعید آباد', 'سعیدآباد', 'سعیداباد',
        'سنقرآباد', 'سنقراباد', 'سنقر اباد', 'سنقر آباد',
        'اسماعیل‌آباد', 'اسماعیل اباد', 'اسماعیل‌ آباد',
        'قاسم گرجی', 'هیو', 'ماهدشت',
        'حاجی آباد', 'حاجی‌آباد', 'حاجی اباد', 'حاجی‌اباد',
        'قاسم اباد', 'قاسم آباد', 'قاسم‌اباد', 'قاسم‌آباد',
        'گلسار', 'سیف آباد',
        'نمکلان',
        'آران',
        'اران',
        'تهراندست',
        'هلجرد',
        'سعادت آباد', 'سعادت‌آباد', 'سعادت اباد',
        'زکی آباد', 'زکی اباد', 'زکی‌آباد',
        'حاجی بیک', 'حاجی‌بیک'
    ]
    document.querySelectorAll('article[class^=kt-post-card]').forEach(elem => {
            let content = elem.textContent;
            if (excludedDistricts.filter(o => content!!.indexOf(o) !== -1).length > 0) {
                console.log("removing {}", content);
                (elem as HTMLElement).style.visibility = "hidden";
            } else {
                let listingLink = elem.parentElement;
                if (listingLink != null) {
                    const href = listingLink.attributes.getNamedItem('href')!!.textContent;
                    const extId = href!!.substring(href!!.lastIndexOf('/') + 1);
                    const priceEl = elem.querySelector('.kt-post-card__description');
                    const newPrice = parseInt(priceEl!!.textContent!!
                        .replaceAll(',', '')
                        .replace('تومان', '')
                        .replace(new RegExp(/[۰-۹]/g), d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString()))
                    const items = allIdPrices.filter(l => l.ext_id === extId);
                    if (items.length > 0) {
                        if (items.find(o => o.price === newPrice))
                            (elem as HTMLElement).style.backgroundColor = 'lightskyblue';
                        else if (items.find(o => o.price < newPrice))
                            (elem as HTMLElement).style.backgroundColor = 'crimson';
                        else if (items.find(o => o.price > newPrice))
                            (elem as HTMLElement).style.backgroundColor = 'limegreen';
                    } else
                        (elem as HTMLElement).style.backgroundColor = 'gold';
                }
            }
        }
    )

    if (contactBtn == null)
        return;
    if (found && interval) {
        console.log("1- interval gonna removed", interval);
        clearInterval(interval);
    }
    console.log("contact btn", contactBtn)
    let warnButton = document.querySelector("button[class*=load-page-button]");
    if (warnButton) warnButton.remove();
    console.log("interval running", interval);
    if (interval != null) {
        console.log("2- interval gonna removed", interval);
        clearInterval(interval);
    }

    const listing = extract_listing();
    console.log(listing);
    let regExp = new RegExp(excludedDistricts.map(o => "(" + o + ")").join('|'), 'g');
    let descElem = document.querySelector('[class^=kt-description-row__text]')!!;
    descElem.innerHTML = descElem.innerHTML.replaceAll(
        regExp, (match) => `<span style="background-color: red;">${match}</span>`
    )

    /** TO go back to previous page if it's been captured earlier **/
        // const result = await findByExtId(listing);
        // if (result.length !== 0 && result.filter(o => equals(listing, o._source)).length > 0) {
        //     setTimeout(() => {
        //         //history.back()
        //         console.log("going back");
        //     }, 500);
        // }

    let saveListingOnClick = function (action: Action) {
            console.log("registering click callback");
            const listing = extract_listing();

            setTimeout(async function () {
                let mobile = document.querySelector("a[href^='tel:']");
                let enteredMobile;
                if (document.querySelector(".kt-unexpandable-row__title-box > p")?.textContent?.indexOf("مخفی") != -1) {
                    enteredMobile = prompt("seller mobile no:");
                    if(!enteredMobile)
                        return;
                }
                if (mobile == null && enteredMobile == null)
                    return;
                const mobileStr =
                    mobile?.attributes.getNamedItem('href')?.value.replace('tel:', '') || enteredMobile;


                if (mobileStr != null && interval != null) {
                    found = true;
                    document.getElementsByClassName('kt-statement--info')[0].remove();
                    clearInterval(interval);
                    listing.mobile = parseInt(mobileStr);
                    console.log(listing);
                    const contents = JSON.stringify(listing);
                    const cities = ['کردان', 'کوهسار', 'طالیان', 'تالیان', 'ورده', 'خور',
                        'اغشت', 'خوروین', 'علاقبند', 'علاقه بند', 'ولیان', 'هرجاب',
                        'آجین دوجین', 'اجین دوجین',
                        'جلنگدار', 'آغشت', 'برغان', 'دوزعنبر']
                    if (cities.filter(city => contents.indexOf(city) !== -1).length > 0) {
                        const similarListing = (await find_similar(listing)) as ListingInterface[];
                        const similarListings = similarListing
                            .filter(o => commonWordsPercentage(o.desc, listing.desc) > 10);

                        const likelySame = similarListings.length > 0 ? similarListings
                            .map(o => o.ext_id + "  _  " + o.price).join(', ') : null;

                        let listingsFound = await find_by_mobile(listing);

                        const setClickHandler = (notification: Notification) => {
                            if (likelySame?.length !== 0) {
                                notification.onclick = () => {
                                    let ext_ids = similarListings
                                        .map(o => o.ext_id)
                                        .concat([listing.ext_id])
                                        .map(o => "ext_id:\"" + o + "\"");
                                    const url = buildKibanaQuery(ext_ids.join(" OR "));
                                    window.open(url, '_blank');
                                }
                            }
                        }
                        const setClickHandler1 = (notification: Notification) => {
                            notification.onclick = () => {
                                let ext_ids = listingsFound.map(o => o.ext_id)
                                    .concat([listing.ext_id])
                                    .map(o => "ext_id:\"" + o + "\"");
                                const url = buildKibanaQuery(ext_ids.join(" OR "));
                                console.log(notification, url);
                                window.open(url, '_blank');
                            }
                        }
                        openPopup(listing, similarListings, listingsFound);

                        const result = await findByExtId(listing);
                        if (result.length === 0) {
                            console.log('inserting into ES');
                            if (action == Action.Bookmark) {
                                listing.watch = true;
                            }
                            console.log('inserting the new record into ES')
                            save(listing);
                            allIdPrices.push(new IdPrice(listing.ext_id, listing.price))
                            let body = !!likelySame ?
                                `inserted new record\n LikelyPreviousPrices: ${likelySame}` :
                                `inserted new record`;
                            const notification = new Notification('inserted new record', {body: body});
                            setClickHandler1(notification);
                            setTimeout(function () {
                                history.back()
                            }, 200);
                        } else if (result.filter(o => equals(listing, o)).length == 0) {
                            const previousPrices = result.map(o => o.price).join(', ');
                            listing.revision = true;
                            if (action == Action.Bookmark) {
                                listing.watch = true;
                            }
                            console.log('inserting the next revision into ES')
                            save(listing);
                            allIdPrices.push(new IdPrice(listing.ext_id, listing.price))
                            let body = !!likelySame ?
                                `inserted revised record\n LikelyPreviousPrices: ${likelySame}` :
                                `inserted revised record\n PreviousPrices: ${previousPrices}\``;

                            const notification = new Notification('inserted revised record', {body: body});
                            setClickHandler(notification);
                            setTimeout(function () {
                                history.back()
                            }, 200);
                        } else {
                            const notification = new Notification('did nothing', {body: 'did nothing'});
                            setClickHandler1(notification);
                            setTimeout(function () {
                                // notification.close();
                                history.back()
                            }, 200);
                        }
                    }
                }
            }, 2000);
        };
    let contactHandler = () => saveListingOnClick(Action.Save);
    contactBtn.addEventListener('click', contactHandler);
    bookmarkBtn!!.onclick = function () {
        contactBtn.removeEventListener("click", contactHandler);
        contactBtn.click()
        saveListingOnClick(Action.Bookmark)
    };

    console.log("clicking the contact button ...");
    /*
        if (!regExp.test(listing.desc))
            setTimeout(() => contactBtn!!.click(), 3000)
    */
};

function commonWordsPercentage(str1: string | undefined, str2: string): number {
    let words1 = (str1 || "").split(" ");
    let words2 = str2.split(" ");

    let set1 = new Set(words1);
    let set2 = new Set(words2);

    let commonWords = Array.from(set1).filter(word => set2.has(word));

    return (commonWords.length / ((set1.size + set2.size) / 2)) * 100;
}

function extract_listing() {
    const listing = new Listing({});
    listing.created = listing.created || new Date()

    const subtitle = document.querySelector('.kt-page-title__subtitle')!!.textContent!!
    listing.district = subtitle.substring(subtitle.indexOf('در') + 2, subtitle.length).trim()

    let catHref = document.querySelectorAll('.kt-wrapper-row__child')[0].parentElement!!.attributes!!.getNamedItem("href")!!.textContent
    listing.category = catHref!!.substring(catHref!!.lastIndexOf('/') + 1);

    listing.title = document.querySelector('[class^=kt-page-title__title]')!!.textContent!!
    listing.desc = document.querySelector('[class^=kt-description-row__text]')!!.textContent!!
    const elems = Array.from(document.querySelectorAll('.kt-group-row-item--info-row, ' +
        '.kt-unexpandable-row'));
    let url = window.location.href;
    listing.ext_id = url.substring(url.lastIndexOf('/') + 1, url.indexOf('?') == -1 ? url.length : url.indexOf('?'))
    const locElem = document.querySelector('a[class^=map]');
    if (locElem) {
        const href = locElem.attributes.getNamedItem('href')!!.value;
        const regex = /latitude=([0-9.]+)&longitude=([0-9.]+)(?:&radius=([0-9.]+))?/;
        const array = regex.exec(href)!!;
        listing.location = new GeolocationCoord(Number(array[1]), Number(array[2]));
        listing.accuracy = Number((array.length >= 3 && array[3]) || 0);
    }

    const columns = Array.from(document.querySelectorAll('.kt-group-row th'))
        .map(o => o.textContent)
        .filter(o => o?.trim() !== '');

    elems.filter(o => o.nodeName == "TD").forEach((o, i) => {
        if (columns[i]!!.indexOf('متراژ') != -1)
            listing.area = parseInt(o.textContent!!
                .replaceAll('٬', '')
                .replace(new RegExp(/[۰-۹]/g), d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
            );
        else if (columns[i]!!.indexOf('ساخت') != -1)
            listing.built_at = parseInt(o.textContent!!
                .replaceAll('٬', '')
                .replace(new RegExp(/[۰-۹]/g), d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
            );
        else if (columns[i]!!.indexOf('اتاق') != -1)
            listing.rooms = parseInt(o.textContent!!
                .replaceAll('٬', '')
                .replace(new RegExp(/[۰-۹]/g), d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
            );
    });
    elems.filter(o => o.nodeName !== "TD").forEach(o => {
        if (o.textContent!!.indexOf('متراژ') != -1)
            listing.land_area = parseInt(o.textContent!!
                .replace('متراژ', '')
                .replaceAll('٬', '')
                .replace('متر', '')
                .replace(new RegExp(/[۰-۹]/g), d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
            );
        if (o.textContent!!.indexOf('متراژ زمین') != -1)
            listing.land_area = parseInt(o.textContent!!
                .replace('متراژ زمین', '')
                .replaceAll('٬', '')
                .replace('متر', '')
                .replace(new RegExp(/[۰-۹]/g), d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
            );
        else if (o.textContent!!.indexOf('قیمت کل') != -1)
            listing.price = parseInt(o.textContent!!
                .replace('قیمت کل', '')
                .replaceAll('٬', '')
                .replace('تومان', '')
                .replace(new RegExp(/[۰-۹]/g), d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
            );
        else if (o.textContent!!.indexOf('قیمت هر متر') != -1)
            listing.price_meter = parseInt(o.textContent!!
                .replace('قیمت هر متر', '')
                .replaceAll('٬', '')
                .replace('تومان', '')
                .replace(new RegExp(/[۰-۹]/g), d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
            );
        else if (o.textContent!!.indexOf('آگهی‌دهنده') != -1 || o.textContent!!.indexOf('آژانس املاک') != -1)
            listing.advertiser = o.textContent!!
                .replace('آگهی‌دهنده', '')
                .replace('آژانس املاک', 'آژانس املاک ');
        else if (o.textContent!!.indexOf('مشاور املاک') != -1)
            listing.agent = o.textContent!!.replace('مشاور املاک', '')
        else
            console.log("not saved" + o.textContent!!)
    });
    return listing;
}

function callOnLocationChange() {
    let previousUrl = '';
    const observer = new MutationObserver(function () {
        if (location.href !== previousUrl) {
            previousUrl = location.href;
            console.log("location changed", location.href);
            if (!!interval) clearInterval(interval);
            found = false;
            interval = setInterval(callback, 1000) as unknown as number;
            console.log("interval created", interval);
        }
    });
    const config = {subtree: true, childList: true};
    observer.observe(document, config);
}


callOnLocationChange();


export {};
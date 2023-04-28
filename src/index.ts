const {insertRecord, Listing, GeolocationCoord, buildSchema} = require('./buildSchema');

console.clear();
// buildSchema();

let interval: number | null = null;
let found = false;

/*
loadMorePosts() {
   var {loadMorePosts: e, loadedForUrl: t, location: {pathname: r, search: n}} = this.props;
   return "".concat(r).concat(n) !== t ? this.updateData() : e()
}
*/

// var my_awesome_script = document.createElement('script');
// my_awesome_script.setAttribute('src', 'http://192.168.1.120:8097');
// document.head.appendChild(my_awesome_script);

function insert_es(listing: typeof Listing) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://localhost:9200/listing/_doc', true);
    xhr.setRequestHeader("Authorization", 'Basic ZWxhc3RpYzp2dHB6c3hLSEFjRFRrbnk3c2FTaQ==')
    xhr.setRequestHeader("Content-Type", 'application/json')
    xhr.send(JSON.stringify(listing));
}

async function query_es(listing: typeof Listing): Promise<typeof Listing[]> {
    return new Promise((resolve, _) => {
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if (xhr.readyState == XMLHttpRequest.DONE) {
                resolve(JSON.parse(xhr.response).hits.hits);
            }
        }

        xhr.open('GET', `https://localhost:9200/listing/_search?q=ext_id:${listing.ext_id}`, true);
        xhr.setRequestHeader("Authorization", 'Basic ZWxhc3RpYzp2dHB6c3hLSEFjRFRrbnk3c2FTaQ==')
        xhr.setRequestHeader("Content-Type", 'application/json')
        xhr.send();
    });
}

function equals(a: typeof Listing, b: typeof Listing): boolean {
    return a.title == b.title && a.price == b.price && a.desc == b.desc;
}

const callback = function () {
    const contactBtn: HTMLElement | null = document.querySelector("#app > div.kt-container > div button");
    let searchEl = document.querySelector('div.kt-nav-text-field__field > form > input') as HTMLInputElement;
    // if (searchEl!!.value!! != 'کردان')
    //     return;
    document.querySelectorAll('article[class^=kt-post-card]').forEach(elem => {
            let content = elem.textContent;
            const excludedDistricts = ['سهیلیه', 'سهلیه', 'سهیله',
                'چهارباغ', 'چهار باغ',
                'هشتگرد', 'زعفرانیه', 'سرخاب', 'افشاریه', 'رامجین', 'تنکمان',
                'لشکرآباد', 'لشکراباد', 'لشگراباد', 'لشگرآباد',
                'فشند', 'اقدسیه', 'طاووسیه',
                'کردان جنوب', 'جنوب کردان', 'کردان جنوبی',
                'تهران دشت', 'تهراندشت', 'تهران‌دشت',
                'زکی آباد', 'زکی‌آباد',
                'سعید آباد', 'سعیدآباد', 'سعیداباد',
                'سنقرآباد', 'سنقراباد', 'سنقر اباد', 'سنقر آباد'
            ]
            if (excludedDistricts.filter(o => content!!.indexOf(o) !== -1).length > 0)
                elem.remove();
        }
    )

    if (contactBtn == null)
        return;
    if (found && interval) {
        console.log("1- interval gonna removed", interval);
        clearInterval(interval);
    }
    console.log("contact btn", contactBtn)
    console.log("interval running", interval);
    if (interval != null) {
        console.log("2- interval gonna removed", interval);
        clearInterval(interval);
    }
    contactBtn!!.onclick = function () {
        console.log("registering click callback");
        const listing = extract_listing();

        setTimeout(async function () {
            const mobile: HTMLElement | null = document.querySelector("a[href^='tel:']");
            if (!mobile)
                return;
            const mobileAttr = mobile.attributes.getNamedItem('href');

            if (mobileAttr != null && interval != null) {
                const mobileVal = mobileAttr.value.replace('tel:', '');
                found = true;
                document.getElementsByClassName('kt-statement--info')[0].remove();
                console.log(mobileVal);
                console.log(document.querySelector("[class*='kt-page-title__title']")!!.textContent);
                console.log("3- interval gonna removed", interval);
                clearInterval(interval);
                listing.mobile = parseInt(mobileVal)
                console.log(listing)
                // insertRecord(listing);
                const contents = JSON.stringify(listing);
                const cities = ['کردان', 'کوهسار', 'طالیان', 'تالیان', 'ورده', 'خور',
                    'اغشت', 'خوروین', 'علاقبند', 'علاقه بند', 'ولیان', 'هرجاب', 'جلنگدار', 'آغشت', 'برغان', 'دوزعنبر']
                if (cities.filter(city => contents.indexOf(city) !== -1).length > 0) {
                    const result = await query_es(listing);
                    if (result.length === 0) {
                        console.log('inserting into ES');
                        insert_es(listing);
                        alert('inserted new record');
                    } else if (result.filter(o => equals(listing, o._source)).length == 0) {
                        const previousPrices = result.map(o => o._source.price).join(', ');
                        listing.revision = true;
                        console.log('inserting the next revision into ES')
                        insert_es(listing);
                        alert(`inserted revised record\n PreviousPrices: ${previousPrices}`);
                    } else {
                        alert('did nothing');
                    }
                }
            }
        }, 2000);
    };
    console.log("clicking the contact button ...");
    //contactBtn!!.click();
};

function extract_listing() {
    const listing = new Listing({});
    listing.created = listing.created || new Date()

    const subtitle = document.querySelector('.kt-page-title__subtitle')!!.textContent!!
    listing.district = subtitle.substring(subtitle.indexOf('در') + 2, subtitle.length).trim()

    const len = document.querySelectorAll('.kt-breadcrumbs__link').length;
    const cat = document.querySelectorAll('.kt-breadcrumbs__link')[len - 2]!!
        .attributes
        .getNamedItem('href')!!
        .value;
    listing.category = cat.substring(cat.lastIndexOf('/') + 1, cat.length);

    listing.title = document.querySelector('[class^=kt-page-title__title]')!!.textContent!!
    listing.desc = document.querySelector('[class^=kt-description-row__text]')!!.textContent!!
    const elems: NodeListOf<Element> = document.querySelectorAll('.kt-group-row-item--info-row, ' +
        '.kt-unexpandable-row');
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

    elems.forEach(o => {
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
        else if (o.textContent!!.indexOf('متراژ') != -1)
            listing.area = parseInt(o.textContent!!
                .replace('متراژ', '')
                .replaceAll('٬', '')
                .replace(new RegExp(/[۰-۹]/g), d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
            );
        else if (o.textContent!!.indexOf('ساخت') != -1)
            listing.built_at = parseInt(o.textContent!!
                .replace('ساخت', '')
                .replaceAll('٬', '')
                .replace(new RegExp(/[۰-۹]/g), d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
            );
        else if (o.textContent!!.indexOf('اتاق') != -1)
            listing.rooms = parseInt(o.textContent!!
                .replace('اتاق', '')
                .replaceAll('٬', '')
                .replace(new RegExp(/[۰-۹]/g), d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
            );
        else if (o.textContent!!.indexOf('آگهی‌دهنده') != -1 || o.textContent!!.indexOf('آژانس املاک') != -1)
            listing.advertiser = o.textContent!!
                .replace('آگهی‌دهنده', '')
                .replace('آژانس املاک', 'آژانس املاک ');
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
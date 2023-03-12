const { insertRecord, Listing } = require('./buildSchema');

console.clear();
console.log("loaded");

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

let callback = function () {
    let contactBtn: HTMLElement | null =
        document.querySelector("#app > div.kt-container > div button");

    document.querySelectorAll('article[class^=kt-post-card]').forEach(elem => {
            if (
                elem.textContent!!.indexOf('سهیلیه') != -1 ||
                elem.textContent!!.indexOf('سهلیه') != -1 ||
                elem.textContent!!.indexOf('سهیله') != -1 ||
                elem.textContent!!.indexOf('چهارباغ') != -1 ||
                elem.textContent!!.indexOf('چهار باغ') != -1 ||
                elem.textContent!!.indexOf('هشتگرد') != -1 ||
                elem.textContent!!.indexOf('زعفرانیه') != -1 ||
                elem.textContent!!.indexOf('سرخاب') != -1 ||
                elem.textContent!!.indexOf('افشاریه') != -1 ||
                elem.textContent!!.indexOf('لشکرآباد') != -1 ||
                elem.textContent!!.indexOf('لشکراباد') != -1 ||
                elem.textContent!!.indexOf('لشگراباد') != -1 ||
                elem.textContent!!.indexOf('لشگرآباد') != -1 ||
                elem.textContent!!.indexOf('فشند') != -1 ||
                elem.textContent!!.indexOf('اقدسیه') != -1 ||
                elem.textContent!!.indexOf('طاووسیه') != -1 ||
                elem.textContent!!.indexOf('کردان جنوب') != -1 ||
                elem.textContent!!.indexOf('جنوب کردان') != -1 ||
                elem.textContent!!.indexOf('کردان جنوبی') != -1 ||
                elem.textContent!!.indexOf('رامجین') != -1 ||
                elem.textContent!!.indexOf('تهران دشت') != -1 ||
                elem.textContent!!.indexOf('تهراندشت') != -1
            ) elem.remove();
        }
    )

    if (contactBtn == null) return;
    if (found && interval) {
        console.log("1- interval gonna removed", interval);
        clearInterval(interval);
    }
    console.log("contact btn", contactBtn)
    console.log("interval running", interval);
    if (contactBtn != null && interval != null) {
        console.log("2- interval gonna removed", interval);
        clearInterval(interval);
        // return;
    }
    contactBtn!!.onclick = function () {
        console.log("registering click callback");
        setTimeout(function () {
            const mobile: HTMLElement | null = document.querySelector("a[href^='tel:']");
            console.log("mobile:", mobile);
            if (!mobile) return;
            let mobileAttr = mobile.attributes.getNamedItem('href');
            if (mobileAttr != null && interval != null) {
                const mobileVal = mobileAttr.value.replace('tel:', '');
                found = true;
                document.getElementsByClassName('kt-statement--info')[0].remove();
                console.log(mobileVal);
                console.log(document.querySelector("[class*='kt-page-title__title']")!!.textContent);
                console.log("3- interval gonna removed", interval);
                clearInterval(interval);
                const listing = new Listing({});
                listing.mobile = parseInt(mobileVal)
                listing.title = document.querySelector('[class^=kt-page-title__title]')!!.textContent!!
                listing.desc = document.querySelector('[class^=kt-description-row__text]')!!.textContent!!
                let elems: NodeListOf<Element> = document.querySelectorAll('.kt-group-row-item--info-row, ' +
                    '.kt-unexpandable-row');
                listing.ext_id = window.location.href
                elems.forEach(o => {
                    if (o.textContent!!.indexOf('متراژ زمین'))
                        listing.area = parseInt(o.textContent!!
                            .replace('متراژ زمین', '')
                            .replace(',', '')
                            .replace('متر', ''));
                    else if (o.textContent!!.indexOf('قیمت کل'))
                        listing.price = parseInt(o.textContent!!
                            .replace('قیمت کل', '')
                            .replace(',', '')
                            .replace('تومان', ''));
                    else if (o.textContent!!.indexOf('قیمت هر متر'))
                        listing.price_meter = parseInt(o.textContent!!
                            .replace('قیمت هر متر', '')
                            .replace(',', '')
                            .replace('تومان', ''));
                    else if (o.textContent!!.indexOf('آگهی‌دهنده'))
                        listing.advertiser = o.textContent!!
                            .replace('آگهی‌دهنده', '');
                    else
                        console.log("not saved" + o.textContent!!)
                });
                /*
                                let record = new Listing(listing.ext_id!!, listing.title!!, listing.desc!!,
                                    listing.advertiser!!, listing.area!!, listing.price!!, listing.price_meter!!, listing.district!!, listing.mobile!!, new Date(), 0
                                );
                */
                console.log(listing)
                insertRecord(listing);
            }
        }, 2000);
    };
    console.log("clicking the contact button ...");
    contactBtn!!.click();
};

function callOnLocationChange() {
    let previousUrl = '';
    const observer = new MutationObserver(function (mutations) {
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
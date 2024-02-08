// Function to open the popup
import {ListingInterface} from "./model";

import * as Sqrl from 'squirrelly'
Sqrl.filters.define("default", function (val) {
    if (val == null) {
        return ""
    } else {
        return val
    }
})
Sqrl.defaultConfig.defaultFilter = "default"

export function openPopup(listing: ListingInterface, similarListings: ListingInterface[], advrListings: ListingInterface[]): void {
    document.querySelector('#popup-table')?.remove();
    console.log(advrListings)
    const overlay = document.createElement("div");
    overlay.id = "overlay";

    const popup = document.createElement("div");
    popup.className = "popup";

    const closeButton = document.createElement("span");
    closeButton.id = 'closeBtn';
    closeButton.className = "close";
    closeButton.innerHTML = "&times;";
    closeButton.onclick = closePopup;

    const popupContent = document.createElement("div")
    popupContent.className= 'popup-table'
    var tableContents = `
        <table>
             <thead>
                 <tr class="header-row">
                    <th>عنوان</th>
                    <th>قیمت</th>
                    <th>متراژ</th>
                    <th>موبایل</th>
                    <th>بنا</th>
                    {{ @if(it.listing.advertiser == '')}}
                        <th>آگهی دهنده</th>
                    {{ /if}}
                </tr>
            </thead>
            <tbody>    
                <tr>
                    <td>{{ it.listing.title }}</td>
                    <td>{{ it.listing.price?.toLocaleString() }}</td>
                    <td>{{ it.listing.land_area }}</td>
                    <td>{{ it.listing.mobile }}</td>
                    {{ @if(it.listing.area)}}
                        <td>{{ it.listing.area }}</td>
                    {{ /if}}
                    {{ @if(it.listing.advertiser == '')}}
                        <td>{{ it.listing.advertiser }}</td>
                    {{ /if}}
                </tr>
            </tbody>  
        </table>
            
        {{ @if(it.similarListings?.length > 0)}}
            <strong>آگهی‌های مشابه</strong>
            <table>
                {{ @each(it.similarListings) => sl, i}}<tr>
                    <tr>
                        <td>{{@if(sl.watch)}} ⭐{{/if}} {{ sl.title }}</td>
                        <td>{{ sl.price?.toLocaleString() }}</td>
                        <td>{{ sl.land_area }}</td>
                        <td>{{ sl.mobile }}</td>
                        {{ @if(sl.area)}}
                            <td>{{ sl.area }}</td>
                        {{ /if}}
                        {{ @if(sl.advertiser == '')}}
                            <td>{{ sl.advertiser }}</td>
                        {{ /if}}
                    </tr>
                {{/each}}
            </table>
        {{ /if}}
        
        {{ @if(it.otherListings?.length > 0)}}
        <strong>آگهی‌های دیگر</strong>
        <table>
            {{ @each(it.otherListings) => ol}}<tr>
                <tr>
                    <td>{{@if(ol.watch)}} ⭐{{/if}} {{ ol.title }}</td>
                    <td>{{ ol.price?.toLocaleString() }}</td>
                    <td>{{ ol.land_area }}</td>
                    <td>{{ ol.mobile }}</td>
                    {{ @if(ol.area)}}
                        <td>{{ ol.area }}</td>
                    {{ /if}}
                    {{ @if(ol.advertiser == '')}}
                        <td>{{ ol.advertiser }}</td>
                    {{ /if}}
                </tr>
            {{/each}}
        </table>        
        {{/if}}
        `;

    popupContent.innerHTML = Sqrl.render(tableContents, {
        listing: listing,
        similarListings: similarListings,
        otherListings: advrListings
    })

    popup.appendChild(closeButton);
    popup.appendChild(popupContent);

    overlay.appendChild(popup);
    document.body.appendChild(overlay);
}

// Function to close the popup
export function closePopup(): void {
    const overlay = document.getElementById("overlay");
    if (overlay) {
        document.body.removeChild(overlay);
    }
}

export function addStyles(): void {
    const styleElement: HTMLStyleElement = document.createElement("style");
    styleElement.textContent = `
        /* Table Styles */
        .popup-table {
            border-collapse: collapse;
            width: 20%; /* Set the width of the table */
            position: fixed; /* Position the table */
            top: 150px; /* Distance from the top of the page */
            right: 20px; /* Distance from the right of the page */
            background-color: #ffffff; /* Background color of the table */
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); /* Add box shadow */
        }
        
        #closeBtn{
            position: fixed; /* Position the table */
            top: 137px; /* Distance from the top of the page */
            right: 12px; /* Distance from the right of the page */
            font-size: 29px;
            z-index: 9999;        
        }
        
        .popup-table th, .popup-table td {
            padding: 8px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        
        /* Header Row Styles */
        tr.header-row {
            background-color: #f2f2f2;
            font-weight: bold;
        }
        
        .popup-table tr:nth-child(odd) {
            background-color: #ffffff;
        }
                
        #overlay{
            display: flex
        }
        
        @media (max-width: 768px) {
            .popup-table {
                width: 90%; /* Adjust width for smaller screens */
            }
        }
    `;

    // Append the style element to the document's head
    document.head.appendChild(styleElement);
}

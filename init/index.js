require("dotenv").config({ path: "../.env" });

const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const initData = require("./data.js");
const dbUrl = process.env.ATLASDB_URL

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapBoxToken });

async function main() {
    await mongoose.connect(dbUrl);
    console.log("Connected to db");
}

main().catch((err) => console.log(err));

const seedDB = async () => {
    await Listing.deleteMany({});
    console.log("Old listings deleted");

    for (let listing of initData.data) {
        // 1. Geocode the location
        const geoData = await geocodingClient
            .forwardGeocode({
                query: listing.location,
                limit: 1,
            })
            .send();

        if (!geoData.body.features.length) {
            console.log("❌ No geocode result for:", listing.location);
            continue;
        }
        // 2. Create new listing
        const newListing = new Listing(listing);

        // 3. Add geometry
        newListing.geometry = geoData.body.features[0].geometry;

        // 4. Add default owner
        newListing.owner = "69841829cd52dd364e06b372";

        // 5. Add categories based on listing characteristics
        const categories = [];
        const title = listing.title.toLowerCase();
        const description = listing.description.toLowerCase();
        const price = listing.price;

        // Budget friendly (under $1500)
        if (price < 1500) categories.push('budgetfriendly');
        
        // International (non-US countries)
        if (listing.country !== 'United States') categories.push('international');
        
        // Adventure (mountain, safari, ski, etc.)
        if (title.includes('mountain') || title.includes('ski') || title.includes('safari') || 
            title.includes('adventure') || description.includes('adventure') || 
            title.includes('retreat')) {
            categories.push('adventure');
        }
        
        // Urban (city, loft, downtown)
        if (title.includes('city') || title.includes('urban') || title.includes('loft') || 
            title.includes('downtown') || title.includes('penthouse')) {
            categories.push('urban');
        }
        
        // Nature (beach, tree, lake, etc.)
        if (title.includes('beach') || title.includes('tree') || title.includes('lake') || 
            title.includes('nature') || title.includes('cottage') || description.includes('nature')) {
            categories.push('nature');
        }
        
        // Trending (expensive or unique properties)
        if (price > 2000 || title.includes('luxury') || title.includes('villa') || 
            title.includes('castle') || title.includes('island')) {
            categories.push('trending');
        }
        
        // Top rated (historic, luxury properties)
        if (title.includes('historic') || title.includes('luxury') || title.includes('villa') || 
            price > 1800) {
            categories.push('toprated');
        }

        // Add some as nearby (randomly for demo)
        if (Math.random() < 0.3) categories.push('nearby');

        newListing.categories = categories;

        // 6. Save listing
        await newListing.save();
        console.log("✔ Added:", newListing.title, "Categories:", categories.join(', '));
    }

    console.log("Seeding complete!");
};

seedDB().then(() => {
    mongoose.connection.close();
});
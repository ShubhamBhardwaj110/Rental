const Listing = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapBoxToken });

//index route
module.exports.index = async(req,res)=>{
    const { filter } = req.query;
    let query = {};
    
    if (filter) {
        query.categories = { $in: [filter] };
    }
    
    const allListings = await Listing.find(query);
    res.render("listings/index.ejs", { allListings, currentFilter: filter || null });
};

module.exports.renderNewForm = (req,res)=>{
    res.render("listings/new.ejs")
}

//show route
module.exports.showListing = async(req,res)=>{
    let {id} = req.params;
const listing = await Listing.findById(id)
  .populate({ path: "reviews", populate: { path: "author" } })
  .populate("owner");
    if(!listing){
        req.flash("error","listing does not exist")
        return res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs",{listing});
};

//create route
module.exports.createListing = async (req, res, next) => {
    let response = await geocodingClient
        .forwardGeocode({
            query: req.body.listing.location,
            limit: 1,
        })
        .send();
    let url = req.file.path;
    let filename = req.file.filename;
    const listing = new Listing(req.body.listing);
    listing.image = { url, filename };
    listing.geometry = response.body.features[0].geometry;
    listing.owner = req.user._id;
    await listing.save();
    console.log(listing);
    req.flash("success","Successfully made a new listing!");
    res.redirect(`/listings/${listing._id}`);
};

//edit Route
module.exports.editForm =async(req,res)=>{
    let {id} = req.params;
    const listing =await Listing.findById(id);
    if(!listing){
        req.flash("error","listing does not exist")
        return res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace('/upload/', '/upload/w_300/');   
    res.render("listings/edit.ejs",{listing, originalImageUrl});
};

//Update Route
module.exports.updateListing = async(req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate((id),{...req.body.listing});
    if(typeof req.file !== 'undefined'){
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
    }
    req.flash("success","listing updated!")
    res.redirect(`/listings/${id}`);
} 

//Delete route
module.exports.destroyListing = async(req,res)=>{
    let {id} = req.params;
    const deletedlisting = await Listing.findByIdAndDelete(id);
    console.log(deletedlisting);
    req.flash("success","listing deleted");
    res.redirect("/listings");
}
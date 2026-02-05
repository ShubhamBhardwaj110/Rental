const Listing = require("../models/listing");
const Review = require("../models/review");

module.exports.createReview = async(req,res)=>{   
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);
    
    console.log(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success","review created!")
    res.redirect(`/listings/${listing._id}`);   
}

module.exports.updateReview = async(req,res)=>{
    const { id, reviewId } = req.params;
    
    try {
        await Review.findByIdAndUpdate(reviewId, req.body.review);
        req.flash("success", "Review updated successfully!");
        res.redirect(`/listings/${id}`);
    } catch (error) {
        console.log("Error updating review:", error);
        req.flash("error", "Error updating review!");
        res.redirect(`/listings/${id}`);
    }
}

module.exports.destroyReview = async(req,res)=>{
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

    //pull operator in mongoose help up remove the elements from the array here remove from reviews array the following review id
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","review deleted!")

    res.redirect(`/listings/${id}`);
}
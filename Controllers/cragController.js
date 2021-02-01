const Crag = require('../models/crag');
const cloudinary = require('cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = multer.diskStorage({});

const upload = multer({storage});

exports.upload = upload.single('image');

exports.pushToCloudinary = (req,res,next) => {
    if(req.file) {
        cloudinary.uploader.upload(req.file.path)
        .then( (result) => {
            req.body.image = result.public_id;
            next();
        })
        .catch(() => {
            req.flash('error', 'Sorry there was a problem uploading your image, please try again');
            res.redirect('/admin/add');
        })
    }else{
        next();
    }
}

// exports.homePage = (req,res) => {
//     res.render('index', { title: 'Climb On!' });
// }

exports.listAllCrags = async (req,res, next) => {
    try{
        const allCrags = await Crag.find({available: {$eq:true}});
        res.render('all_crags', {title: 'All Crags', allCrags});
        //res.json(allCrags);
    }catch(error){
        next(error)
    }
}

exports.listAllCountries = async (req,res,next) =>{
    try{
        const allCountries = await Crag.distinct('country');
        res.render('all_countries', {title: 'Browse by Country', allCountries});
    }catch(error){
        next(error)
    }

}

exports.homePageFilters = async (req,res,next) => {
    try{
        const crags = Crag.aggregate([
            {$match : {available: true}},
            {$sample: {size: 9}}
        ]);
        const countries = Crag.aggregate([
            {$group: {_id : '$country' }},
            {$sample: {size: 9}}
        ]);

        const [filteredCountries, filteredCrags] = await Promise.all([countries,crags]);

        res.render('index', {filteredCountries, filteredCrags});
    }catch(error){
        next(error)
    }
}

exports.adminPage = (req,res) => {
    res.render('admin', {title: 'Admin'}) 
}

exports.createCragGet = (req,res) => {
    res.render('add_crag', {title: 'Add new crag'})
}

exports.createCragPost = async (req,res,next) => {
    try{
        const crag = new Crag(req.body);
        await crag.save();
        req.flash('success',`${crag.crag_name}`)
        res.redirect(`/all/${crag._id}`);
    }catch(error) {
        next(error)
    }
}

exports.editRemoveGet = (req,res) => {
    res.render('edit_remove', {title: 'Search for crag to edit or remove'});
}

exports.editRemovePost = async (req,res,next) => {
    try{
        const cragId = req.body.crag_id || null;
        const cragName = req.body.crag_name || null;

        const cragData = await Crag.find({$or: [
            {_id: cragId},
            {crag_name: cragName}
        ]}).collation({
            locale: 'en',
            strength: 2
        });

        if(cragData.length > 0){
            res.render('crag_detail', {title:'Add/Remove Crag', cragData});
            return
        } else {
            req.flash('info','No crags were found...');
            res.redirect('admin/edit-remove')
        }
    }catch(error){
        next(error)
    }
}

exports.updateCragGet = async (req,res,next) => {
    try{
        const crag = await Crag.findOne({_id: req.params.cragId});
        res.render('add_crag', {title: 'Update Crag',crag})
    }catch(error){
        next(error)
    }
}

exports.updateCragPost = async (req,res,next) => {
    try{
        const cragId = req.params.cragId;
        const crag = await Crag.findByIdAndUpdate(cragId, req.body, {new:true});
        req.flash('success',`${crag.crag_name}`)
        res.redirect(`/all/${cragId}`)
    }catch(error){
        next(error)
    }
}

exports.deleteCragGet = async (req,res,next) => {
    try{
        const cragId = req.params.cragId;
        const crag = await Crag.findOne({_id: cragId})
        res.render('add_crag', {title:'Delete crag', crag});
    }catch(error){
        next(error)
    }
}

exports.deleteCragPost = async (req,res,next) => {
    try{
        const cragId = req.params.cragId;
        const crag = await Crag.findByIdAndRemove({_id: cragId})
        req.flash('info',`CragID: ${cragId} Deleted`)
        res.redirect('/')
    }catch(error){
        next(error)
    }
}

exports.cragDetail = async (req,res,next) => {
    try{
        const cragParam = req.params.crag;
        const cragData = await Crag.find({_id: cragParam})
        res.render('crag_detail', {title: 'Climb On', cragData})
    }catch(error){
        next(error)
    }
}

exports.cragsByCountry = async (req,res,next) => {
    try{
        const countryParam = req.params.country;
        const countryList = await Crag.find({country: countryParam});
        res.render('crags_by_country', {title: `Browse by Country: ${countryParam}`, countryList});
    }catch(error){
        next(error)
    }
}

exports.searchResults = async (req,res,next) => {
    try{
        const searchQuery = req.body;
        const parsedStars = parseInt(searchQuery.stars) || 1;
        const parsedSort = parseInt(searchQuery.sort) || 1;
        const searchData = await Crag.aggregate([
            { $match: { $text: { $search: `\"${searchQuery.destination }\"` }}},
            { $match: { available: true , star_rating: { $gte: parsedStars} }},
            { $sort: { cost_per_day: parsedSort}}
        ]);
        res.render('search_results', {title: 'Search results', searchQuery, searchData});
    }catch(error){
        next(error)
    }
}




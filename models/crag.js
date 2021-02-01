const mongoose = require('mongoose');

const cragSchema = new mongoose.Schema({
    crag_name: {
        type: String,
        required: 'Crag name is required',
        max: 32,
        trim: true
    },
    crag_description: {
        type: String,
        required: 'Crag description is required',
        trim: true
    },
    image: String,
    star_rating: {
        type: Number,
        required: 'Star rating is required',
        max: 5
    },
    country: {
        type:String,
        required: 'Country is required',
        trim: true
    },
    cost_per_day: {
        type: Number,
        required: 'Cost per day is required'
    },
    available: {
        type: Boolean,
        required: 'Availability is required'
    }
});

cragSchema.index({
    crag_name:'text',
    country: 'text'
});

//Export model
module.exports = mongoose.model('Crag',cragSchema);
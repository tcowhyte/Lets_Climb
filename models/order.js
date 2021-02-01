const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    crag_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    order_details: {
        type: Object,
        required: true
    }
});

module.exports = mongoose.model('order', orderSchema);
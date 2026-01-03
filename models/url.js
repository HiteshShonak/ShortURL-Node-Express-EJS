const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
shortId: { type: String, required: true, unique: true },
redirectUrl: { type: String, required: true },
visitHistory: [{timestamp: {type: Number}, 
                device: { type: String }, 
                ip: { type: String },
                location: { type: String },
                referrer: { type: String },
                region: { type: String },
                latitude: { type: Number },
                longitude: { type: Number },
               }],
createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}
},
{ timestamps: true }
);

const URL = mongoose.model('Url', urlSchema);

module.exports = URL;
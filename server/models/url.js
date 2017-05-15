'use strict';
const mongoose = require('mongoose');

var Url = mongoose.model('Url', {
	originalUrl: {
		type: String,
		trim: true,
		required: true
	},
	shortenedUrl: {
		type: Number,
		trim: true
	}
});

module.exports = {
	Url
};

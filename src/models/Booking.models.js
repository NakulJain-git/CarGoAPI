import mongoose ,{Schema} from "mongoose";

const bookingSchema = new Schema({
    pickUpDate: {
		type: Date,
		required: [true, "Please add a pickUpDate"]
	},
	returnDate: {
		type: Date,
		required: [true, "Please add a returnDate"]
	},
	pickUpLocation: {
		type: String,
		required: [true, "Please add a pickUpLocation"]
	},
	returnLocation: {
		type: String,
		required: [true, "Please add a returnLocation"]
	},
	user: {
		type: mongoose.Schema.ObjectId,
		ref: "User",
		required: [true, "Please add a user"]
	},
	broker: {
		type: mongoose.Schema.ObjectId,
		ref: "Broker",
		required: [true, "Please add a provider"]
	}

},{timestamps:true});

export const Booking=mongoose.model("Booking",bookingSchema);
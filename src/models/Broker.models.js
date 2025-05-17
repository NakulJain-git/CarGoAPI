import mongoose, { Schema } from "mongoose";

const brokerSchema = new Schema({
    brokerName: {
        type: String,
        required: [true, "Please add a name"],
        unique: true,
        trim: true,
        maxlength: [50, "Name can not be more than 50 characters"]
    },
    address: {
        type: String,
        required: [true, "Please add an address"]
    },
    pickUpAndReturnLocations: [String],
    rentalCarAmount: {
        type: Number,
        required: [true, "Please add rental car amount"]
    },
    rentalCarCapacity: {
        type: Number,
        required: [true, "Please add rental car capacity"]
    },
    carBookings: [
        {
            type: Schema.Types.ObjectId,
            ref: "Booking"
        }
    ],
}, { timestamps: true });

//if want to remove the bookings when the provider is deleted

// providerSchema.pre("remove", async function (next) {
//   console.log(`Rentals being removed from provider ${this.id}`);
//   await this.model("Booking").deleteMany({ broker: this._id });
//   next();
// });

export const Broker = mongoose.model("Broker", brokerSchema);
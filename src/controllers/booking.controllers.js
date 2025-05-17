import { Booking } from "../models/Booking.models.js";
import { Broker } from '../models/Broker.models.js';
import { User } from '../models/User.models.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const getAllBookings = asyncHandler(async (req, res) => {
    let bookings = []
    try {
        if (req.user.role == "admin") {
            bookings = await Booking.find().populate("user").populate("broker");
        }
        else {
            bookings = await Booking.find({ user: req.user._id }).populate("user").populate("broker");
        }
        return res
            .status(200)
            .json(new ApiResponse(200, { count: bookings.length, data: bookings }, "Bookings fetched successfully"));
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new ApiResponse(500, {}, "Internal server error"));
    }
});

const getBookingById = asyncHandler(async (req, res) => {
    let booking = await Booking.findById(req.params.id).populate("user").populate("broker");
    if (!booking) {
        throw new ApiError(404, "Booking not found");
    }
    if (req.user.role !== "admin" && booking.user._id.toString() !== req.user._id) {
        throw new ApiError(403, "You are not authorized to access this booking");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, { booking }, "Booking fetched successfully"));
})

const createBooking = asyncHandler(async (req, res) => {
    try {
        const brokerId = req.params.brokerId;
        const pickUpDate = new Date(req.body.pickUpDate)
        const returnDate = new Date(req.body.returnDate)
        const broker = await Broker.findById(brokerId);
        if (!broker) {
            throw new ApiError(404, "Broker not found");
        }
        const booking = await Booking.create({
            ...req.body,
            pickUpDate,
            returnDate,
            userId: req.user._id,
            brokerId
        });
        await User.findByIdAndUpdate(req.user._id, {
            $push: { bookings: booking._id }
        });

        await Broker.findByIdAndUpdate(brokerId, {
            $push: { carBookings: booking._id }
        });

        return res
            .status(201)
            .json(new ApiResponse(201, { data: booking }, "Booking created successfully"));
    } catch (error) {
        console.log(error);
        throw new ApiError(500, "Internal server error");
    }
})

const updateBooking = asyncHandler(async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            throw new ApiError(404, "Booking not found");
        }
        if (req.user.role !== "admin" && booking.user.toString() !== req.user._id) {
            throw new ApiError(403, "You are not authorized to update this booking");
        }
        const updatedBooking = await Booking.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );
        if (!updatedBooking) {
            throw new ApiError(404, "Booking could not be updated");
        }
        return res
            .status(200)
            .json(new ApiResponse(200, { data: updatedBooking }, "Booking updated successfully"));
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .jsonF(new ApiResponse(500, {}, "Internal server error"));

    }
})

const deleteBooking = asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
        throw new ApiError(404, "Booking not found");
    }
    if (req.user.role !== "admin" && booking.userId.toString() !== req.user._id) {
        throw new ApiError(403, "You are not authorized to delete this booking");
    }
    // Remove booking ID from User
    await User.findByIdAndUpdate(booking.user, {
        $pull: { bookings: booking._id }
    });

    // Remove booking ID from Broker
    await Broker.findByIdAndUpdate(booking.broker, {
        $pull: { carBookings: booking._id }
    });

    await booking.deleteOne();
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Booking deleted successfully"));
});

export{
    getAllBookings,
    getBookingById,
    createBooking,
    updateBooking,
    deleteBooking
}
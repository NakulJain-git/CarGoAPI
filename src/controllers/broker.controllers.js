import { Broker } from '../models/Broker.models.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const getAllBrokers = asyncHandler(async (req, res) => {
    let brokers
    if (req.user.role === "admin") {
        brokers = await Broker.find().populate("carBookings")
    }
    else {
        brokers = await Broker.find().select('-carBookings -createdAt -updatedAt');
    }
    return res
        .status(201)
        .json(new ApiResponse(200, { count: brokers.length, data: brokers }, "Brokers fetched successfully"));
})

const getBrokerById = asyncHandler(async (req, res) => {
    let broker
    console.log(req.user.role)
    if (req.user.role === "admin") {
        broker = await Broker.findById(req.params.id).populate("carBookings");
    }
    else {
        broker = await Broker.findById(req.params.id).select('-carBookings -createdAt -updatedAt');
    }
    if (!broker) {
        throw new ApiError(404, "Broker not found");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, { broker }, "Broker fetched successfully"));
});

const createBroker = asyncHandler(async (req, res) => {
    const { brokerName, address, rentalCarAmount, rentalCarCapacity, pickUpAndReturnLocations } = req.body;
    try {
        const existingBroker = await Broker.findOne({
            brokerName
        });
        console.log(existingBroker)
        if (existingBroker) {
            throw new ApiError(409, "Broker already exists");
        }
        if (!brokerName || !address || !rentalCarAmount || !rentalCarCapacity) {
            throw new ApiError(400, "Please provide all required fields");
        }
        if (rentalCarAmount < 0 || rentalCarCapacity < 0) {
            throw new ApiError(400, "Rental car amount and capacity must be positive");
        }
        const broker = await Broker.create({
            brokerName,
            address,
            pickUpAndReturnLocations,
            rentalCarAmount,
            rentalCarCapacity
        });
        return res
            .status(201)
            .json(new ApiResponse(201, { data: broker }, "Broker created successfully"));

    } catch (error) {
        console.log(error);
        if (error instanceof ApiError) {
            return res
                .status(error.statusCode)
                .json(new ApiResponse(error.statusCode, {}, error.message));
        }
        else return res
            .status(500)
            .json(new ApiResponse(500, { error }, "Internal server error"));
    }
})

const updateBroker = asyncHandler(async (req, res) => {
    try {
        const updatedBroker = await Broker.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );
        if (!updatedBroker) {
            return ApiError(404, "Broker could not be updated");
        }
        return res
            .status(200)
            .json(new ApiResponse(200, { data: updatedBroker }, "Broker updated successfully"));
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new ApiResponse(500, null, "Internal server error"));

    }
})

const deleteBroker = asyncHandler(async (req, res) => {
    try {
        const deletedBroker = await Broker.findByIdAndDelete(req.params.id);
        if (!deletedBroker) {
            throw new ApiError(404, "Broker not found");
        }
        return res
            .status(200)
            .json(new ApiResponse(200, "Broker deleted successfully"));
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new ApiResponse(500, null, "Internal server error"));

    }
})

export {
    getAllBrokers,
    getBrokerById,
    createBroker,
    updateBroker,
    deleteBroker
}
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/User.models.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from "jsonwebtoken"
const generateAccessAndRefereshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }

    } catch (err) {
        throw new ApiError(400, err)
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { userName, password, email, role } = req.body
    if ([userName, email, password].some((field) => field?.trim === "")
    ) {
        throw new ApiError(400, "All fields are req")
    }

    const existedUser = await User.findOne({
        $or: [{ userName }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with username or email already exits..")
    }
    if (role === "") {
        role = "user"
    }
    const user = await User.create({
        userName: userName,
        email: email,
        password: password,
        role: role
    })
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if (!createdUser) {
        throw new ApiError(504, "something went wrong while registering")
    }
    return res.status(201).json(
        new ApiResponse(200, createdUser, "USer registered succesfully")
    )


})

const login = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body

    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }
    const user = await User.findOne({
        $or: [{ email }]
    });

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    const options = {
        httpOnly: true,
        secure: true
    }
    res.status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(201, { accessToken, refreshToken, loggedInUser }, "Logged IN"))

})

const logout = asyncHandler(async (req, res) => {
    const newUser = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined,
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(201, {}, "Logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body?.refreshToken

    if (incomingRefreshToken === "") {
        throw new ApiError(401, "Unauthorized Access")
    }
    const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET,
    )
    console.log(decodedToken);
    const user = await User.findById(decodedToken?._id)
    if (!user) {
        throw new ApiError(401, "Invalid Refresh Token")
    }
    if (incomingRefreshToken !== user?.refreshToken) {
        throw new ApiError(401, "Invalid Refresh Token")
    }
    const { accessToken, newRefreshToken } = await generateAccessAndRefereshTokens(user._id)
    const options = {
        httpOnly: true,
        secure: true
    }
    res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access Token Refreshed"))

})

const updatePassword = asyncHandler(async (req, res) => {
    console.log(req.body)
    const { oldPassword, newPassword } = req.body
    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "All fields are required")
    }
    const user = await User.findById(req.user._id)
    const isPasswordValid = await user.isPasswordCorrect(oldPassword)
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }
    user.password = newPassword
    await user.save({ validateBeforeSave: false })
    return res
        .status(200)
        .json(new ApiResponse(200, { user }, "Password updated successfully"))
})

const getMe = asyncHandler(async (req, res) => {
    try {
        console.log(req.user._id)
        const user = await User.findById(req.user._id).select("-password -refreshToken")
        if (!user) {
            throw new ApiError(404, "User not found")
        }
        return res.status(200)
        .json(new ApiResponse(200, user, "User fetched successfully"))
    } catch (error) {
        throw new ApiError(500, error?.message || "Internal server error")
    }
})
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndDelete(req.user._id)
    if (!user) {
        throw new ApiError(404, "User not found")
    }
    return res.status(200)
        .json(new ApiResponse(200, {}, "User deleted successfully"))
})
export {
    registerUser,
    login,
    logout,
    refreshAccessToken,
    getMe,
    updatePassword,
    deleteUser
}
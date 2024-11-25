const Image = require("../models/ImageModel");

const createImage = (newImage) => {
    return new Promise(async (resolve, reject) => {
        const { name, address, pointX, pointY, isStation } = newImage
        try {
            const checkImage = await Image.findOne({
                name: name,
                address: address,
                pointX: pointX,
                pointY: pointY
            })
            if (checkImage !== null){
                resolve({
                    status: "ERROR",
                    message: "A image with this address already exists."
                })
                return;
            }

            const createdImage = await Image.create({
                name,
                address,
                pointX,
                pointY,
                isStation
            })
            if (createdImage){
                resolve({
                    status: "OK",
                    message: "Image created successfully.",
                    data: createdImage
                })
            }
        } catch (e) {
            reject({
                status: "ERROR",
                message: "An error occurred while creating the image.",
                error: e
            })
        }
    })
}

const getAllImage = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const allImage = await Image.find();
            resolve({
                status: "OK",
                message: "Images retrieved successfully.",
                data: allImage
            })

        } catch (e) {
            reject({
                status: "ERROR",
                message: "An error occurred while retrieving the images.",
                error: e
            })
        }
    })
}

const updateImage = (ImageId, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkImage = await Image.findOne({ _id: ImageId });
            if (checkImage === null){
                resolve({
                    status: "ERROR",
                    message: "No image found with the provided ID."
                })
                return;
            }

            const updatedImage = await Image.findByIdAndUpdate(ImageId, data, { new: true });

            if (!updatedImage) {
                resolve({
                    status: "ERROR",
                    message: "Failed to update the image or image not found."
                });
                return;
            }

            resolve({
                status: "OK",
                message: "Image updated successfully.",
                data: updatedImage
            })

        } catch (e) {
            reject({
                status: "ERROR",
                message: "An error occurred while updating the image.",
                error: e
            })
        }
    })
}

const getDetailImage = (ImageId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const image = await Image.findOne({
                _id: ImageId
            })
            if (image === null){
                resolve({
                    status: 'ERROR',
                    message: 'No image found with the provided ID.'
                })
                return;
            }
            resolve({
                status: "OK",
                message: "Image details retrieved successfully.",
                data: image
            })

        } catch (e) {
            reject({
                status: "ERROR",
                message: "An error occurred while retrieving the image details.",
                error: e
            })
        }
    })
}

const deleteImage = (ImageId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const image = await Image.findOne({
                _id: ImageId
            })
            if (image === null){
                resolve({
                    status: 'ERROR',
                    message: 'No image found with the provided ID.'
                })
                return;
            }

            await Image.findByIdAndDelete(ImageId)
            resolve({
                status: "OK",
                message: "Image deleted successfully.",
            })

        } catch (e) {
            reject({
                status: "ERROR",
                message: "An error occurred while deleting the image.",
                error: e
            })
        }
    })
}

module.exports = {
    createImage,
    getAllImage,
    updateImage,
    getDetailImage,
    deleteImage
}
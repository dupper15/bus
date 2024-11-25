const ImageService = require('../services/ImageService')
require("../services/OpinionService");
const createImage =  async (req, res) => {
    try {
        const { name, address, pointX, pointY , isStation} = req.body
        if (!name || !address || !pointX || !pointY || !isStation) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'All fields are required.'
            })
        }

        const response = await ImageService.createImage(req.body)
        return res.status(201).json(response)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while creating the image.',
            error: e
        })
    }
}

const getDetailImage =  async (req, res) => {
    try {
        const ImageId = req.params.id
        if (!ImageId){
            return res.status(400).json({
                status: 'ERROR',
                message: 'Image ID is required.'
            })
        }
        const response = await ImageService.getDetailImage(ImageId)
        return res.status(200).json(response)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while retrieving the image details.',
            error: e
        })
    }
}

const updateImage = async (req, res) => {
    try {
        const ImageId = req.params.id
        const data = req.body
        if (!ImageId) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Image ID is required.'
            })
        }
        const response = await ImageService.updateImage(ImageId, data)
        return res.status(200).json(response)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while updating the image.'
        })
    }
}

const getAllImage =  async (req, res) => {
    try {
        const response = await ImageService.getAllImage()
        return res.status(200).json(response)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while retrieving the images.',
            error: e
        })
    }
}

const deleteImage =  async (req, res) => {
    try {
        const ImageId = req.params.id
        if (!ImageId){
            return res.status(400).json({
                status: 'ERROR',
                message: 'Image ID is required.'
            })
        }
        const response = await ImageService.deleteImage(ImageId)
        return res.status(200).json(response)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while deleting the image.',
            error: e
        })
    }
}

module.exports = {
    createImage,
    getDetailImage,
    updateImage,
    getAllImage,
    deleteImage
}
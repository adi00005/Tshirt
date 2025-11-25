import asyncHandler from 'express-async-handler';
import Design from '../models/Design.js';
import User from '../models/User.js';
import { generateThumbnail } from '../utils/imageProcessing.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

// @desc    Save a new design
// @route   POST /api/designs
// @access  Private
export const saveDesign = asyncHandler(async (req, res) => {
  const { name, description, designData, thumbnail, isTemplate = false } = req.body;
  const userId = req.user._id;

  if (!name || !designData) {
    res.status(400);
    throw new Error('Name and design data are required');
  }

  // Generate a thumbnail if not provided
  let thumbnailUrl = thumbnail;
  if (!thumbnailUrl && designData.canvasImage) {
    try {
      const thumbnailResult = await generateThumbnail(designData.canvasImage);
      const uploadResult = await uploadToCloudinary(thumbnailResult, 'designs/thumbnails');
      thumbnailUrl = uploadResult.secure_url;
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      // Continue with empty thumbnail if generation fails
      thumbnailUrl = '';
    }
  }

  const design = await Design.create({
    user: userId,
    name,
    description,
    designData,
    thumbnail: thumbnailUrl,
    template: isTemplate,
    category: isTemplate ? 'template' : 'tshirt',
    isPublic: false,
    version: 1
  });

  // Add design to user's designs array
  await User.findByIdAndUpdate(userId, {
    $push: { designs: design._id }
  });

  res.status(201).json({
    success: true,
    data: design
  });
});

// @desc    Get a single design by ID
// @route   GET /api/designs/:id
// @access  Private
export const getDesign = asyncHandler(async (req, res) => {
  const design = await Design.findOne({
    _id: req.params.id,
    $or: [
      { user: req.user._id },
      { isPublic: true }
    ]
  });

  if (!design) {
    res.status(404);
    throw new Error('Design not found or access denied');
  }

  res.json({
    success: true,
    data: design
  });
});

// @desc    Get all designs for the current user
// @route   GET /api/designs/my-designs
// @access  Private
export const getMyDesigns = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
  const skip = (page - 1) * limit;

  const [designs, total] = await Promise.all([
    Design.find({ user: req.user._id })
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit)),
    Design.countDocuments({ user: req.user._id })
  ]);

  res.json({
    success: true,
    count: designs.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    data: designs
  });
});

// @desc    Update a design
// @route   PUT /api/designs/:id
// @access  Private
export const updateDesign = asyncHandler(async (req, res) => {
  const { name, description, designData, thumbnail } = req.body;
  
  const design = await Design.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    {
      name,
      description,
      designData: designData || undefined,
      thumbnail: thumbnail || undefined,
      $inc: { version: 1 },
      lastModified: Date.now()
    },
    { new: true, runValidators: true }
  );

  if (!design) {
    res.status(404);
    throw new Error('Design not found or access denied');
  }

  res.json({
    success: true,
    data: design
  });
});

// @desc    Delete a design
// @route   DELETE /api/designs/:id
// @access  Private
export const deleteDesign = asyncHandler(async (req, res) => {
  const design = await Design.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id
  });

  if (!design) {
    res.status(404);
    throw new Error('Design not found or access denied');
  }

  // Remove design from user's designs array
  await User.findByIdAndUpdate(req.user._id, {
    $pull: { designs: design._id }
  });

  res.json({
    success: true,
    data: {}
  });
});

// @desc    Get all public templates
// @route   GET /api/designs/templates
// @access  Public
export const getTemplates = asyncHandler(async (req, res) => {
  const { category, limit = 12, page = 1 } = req.query;
  const skip = (page - 1) * limit;

  const query = { 
    isPublic: true,
    template: true
  };

  if (category) {
    query.category = category;
  }

  const [templates, total] = await Promise.all([
    Design.find(query)
      .select('name description thumbnail category')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit)),
    Design.countDocuments(query)
  ]);

  res.json({
    success: true,
    count: templates.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    data: templates
  });
});

// @desc    Apply a template to a new design
// @route   POST /api/designs/apply-template/:templateId
// @access  Private
export const applyTemplate = asyncHandler(async (req, res) => {
  const template = await Design.findOne({
    _id: req.params.templateId,
    isPublic: true,
    template: true
  });

  if (!template) {
    res.status(404);
    throw new Error('Template not found');
  }

  // Create a new design based on the template
  const newDesign = await Design.create({
    user: req.user._id,
    name: `My ${template.name}`,
    description: `Based on template: ${template.name}`,
    designData: template.designData,
    thumbnail: template.thumbnail,
    template: false,
    category: 'tshirt',
    isPublic: false,
    version: 1
  });

  // Add design to user's designs array
  await User.findByIdAndUpdate(req.user._id, {
    $push: { designs: newDesign._id }
  });

  res.status(201).json({
    success: true,
    data: newDesign
  });
});

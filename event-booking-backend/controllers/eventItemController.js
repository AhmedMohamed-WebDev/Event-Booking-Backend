const EventItem = require("../models/EventItem");
const { generateGoogleMapLinks } = require("../utils/googleMaps");
const cloudinary = require("../utils/cloudinary");

exports.createEventItem = async (req, res) => {
  try {
    const item = await EventItem.create({ ...req.body, supplier: req.user.id });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllEventItems = async (req, res) => {
  try {
    const items = await EventItem.find().populate("supplier", "name phone");
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// exports.getEventItemById = async (req, res) => {
//   try {
//     const item = await EventItem.findById(req.params.id).populate("supplier");
//     if (!item) return res.status(404).json({ message: "Item not found" });
//     res.json(item);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

exports.getEventItemById = async (req, res) => {
  try {
    const item = await EventItem.findById(req.params.id).populate("supplier");
    if (!item) return res.status(404).json({ message: "Item not found" });

    const { lat, lng } = item.location.coordinates || {};
    const mapLinks = lat && lng ? generateGoogleMapLinks(lat, lng) : {};

    res.json({ ...item.toObject(), ...mapLinks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateEventItem = async (req, res) => {
  try {
    const item = await EventItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteEventItem = async (req, res) => {
  try {
    await EventItem.findByIdAndDelete(req.params.id);
    res.json({ message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// exports.searchEventItems = async (req, res) => {
//   try {
//     const { city, area, category, people, date } = req.query;

//     const query = {};

//     // 🔍 Location filters (optional)
//     if (city) query["location.city"] = city;
//     if (area) query["location.area"] = area;

//     // 🔍 Category (e.g. Wedding, Funeral)
//     if (category) query.category = category;

//     // 🔍 Number of People (e.g. 150 → between min & max)
//     if (people) {
//       const count = parseInt(people);
//       query.minCapacity = { $lte: count };
//       query.maxCapacity = { $gte: count };
//     }

//     // 🔍 Event Date Availability
//     if (date) {
//       const searchDate = new Date(date);
//       query.availableDates = { $in: [searchDate] };
//     }

//     // 🔍 Perform search with supplier info
//     const results = await EventItem.find(query).populate(
//       "supplier",
//       "name phone"
//     );

//     res.json(results);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Search failed" });
//   }
// };
exports.searchEventItems = async (req, res) => {
  try {
    const {
      city,
      area,
      category,
      date,
      people,
      subcategory, // new optional
      minPrice,
      maxPrice,
    } = req.query;

    const query = {};

    if (city) query["location.city"] = city;
    if (area) query["location.area"] = area;
    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory; // optional in future

    if (people) {
      const count = parseInt(people);
      query.minCapacity = { $lte: count };
      query.maxCapacity = { $gte: count };
    }

    if (date) {
      query.availableDates = { $in: [new Date(date)] };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseInt(minPrice);
      if (maxPrice) query.price.$lte = parseInt(maxPrice);
    }

    const results = await EventItem.find(query)
      .populate("supplier", "name phone")
      .sort({ createdAt: -1 });

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Search failed" });
  }
};

exports.subFilterEventItems = async (req, res) => {
  try {
    const { category, subcategory } = req.query;

    const query = {};

    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;

    const results = await EventItem.find(query).populate(
      "supplier",
      "name phone"
    );

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Sub-filtering failed" });
  }
};

exports.uploadEventMedia = async (req, res) => {
  try {
    const itemId = req.params.id;

    // Check if any files were uploaded
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    // Get existing item
    const existingItem = await EventItem.findById(itemId);
    if (!existingItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Process all uploads
    const allFiles = [
      ...(req.files.images || []).map((file) => ({ file, type: "image" })),
      ...(req.files.videos || []).map((file) => ({ file, type: "video" })),
    ];

    const uploadPromises = allFiles.map(({ file, type }) => {
      return new Promise((resolve, reject) => {
        const filename = `${Date.now()}-${file.originalname.replace(
          /\s+/g,
          "-"
        )}`;

        const uploadOptions = {
          folder: "event_items",
          resource_type: type,
          public_id: filename,
          unique_filename: true,
          ...(type === "video"
            ? {
                eager: [{ width: 720, crop: "scale" }, { quality: "auto" }],
              }
            : {
                transformation: [
                  { width: 1200, crop: "limit" },
                  { fetch_format: "auto", quality: "auto" },
                ],
              }),
        };

        const stream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) return reject(error);
            resolve({
              url: result.secure_url,
              public_id: result.public_id,
              originalName: file.originalname,
              type,
            });
          }
        );
        stream.end(file.buffer);
      });
    });

    const uploads = await Promise.all(uploadPromises);

    // Separate and combine with existing media
    const newImages = uploads
      .filter((upload) => upload.type === "image")
      .map((upload) => upload.url);

    const newVideos = uploads
      .filter((upload) => upload.type === "video")
      .map((upload) => upload.url);

    const updatedImages = [...(existingItem.images || []), ...newImages];
    const updatedVideos = [...(existingItem.videos || []), ...newVideos];

    // Update the item
    const item = await EventItem.findByIdAndUpdate(
      itemId,
      {
        images: updatedImages,
        videos: updatedVideos,
      },
      { new: true }
    );

    res.json({
      message: "Media uploaded successfully",
      images: item.images,
      videos: item.videos,
      cloudinaryRefs: uploads,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Media upload failed" });
  }
};

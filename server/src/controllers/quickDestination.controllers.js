import * as QuickDestination from "../models/quickDestination.models.js";

export const getAll = async (req, res) => {
  try {
    const items = await QuickDestination.getAll();
    return res.status(200).json({ success: true, data: items });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch quick destinations" });
  }
};

export const getById = async (req, res) => {
  try {
    const item = await QuickDestination.getById(req.params.id);
    if (!item) return res.status(404).json({ message: "Quick destination not found" });
    return res.status(200).json({ success: true, data: item });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch quick destination" });
  }
};

export const create = async (req, res) => {
  try {
    const { label, icon, location_id, match_keywords, sort_order } = req.body;
    if (!label) return res.status(400).json({ message: "Label is required" });
    const item = await QuickDestination.create({ label, icon, location_id, match_keywords, sort_order });
    return res.status(201).json({ success: true, data: item });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to create quick destination" });
  }
};

export const update = async (req, res) => {
  try {
    const { label, icon, location_id, match_keywords, sort_order } = req.body;
    const item = await QuickDestination.update(req.params.id, { label, icon, location_id, match_keywords, sort_order });
    if (!item) return res.status(404).json({ message: "Quick destination not found" });
    return res.status(200).json({ success: true, data: item });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to update quick destination" });
  }
};

export const remove = async (req, res) => {
  try {
    await QuickDestination.remove(req.params.id);
    return res.status(200).json({ success: true, message: "Deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to delete quick destination" });
  }
};

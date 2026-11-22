import { asyncHandler } from "../../utils/asyncHandler.js";
import * as service from "./project.service.js";

// ----- public -----
export const list = asyncHandler(async (req, res) => {
  res.json({ data: await service.listProjects() });
});

export const getBySlug = asyncHandler(async (req, res) => {
  res.json({ data: await service.getProjectBySlug(req.params.slug) });
});

// ----- admin: projects -----
export const create = asyncHandler(async (req, res) => {
  res.status(201).json({ data: await service.createProject(req.body) });
});

export const update = asyncHandler(async (req, res) => {
  res.json({ data: await service.updateProject(req.params.id, req.body) });
});

export const remove = asyncHandler(async (req, res) => {
  await service.deleteProject(req.params.id);
  res.status(204).end();
});

export const reorder = asyncHandler(async (req, res) => {
  res.json({ data: await service.reorderProjects(req.body.ids) });
});

// ----- admin: media -----
export const addMedia = asyncHandler(async (req, res) => {
  res
    .status(201)
    .json({ data: await service.addMedia(req.params.id, req.files) });
});

export const reorderMedia = asyncHandler(async (req, res) => {
  res.json({ data: await service.reorderMedia(req.params.id, req.body.ids) });
});

export const updateMediaAlt = asyncHandler(async (req, res) => {
  res.json({
    data: await service.updateMediaAlt(
      req.params.id,
      req.params.mediaId,
      req.body.alt,
    ),
  });
});

export const removeMedia = asyncHandler(async (req, res) => {
  res.json({
    data: await service.deleteMedia(req.params.id, req.params.mediaId),
  });
});

// ----- admin: thumbnail -----
export const setThumbnail = asyncHandler(async (req, res) => {
  res.json({ data: await service.setThumbnail(req.params.id, req.file) });
});

export const removeThumbnail = asyncHandler(async (req, res) => {
  res.json({ data: await service.removeThumbnail(req.params.id) });
});

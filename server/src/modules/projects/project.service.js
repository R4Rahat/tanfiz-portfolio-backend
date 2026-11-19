import mongoose from "mongoose";
import { Project } from "./project.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { extractYouTubeId } from "../../utils/youtube.js";
import { slugify } from "../../utils/slugify.js";
import { uploadMany, uploadOne, deleteMany } from "./media.service.js";

const MAX_MEDIA_PER_PROJECT = 20;
const EDITABLE_FIELDS = [
  "title",
  "about",
  "projectType",
  "year",
  "endingStatement",
];

// ---------- helpers ----------
function assertId(id) {
  if (!mongoose.isValidObjectId(id)) throw new ApiError(400, "Invalid id");
}

async function findOrFail(id) {
  assertId(id);
  const project = await Project.findById(id);
  if (!project) throw new ApiError(404, "Project not found");
  return project;
}

async function uniqueSlug(title) {
  const base = slugify(title);
  let slug = base;
  let n = 1;
  while (await Project.exists({ slug })) slug = `${base}-${++n}`;
  return slug;
}

function parseVideo(videoUrl) {
  if (videoUrl === undefined) return undefined; // not provided, leave unchanged
  if (videoUrl === null || String(videoUrl).trim() === "") return null; // clear it
  const id = extractYouTubeId(videoUrl);
  if (!id) throw new ApiError(400, "Invalid YouTube link");
  return id;
}

function parseRole(role) {
  if (role === undefined) return undefined;
  if (!Array.isArray(role))
    throw new ApiError(400, "role must be an array of strings");
  return role.map((r) => String(r).trim()).filter(Boolean);
}

// Same set of ids, new order. Rejects adds/drops.
function assertSameIds(current, incoming) {
  if (!Array.isArray(incoming)) throw new ApiError(400, "ids must be an array");
  const a = [...current].sort();
  const b = incoming.map(String).sort();
  if (a.length !== b.length || a.some((v, i) => v !== b[i])) {
    throw new ApiError(400, "ids must match the existing items exactly");
  }
}

// ---------- reads ----------
export const listProjects = () =>
  Project.find().sort({ position: 1, createdAt: 1 });

export async function getProjectBySlug(slug) {
  const project = await Project.findOne({ slug });
  if (!project) throw new ApiError(404, "Project not found");
  return project;
}

// ---------- project CRUD ----------
export async function createProject(data) {
  if (!data.title?.trim()) throw new ApiError(400, "title is required");

  const last = await Project.findOne()
    .sort({ position: -1 })
    .select("position");

  return Project.create({
    title: data.title,
    slug: await uniqueSlug(data.title),
    about: data.about,
    projectType: data.projectType,
    role: parseRole(data.role),
    year: data.year,
    videoId: parseVideo(data.videoUrl) ?? null,
    endingStatement: data.endingStatement,
    position: last ? last.position + 1 : 0,
  });
}

export async function updateProject(id, data) {
  const project = await findOrFail(id);

  for (const field of EDITABLE_FIELDS) {
    if (data[field] !== undefined) project[field] = data[field];
  }
  const role = parseRole(data.role);
  if (role !== undefined) project.role = role;
  const videoId = parseVideo(data.videoUrl);
  if (videoId !== undefined) project.videoId = videoId;

  // slug is intentionally NOT regenerated on title change, so URLs stay stable
  return project.save();
}

export async function deleteProject(id) {
  const project = await findOrFail(id);
  const fileIds = project.media.map((m) => m.fileId);
  if (project.thumbnailImage?.fileId)
    fileIds.push(project.thumbnailImage.fileId);
  await project.deleteOne();
  await deleteMany(fileIds); // DB first: a leftover file is better than a broken reference
}

export async function reorderProjects(ids) {
  if (!Array.isArray(ids) || !ids.every(mongoose.isValidObjectId)) {
    throw new ApiError(400, "ids must be an array of valid ids");
  }
  const existing = (await Project.find().select("_id")).map((p) =>
    String(p._id),
  );
  assertSameIds(existing, ids);

  await Project.bulkWrite(
    ids.map((id, index) => ({
      updateOne: { filter: { _id: id }, update: { $set: { position: index } } },
    })),
  );
  return listProjects();
}

// ---------- media ----------
export async function addMedia(id, files) {
  if (!files?.length) throw new ApiError(400, "No files uploaded");
  const project = await findOrFail(id);

  if (project.media.length + files.length > MAX_MEDIA_PER_PROJECT) {
    throw new ApiError(
      400,
      `A project can have at most ${MAX_MEDIA_PER_PROJECT} media items`,
    );
  }

  const items = await uploadMany(files, `/portfolio/projects/${project.slug}`);
  project.media.push(...items); // appended = shown last
  try {
    await project.save();
  } catch (err) {
    await deleteMany(items.map((i) => i.fileId)); // roll back uploads
    throw err;
  }
  return project;
}

export async function reorderMedia(id, ids) {
  const project = await findOrFail(id);
  assertSameIds(
    project.media.map((m) => String(m._id)),
    ids,
  );

  const byId = new Map(project.media.map((m) => [String(m._id), m]));
  project.media = ids.map((i) => byId.get(String(i)));
  return project.save();
}

export async function updateMediaAlt(id, mediaId, alt) {
  const project = await findOrFail(id);
  const item = project.media.id(mediaId);
  if (!item) throw new ApiError(404, "Media not found");
  item.alt = String(alt ?? "").trim();
  return project.save();
}

export async function deleteMedia(id, mediaId) {
  const project = await findOrFail(id);
  const item = project.media.id(mediaId);
  if (!item) throw new ApiError(404, "Media not found");

  const { fileId } = item;
  item.deleteOne();
  await project.save();
  await deleteMany([fileId]);
  return project;
}

// ---------- thumbnail ----------
export async function setThumbnail(id, file) {
  if (!file) throw new ApiError(400, "No thumbnail uploaded");
  const project = await findOrFail(id);

  const oldFileId = project.thumbnailImage?.fileId;
  const uploaded = await uploadOne(
    file,
    `/portfolio/projects/${project.slug}/thumbnail`,
  );

  project.thumbnailImage = uploaded;
  try {
    await project.save();
  } catch (err) {
    await deleteMany([uploaded.fileId]); // roll back the new upload
    throw err;
  }

  if (oldFileId) await deleteMany([oldFileId]); // replace = remove the old one
  return project;
}

export async function removeThumbnail(id) {
  const project = await findOrFail(id);
  const fileId = project.thumbnailImage?.fileId;
  if (!fileId) throw new ApiError(404, "Project has no thumbnail");

  project.thumbnailImage = null;
  await project.save();
  await deleteMany([fileId]);
  return project;
}

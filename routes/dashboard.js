const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { nanoid } = require('nanoid');
const { requireAuth } = require('../middleware/auth');
const { readJson, writeJson } = require('../utils/storage');

const router = express.Router();
const projectsFile = path.join(__dirname, '..', 'data', 'projects.json');

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'public', 'uploads', 'images')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`)
});

const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'public', 'uploads', 'videos')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`)
});

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const isImage = file.fieldname === 'sourceImage';
      const dir = isImage
        ? path.join(__dirname, '..', 'public', 'uploads', 'images')
        : path.join(__dirname, '..', 'public', 'uploads', 'videos');
      cb(null, dir);
    },
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`)
  }),
  limits: {
    fileSize: 50 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const isImageField = file.fieldname === 'sourceImage';
    const allowedImage = ['image/jpeg', 'image/png', 'image/webp'];
    const allowedVideo = ['video/mp4', 'video/quicktime', 'video/webm'];
    if (isImageField && allowedImage.includes(file.mimetype)) return cb(null, true);
    if (!isImageField && allowedVideo.includes(file.mimetype)) return cb(null, true);
    return cb(new Error('Unsupported file type. Please upload JPG, PNG, WEBP, MP4, MOV, or WEBM files only.'));
  }
});

router.get('/dashboard', requireAuth, (req, res) => {
  const projects = readJson(projectsFile, []).filter((item) => item.userId === req.session.user.id).reverse();
  const stats = {
    totalProjects: projects.length,
    completedProjects: projects.filter((item) => item.status === 'Completed').length,
    pendingProjects: projects.filter((item) => item.status !== 'Completed').length
  };
  res.render('dashboard', { pageTitle: 'Dashboard', projects, stats });
});

router.get('/projects/new', requireAuth, (req, res) => {
  res.render('new-project', { pageTitle: 'New Project' });
});

router.post('/projects', requireAuth, upload.fields([
  { name: 'sourceImage', maxCount: 1 },
  { name: 'drivingVideo', maxCount: 1 }
]), (req, res, next) => {
  try {
    const { projectName, notes } = req.body;
    const sourceImage = req.files?.sourceImage?.[0];
    const drivingVideo = req.files?.drivingVideo?.[0];

    if (!projectName || !sourceImage || !drivingVideo) {
      req.flash('error', 'Project name, source image, and driving video are required.');
      return res.redirect('/projects/new');
    }

    const projects = readJson(projectsFile, []);
    const projectId = nanoid(10);
    const outputFilename = `${Date.now()}-output-${drivingVideo.filename}`;
    const outputAbsolute = path.join(__dirname, '..', 'public', 'outputs', outputFilename);

    fs.copyFileSync(drivingVideo.path, outputAbsolute);

    const project = {
      id: projectId,
      userId: req.session.user.id,
      projectName: projectName.trim(),
      notes: String(notes || '').trim(),
      status: 'Completed',
      sourceImageUrl: `/uploads/images/${sourceImage.filename}`,
      drivingVideoUrl: `/uploads/videos/${drivingVideo.filename}`,
      outputVideoUrl: `/outputs/${outputFilename}`,
      createdAt: new Date().toISOString()
    };

    projects.push(project);
    writeJson(projectsFile, projects);
    req.flash('success', 'Project created successfully. Result video has been saved in your history.');
    return res.redirect(`/projects/${projectId}`);
  } catch (error) {
    return next(error);
  }
});

router.get('/projects/:id', requireAuth, (req, res) => {
  const projects = readJson(projectsFile, []);
  const project = projects.find((item) => item.id === req.params.id && item.userId === req.session.user.id);
  if (!project) {
    req.flash('error', 'Project not found.');
    return res.redirect('/dashboard');
  }
  return res.render('project-detail', { pageTitle: project.projectName, project });
});

router.post('/projects/:id/delete', requireAuth, (req, res) => {
  const projects = readJson(projectsFile, []);
  const projectIndex = projects.findIndex((item) => item.id === req.params.id && item.userId === req.session.user.id);
  if (projectIndex === -1) {
    req.flash('error', 'Project not found.');
    return res.redirect('/dashboard');
  }

  const [project] = projects.splice(projectIndex, 1);
  const safeUnlink = (relativePath) => {
    const filePath = path.join(__dirname, '..', 'public', relativePath.replace(/^\//, ''));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  };

  safeUnlink(project.sourceImageUrl);
  safeUnlink(project.drivingVideoUrl);
  safeUnlink(project.outputVideoUrl);
  writeJson(projectsFile, projects);
  req.flash('success', 'Project deleted successfully.');
  return res.redirect('/dashboard');
});

router.get('/profile', requireAuth, (req, res) => {
  res.render('profile', { pageTitle: 'Profile' });
});

router.post('/profile/password', requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const usersFile = path.join(__dirname, '..', 'data', 'users.json');
  const users = readJson(usersFile, []);
  const userIndex = users.findIndex((entry) => entry.id === req.session.user.id);
  if (userIndex === -1) {
    req.flash('error', 'User not found.');
    return res.redirect('/profile');
  }

  const matches = await require('bcryptjs').compare(String(currentPassword || ''), users[userIndex].passwordHash);
  if (!matches) {
    req.flash('error', 'Current password is incorrect.');
    return res.redirect('/profile');
  }
  if (!newPassword || newPassword.length < 8) {
    req.flash('error', 'New password must be at least 8 characters long.');
    return res.redirect('/profile');
  }

  users[userIndex].passwordHash = await require('bcryptjs').hash(newPassword, 10);
  writeJson(usersFile, users);
  req.flash('success', 'Password updated successfully.');
  return res.redirect('/profile');
});

module.exports = router;

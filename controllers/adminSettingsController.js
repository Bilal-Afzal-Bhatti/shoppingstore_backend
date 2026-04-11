// controllers/adminSettingsController.js

import Admin from '../models/adminModel.js';
import bcrypt from 'bcryptjs';
import asyncHandler from '../utils/asyncHandler.js';

// ─── GET PROFILE ──────────────────────────────────────────────────────────────
// GET /api/admin/settings/profile
export const getProfile = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.admin._id).select('-password');
  if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });
  res.status(200).json({ success: true, data: admin });
});

// ─── UPDATE PROFILE ───────────────────────────────────────────────────────────
// PUT /api/admin/settings/profile
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, avatar } = req.body;

  const admin = await Admin.findById(req.admin._id);
  if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });

  // Check if email is taken by another admin
  if (email && email !== admin.email) {
    const exists = await Admin.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already in use' });
  }

  admin.name   = name   ?? admin.name;
  admin.email  = email  ?? admin.email;
  admin.avatar = avatar ?? admin.avatar;

  const updated = await admin.save();
  const { password: _, ...data } = updated.toObject();

  res.status(200).json({ success: true, data, message: 'Profile updated successfully' });
});

// ─── CHANGE PASSWORD ──────────────────────────────────────────────────────────
// PUT /api/admin/settings/password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ success: false, message: 'All password fields are required' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'New passwords do not match' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
  }

  const admin = await Admin.findById(req.admin._id);
  const isMatch = await bcrypt.compare(currentPassword, admin.password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Current password is incorrect' });
  }

  admin.password = newPassword; // pre-save hook in model will hash it
  await admin.save();

  res.status(200).json({ success: true, message: 'Password changed successfully' });
});

// ─── GET STORE SETTINGS ───────────────────────────────────────────────────────
// GET /api/admin/settings/store
export const getStoreSettings = asyncHandler(async (req, res) => {
  // In a real app this would come from a StoreSettings model in DB
  // For now return from admin document or defaults
  const admin = await Admin.findById(req.admin._id).select('storeSettings');

  res.status(200).json({
    success: true,
    data: admin?.storeSettings || {
      storeName:    'My Store',
      storeEmail:   '',
      currency:     'USD',
      storeLogo:    '',
      lowStockAlert: 10,
    },
  });
});

// ─── UPDATE STORE SETTINGS ────────────────────────────────────────────────────
// PUT /api/admin/settings/store
export const updateStoreSettings = asyncHandler(async (req, res) => {
  const { storeName, storeEmail, currency, storeLogo, lowStockAlert } = req.body;

  const admin = await Admin.findById(req.admin._id);

  admin.storeSettings = {
    storeName:     storeName     ?? admin.storeSettings?.storeName     ?? 'My Store',
    storeEmail:    storeEmail    ?? admin.storeSettings?.storeEmail    ?? '',
    currency:      currency      ?? admin.storeSettings?.currency      ?? 'USD',
    storeLogo:     storeLogo     ?? admin.storeSettings?.storeLogo     ?? '',
    lowStockAlert: lowStockAlert ?? admin.storeSettings?.lowStockAlert ?? 10,
  };

  await admin.save();
  res.status(200).json({ success: true, data: admin.storeSettings, message: 'Store settings updated' });
});

// ─── GET NOTIFICATION SETTINGS ────────────────────────────────────────────────
// GET /api/admin/settings/notifications
export const getNotificationSettings = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.admin._id).select('notificationSettings');

  res.status(200).json({
    success: true,
    data: admin?.notificationSettings || {
      newOrder:       true,
      lowStock:       true,
      newCustomer:    false,
      orderDelivered: true,
    },
  });
});

// ─── UPDATE NOTIFICATION SETTINGS ────────────────────────────────────────────
// PUT /api/admin/settings/notifications
export const updateNotificationSettings = asyncHandler(async (req, res) => {
  const { newOrder, lowStock, newCustomer, orderDelivered } = req.body;

  const admin = await Admin.findById(req.admin._id);

  admin.notificationSettings = {
    newOrder:       newOrder       ?? admin.notificationSettings?.newOrder       ?? true,
    lowStock:       lowStock       ?? admin.notificationSettings?.lowStock       ?? true,
    newCustomer:    newCustomer    ?? admin.notificationSettings?.newCustomer    ?? false,
    orderDelivered: orderDelivered ?? admin.notificationSettings?.orderDelivered ?? true,
  };

  await admin.save();
  res.status(200).json({ success: true, data: admin.notificationSettings, message: 'Notification settings updated' });
});
import bcrypt from 'bcrypt';
import { envConfig } from '../config/env';
import { logger } from '../config/logger';
import { UserModel } from '../models';

const DEFAULT_ADMIN_NAME = 'QuickCart Admin';
const DEFAULT_ADMIN_PHONE = '9999999999';

export const ensureInitialAdmin = async () => {
  const { admin } = envConfig;

  if (!admin.email || !admin.password) {
    logger.debug('Skipping admin bootstrap – ADMIN_EMAIL or ADMIN_PASSWORD not provided');
    return;
  }

  const email = admin.email.toLowerCase();

  const existing = await UserModel.findOne({ email });

  if (!existing) {
    const hashedPassword = await bcrypt.hash(admin.password, 10);
    await UserModel.create({
      name: admin.name ?? DEFAULT_ADMIN_NAME,
      email,
      password: hashedPassword,
      phone: admin.phone ?? DEFAULT_ADMIN_PHONE,
      role: 'admin',
      isVerified: true,
      isBlocked: false,
    });
    logger.info('🛡️  Admin user bootstrapped at %s', email);
    return;
  }

  let hasChanges = false;

  if (existing.role !== 'admin') {
    existing.role = 'admin';
    hasChanges = true;
  }

  if (admin.name && existing.name !== admin.name) {
    existing.name = admin.name;
    hasChanges = true;
  }

  if (admin.phone && existing.phone !== admin.phone) {
    existing.phone = admin.phone;
    hasChanges = true;
  }

  if (admin.password) {
    const passwordMatches = await bcrypt.compare(admin.password, existing.password);
    if (!passwordMatches) {
      existing.password = admin.password;
      hasChanges = true;
    }
  }

  if (existing.isBlocked) {
    existing.isBlocked = false;
    hasChanges = true;
  }

  if (!existing.isVerified) {
    existing.isVerified = true;
    hasChanges = true;
  }

  if (hasChanges) {
    await existing.save();
    logger.info('🛡️  Admin user at %s refreshed from environment config', email);
  } else {
    logger.debug('Admin user at %s already up to date', email);
  }
};

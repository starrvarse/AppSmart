import db from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create logo directory if it doesn't exist
const logoDir = path.join(__dirname, '../../public/logo');
if (!fs.existsSync(logoDir)) {
  fs.mkdirSync(logoDir, { recursive: true });
}

export const getCompanyDetails = (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM company LIMIT 1');
    const company = stmt.get();
    res.json(company || {});
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({ error: 'Failed to fetch company details' });
  }
};

export const updateCompanyDetails = (req, res) => {
  const {
    name,
    address,
    gst,
    phone,
    email,
    logo,
  } = req.body;

  // Validate required fields
  if (!name?.trim()) {
    return res.status(400).json({ error: 'Company name is required' });
  }

  // Validate email format
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Validate phone format
  if (phone && !/^[+]?[\d\s-]{10,}$/.test(phone)) {
    return res.status(400).json({ error: 'Invalid phone number format' });
  }

  // Validate GST format
  if (gst && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gst)) {
    return res.status(400).json({ error: 'Invalid GST number format' });
  }

  try {
    // First check if company exists
    const existingCompany = db.prepare('SELECT id, logo FROM company LIMIT 1').get();

    // Handle logo file
    let logoPath = null;
    if (logo) {
      try {
        // If it's a base64 string
        if (logo.startsWith('data:image')) {
          const matches = logo.match(/^data:image\/([a-zA-Z0-9]+);base64,/);
          if (!matches) {
            return res.status(400).json({ error: 'Invalid image format' });
          }

          const fileExt = matches[1];
          const base64Data = logo.replace(/^data:image\/[a-zA-Z0-9]+;base64,/, '');
          const fileName = `logo_${Date.now()}.${fileExt}`;
          logoPath = `/logo/${fileName}`;
          const filePath = path.join(logoDir, fileName);

          // Delete old logo if exists
          if (existingCompany?.logo) {
            try {
              const oldPath = path.join(__dirname, '../../public', existingCompany.logo);
              if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
              }
            } catch (error) {
              console.error('Error deleting old logo:', error);
              // Continue even if old logo deletion fails
            }
          }

          // Save new logo
          fs.writeFileSync(filePath, base64Data, 'base64');
        } else {
          // If it's an existing path, keep it
          logoPath = logo;
        }
      } catch (error) {
        console.error('Error handling logo:', error);
        return res.status(500).json({ error: 'Failed to process logo file' });
      }
    }

    if (existingCompany) {
      // Update existing company
      const stmt = db.prepare(`
        UPDATE company SET
          name = ?, address = ?, gst = ?,
          phone = ?, email = ?, logo = ?
        WHERE id = ?
      `);

      stmt.run(
        name.trim(),
        address?.trim() || null,
        gst?.trim() || null,
        phone?.trim() || null,
        email?.trim() || null,
        logoPath,
        existingCompany.id
      );

      res.json({ 
        id: existingCompany.id,
        logo: logoPath,
        message: 'Company details updated successfully'
      });
    } else {
      // Create new company
      const stmt = db.prepare(`
        INSERT INTO company (
          name, address, gst, phone, email, logo
        ) VALUES (?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        name.trim(),
        address?.trim() || null,
        gst?.trim() || null,
        phone?.trim() || null,
        email?.trim() || null,
        logoPath
      );

      res.json({ 
        id: result.lastInsertRowid,
        logo: logoPath,
        message: 'Company details created successfully'
      });
    }
  } catch (error) {
    console.error('Update company error:', error);
    // Check for specific database errors
    if (error.code === 'SQLITE_CONSTRAINT') {
      res.status(400).json({ error: 'Database constraint violation' });
    } else {
      res.status(500).json({ error: 'Failed to update company details' });
    }
  }
};

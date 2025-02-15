import db from '../config/database.js';

export const createScheme = (req, res) => {
  const {
    name,
    type,
    discountType,
    discountValue,
    buyQuantity,
    freeQuantity,
    startDate,
    endDate,
    categories,
    products,
  } = req.body;

  try {
    const result = db.transaction(() => {
      // Insert scheme
      const schemeStmt = db.prepare(`
        INSERT INTO schemes (
          name, type, discount_type, discount_value,
          buy_quantity, free_quantity, start_date, end_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const schemeResult = schemeStmt.run(
        name,
        type,
        discountType,
        discountValue || null,
        buyQuantity || null,
        freeQuantity || null,
        startDate,
        endDate
      );

      const schemeId = schemeResult.lastInsertRowid;

      // Insert categories if type is 'category'
      if (type === 'category' && categories && categories.length > 0) {
        const categoryStmt = db.prepare(`
          INSERT INTO scheme_categories (scheme_id, category_id)
          VALUES (?, ?)
        `);

        categories.forEach(categoryId => {
          categoryStmt.run(schemeId, categoryId);
        });
      }

      // Insert products if type is 'product'
      if (type === 'product' && products && products.length > 0) {
          const productStmt = db.prepare(`
            INSERT INTO scheme_products (scheme_id, product_id, unit_id, quantity)
            VALUES (?, ?, ?, ?)
          `);

          products.forEach(product => {
            productStmt.run(
              schemeId,
              product.id,
              product.unitId,
              product.quantity
            );
          });
      }

      return schemeResult;
    })();

    res.json({ id: result.lastInsertRowid });
  } catch (error) {
    console.error('Create scheme error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAllSchemes = (req, res) => {
  try {
    const schemes = db.transaction(() => {
      // Get all schemes
      const schemesStmt = db.prepare(`
        SELECT 
          id, name, type, discount_type as discountType,
          discount_value as discountValue, buy_quantity as buyQuantity,
          free_quantity as freeQuantity, start_date as startDate,
          end_date as endDate, created_at as createdAt
        FROM schemes
        ORDER BY created_at DESC
      `);
      const schemes = schemesStmt.all();

      // Get categories for category schemes
      const categoriesStmt = db.prepare(`
        SELECT sc.scheme_id, c.id, c.name
        FROM scheme_categories sc
        JOIN categories c ON sc.category_id = c.id
        WHERE sc.scheme_id IN (${schemes.map(s => s.id).join(',') || '-1'})
      `);
      const categories = categoriesStmt.all();

      // Get products for product schemes
      const productsStmt = db.prepare(`
        SELECT sp.scheme_id, p.id, p.name, p.code
        FROM scheme_products sp
        JOIN products p ON sp.product_id = p.id
        WHERE sp.scheme_id IN (${schemes.map(s => s.id).join(',') || '-1'})
      `);
      const products = productsStmt.all();

      // Combine the results
      return schemes.map(scheme => ({
        ...scheme,
        categories: categories
          .filter(c => c.scheme_id === scheme.id)
          .map(({ scheme_id, ...rest }) => rest),
        products: products
          .filter(p => p.scheme_id === scheme.id)
          .map(({ scheme_id, ...rest }) => rest),
      }));
    })();

    res.json(schemes);
  } catch (error) {
    console.error('Get schemes error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getSchemeById = (req, res) => {
  const { id } = req.params;
  try {
    const scheme = db.transaction(() => {
      // Get scheme
      const schemeStmt = db.prepare(`
        SELECT 
          id, name, type, discount_type as discountType,
          discount_value as discountValue, buy_quantity as buyQuantity,
          free_quantity as freeQuantity, start_date as startDate,
          end_date as endDate, created_at as createdAt
        FROM schemes
        WHERE id = ?
      `);
      const scheme = schemeStmt.get(id);

      if (!scheme) return null;

      // Get categories if type is 'category'
      if (scheme.type === 'category') {
        const categoriesStmt = db.prepare(`
          SELECT c.id, c.name
          FROM scheme_categories sc
          JOIN categories c ON sc.category_id = c.id
          WHERE sc.scheme_id = ?
        `);
        scheme.categories = categoriesStmt.all(id);
      }

      // Get products if type is 'product'
      if (scheme.type === 'product') {
        const productsStmt = db.prepare(`
          SELECT 
            p.id, p.name, p.code,
            sp.unit_id as unitId,
            sp.quantity,
            u.name as unit_name
          FROM scheme_products sp
          JOIN products p ON sp.product_id = p.id
          JOIN units u ON sp.unit_id = u.id
          WHERE sp.scheme_id = ?
        `);
        scheme.products = productsStmt.all(id);
      }

      return scheme;
    })();

    if (!scheme) {
      return res.status(404).json({ error: 'Scheme not found' });
    }

    res.json(scheme);
  } catch (error) {
    console.error('Get scheme error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateScheme = (req, res) => {
  const { id } = req.params;
  const {
    name,
    type,
    discountType,
    discountValue,
    buyQuantity,
    freeQuantity,
    startDate,
    endDate,
    categories,
    products,
  } = req.body;

  try {
    db.transaction(() => {
      // Update scheme
      const schemeStmt = db.prepare(`
        UPDATE schemes SET
          name = ?, type = ?, discount_type = ?, discount_value = ?,
          buy_quantity = ?, free_quantity = ?, start_date = ?, end_date = ?
        WHERE id = ?
      `);
      
      schemeStmt.run(
        name,
        type,
        discountType,
        discountValue || null,
        buyQuantity || null,
        freeQuantity || null,
        startDate,
        endDate,
        id
      );

      // Delete existing categories and products
      db.prepare('DELETE FROM scheme_categories WHERE scheme_id = ?').run(id);
      db.prepare('DELETE FROM scheme_products WHERE scheme_id = ?').run(id);

      // Insert new categories if type is 'category'
      if (type === 'category' && categories && categories.length > 0) {
        const categoryStmt = db.prepare(`
          INSERT INTO scheme_categories (scheme_id, category_id)
          VALUES (?, ?)
        `);

        categories.forEach(categoryId => {
          categoryStmt.run(id, categoryId);
        });
      }

      // Insert new products if type is 'product'
      if (type === 'product' && products && products.length > 0) {
          const productStmt = db.prepare(`
            INSERT INTO scheme_products (scheme_id, product_id, unit_id, quantity)
            VALUES (?, ?, ?, ?)
          `);

          products.forEach(product => {
            productStmt.run(
              id,
              product.id,
              product.unitId,
              product.quantity
            );
          });
      }
    })();

    res.json({ id: parseInt(id) });
  } catch (error) {
    console.error('Update scheme error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteScheme = (req, res) => {
  const { id } = req.params;
  try {
    db.transaction(() => {
      // Delete scheme categories and products first
      db.prepare('DELETE FROM scheme_categories WHERE scheme_id = ?').run(id);
      db.prepare('DELETE FROM scheme_products WHERE scheme_id = ?').run(id);

      // Delete scheme
      db.prepare('DELETE FROM schemes WHERE id = ?').run(id);
    })();

    res.json({ message: 'Scheme deleted successfully' });
  } catch (error) {
    console.error('Delete scheme error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

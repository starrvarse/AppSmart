import db from '../config/database.js';

export const createProduct = (req, res) => {
  const {
    name,
    code,
    categoryId,
    baseUnitId,
    baseRate,
    baseWholesaleRate,
    purchaseRate,
    hsnCode,
    companyId,
    taxPercentage,
    multiUnits,
  } = req.body;

  try {
    const result = db.transaction(() => {
      // Insert product
      const productStmt = db.prepare(`
        INSERT INTO products (
          name, code, category_id, base_unit_id, base_rate,
          base_wholesale_rate, purchase_rate, hsn_code, company_id, tax_percentage
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const productResult = productStmt.run(
        name,
        code,
        categoryId || null,
        baseUnitId,
        baseRate,
        baseWholesaleRate || null,
        purchaseRate || null,
        hsnCode || null,
        companyId || null,
        taxPercentage || null
      );

      // Insert multi units if provided
      if (multiUnits && multiUnits.length > 0) {
        const unitStmt = db.prepare(`
          INSERT INTO product_units (
            product_id, unit_id, conversion_rate, retail_rate, wholesale_rate
          ) VALUES (?, ?, ?, ?, ?)
        `);

        multiUnits.forEach(unit => {
          unitStmt.run(
            productResult.lastInsertRowid,
            unit.unitId,
            unit.conversionRate,
            unit.retailRate,
            unit.wholesaleRate
          );
        });
      }

      return productResult;
    })();

    res.json({ id: result.lastInsertRowid });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const importProducts = async (req, res) => {
  const products = req.body;
  
  if (!Array.isArray(products)) {
    return res.status(400).json({ error: 'Products must be an array' });
  }

  try {
    const results = [];
    let processedCount = 0;

    // Helper function to find or create category
    const getCategoryId = (name) => {
      if (!name) return null;
      const existingCategory = db.prepare('SELECT id FROM categories WHERE name = ?').get(name);
      if (existingCategory) return existingCategory.id;
      
      const result = db.prepare('INSERT INTO categories (name) VALUES (?)').run(name);
      return result.lastInsertRowid;
    };

    // Helper function to find or create unit
    const getUnitId = (name) => {
      if (!name) return null;
      const existingUnit = db.prepare('SELECT id FROM units WHERE name = ?').get(name);
      if (existingUnit) return existingUnit.id;
      
      const result = db.prepare('INSERT INTO units (name) VALUES (?)').run(name);
      return result.lastInsertRowid;
    };

    // Helper function to find or create company
    const getCompanyId = (name) => {
      if (!name) return null;
      const existingCompany = db.prepare('SELECT id FROM product_companies WHERE name = ?').get(name);
      if (existingCompany) return existingCompany.id;
      
      const result = db.prepare('INSERT INTO product_companies (name) VALUES (?)').run(name);
      return result.lastInsertRowid;
    };

    // Process each product
    for (const product of products) {
      try {
        // Validate required fields
        if (!product.name) throw new Error('Product name is required');
        if (!product.code) throw new Error('Product code is required');
        if (!product.base_unit_name) throw new Error('Base unit is required');
        if (typeof product.base_rate !== 'number') throw new Error('Base rate must be a number');

        // Get or create references
        const categoryId = product.category_name ? getCategoryId(product.category_name) : null;
        const baseUnitId = getUnitId(product.base_unit_name);
        const companyId = product.company_name ? getCompanyId(product.company_name) : null;

        // Insert product
        const result = db.transaction(() => {
          const productStmt = db.prepare(`
            INSERT INTO products (
              name, code, category_id, base_unit_id, base_rate,
              base_wholesale_rate, purchase_rate, hsn_code, company_id, tax_percentage
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          
          const productResult = productStmt.run(
            product.name,
            product.code,
            categoryId,
            baseUnitId,
            product.base_rate,
            product.base_wholesale_rate || null,
            product.purchase_rate || null,
            product.hsn_code || null,
            companyId,
            product.tax_percentage || null
          );

          // Handle additional units if provided
          if (product.additional_units) {
            let units = [];
            try {
              units = typeof product.additional_units === 'string' 
                ? JSON.parse(product.additional_units)
                : product.additional_units;
            } catch (e) {
              console.warn('Failed to parse additional units:', e);
            }

            if (Array.isArray(units)) {
              const unitStmt = db.prepare(`
                INSERT INTO product_units (
                  product_id, unit_id, conversion_rate, retail_rate, wholesale_rate
                ) VALUES (?, ?, ?, ?, ?)
              `);

              units.forEach(unit => {
                if (!unit.unit_name) return;
                const unitId = getUnitId(unit.unit_name);
                unitStmt.run(
                  productResult.lastInsertRowid,
                  unitId,
                  unit.conversion_rate || 1,
                  unit.retail_rate || 0,
                  unit.wholesale_rate || 0
                );
              });
            }
          }

          return productResult;
        })();

        results.push({
          success: true,
          name: product.name,
          id: result.lastInsertRowid
        });
      } catch (error) {
        console.error('Import error for product:', product.name, error);
        results.push({
          success: false,
          name: product.name || 'Unknown',
          error: error.message
        });
      }

      processedCount++;
      res.write(JSON.stringify({
        progress: (processedCount / products.length) * 100,
        currentItem: product.name || 'Unknown Product'
      }) + '\n');
    }

    res.end(JSON.stringify({ results }));
  } catch (error) {
    console.error('Import products error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

export const getAllProducts = (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT 
        p.id,
        p.name,
        p.code,
        p.category_id as categoryId,
        p.base_unit_id as baseUnitId,
        p.base_rate as baseRate,
        p.base_wholesale_rate as baseWholesaleRate,
        p.purchase_rate as purchaseRate,
        p.hsn_code as hsnCode,
        p.company_id as companyId,
        p.tax_percentage as taxPercentage,
        p.created_at,
        c.name as category_name,
        u.name as base_unit_name,
        pc.name as company_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN units u ON p.base_unit_id = u.id
      LEFT JOIN product_companies pc ON p.company_id = pc.id
      ORDER BY p.name
    `);
    const products = stmt.all();
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getProductById = (req, res) => {
  const { id } = req.params;
  try {
    const productStmt = db.prepare(`
      SELECT 
        p.id,
        p.name,
        p.code,
        p.category_id as categoryId,
        p.base_unit_id as baseUnitId,
        p.base_rate as baseRate,
        p.base_wholesale_rate as baseWholesaleRate,
        p.purchase_rate as purchaseRate,
        p.hsn_code as hsnCode,
        p.company_id as companyId,
        p.tax_percentage as taxPercentage,
        p.created_at,
        c.name as category_name,
        u.name as base_unit_name,
        pc.name as company_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN units u ON p.base_unit_id = u.id
      LEFT JOIN product_companies pc ON p.company_id = pc.id
      WHERE p.id = ?
    `);
    const product = productStmt.get(id);

    if (product) {
      const unitsStmt = db.prepare(`
        SELECT 
          pu.id,
          pu.unit_id as unitId,
          pu.conversion_rate as conversionRate,
          pu.retail_rate as retailRate,
          pu.wholesale_rate as wholesaleRate,
          u.name as unit_name
        FROM product_units pu
        LEFT JOIN units u ON pu.unit_id = u.id
        WHERE pu.product_id = ?
      `);
      const units = unitsStmt.all(id);
      product.units = units;
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateProduct = (req, res) => {
  const { id } = req.params;
  const {
    name,
    code,
    categoryId,
    baseUnitId,
    baseRate,
    baseWholesaleRate,
    purchaseRate,
    hsnCode,
    companyId,
    taxPercentage,
    multiUnits,
  } = req.body;

  try {
    db.transaction(() => {
      // Update product
      const productStmt = db.prepare(`
        UPDATE products SET
          name = ?, code = ?, category_id = ?, base_unit_id = ?,
          base_rate = ?, base_wholesale_rate = ?, purchase_rate = ?, hsn_code = ?,
          company_id = ?, tax_percentage = ?
        WHERE id = ?
      `);
      
      productStmt.run(
        name,
        code,
        categoryId || null,
        baseUnitId,
        baseRate,
        baseWholesaleRate || null,
        purchaseRate || null,
        hsnCode || null,
        companyId || null,
        taxPercentage || null,
        id
      );

      // Delete existing units
      const deleteUnitsStmt = db.prepare('DELETE FROM product_units WHERE product_id = ?');
      deleteUnitsStmt.run(id);

      // Insert new units
      if (multiUnits && multiUnits.length > 0) {
        const unitStmt = db.prepare(`
          INSERT INTO product_units (
            product_id, unit_id, conversion_rate, retail_rate, wholesale_rate
          ) VALUES (?, ?, ?, ?, ?)
        `);

        multiUnits.forEach(unit => {
          unitStmt.run(
            id,
            unit.unitId,
            unit.conversionRate,
            unit.retailRate,
            unit.wholesaleRate
          );
        });
      }
    })();

    res.json({ id: parseInt(id) });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteProduct = (req, res) => {
  const { id } = req.params;
  try {
    db.transaction(() => {
      // Delete product units first
      const deleteUnitsStmt = db.prepare('DELETE FROM product_units WHERE product_id = ?');
      deleteUnitsStmt.run(id);

      // Delete product
      const deleteProductStmt = db.prepare('DELETE FROM products WHERE id = ?');
      deleteProductStmt.run(id);
    })();

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

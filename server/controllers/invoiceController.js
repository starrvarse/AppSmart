import db from '../config/database.js';

const generateInvoiceNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return timestamp + random;
};

export const createInvoice = (req, res) => {
  const {
    customerId,
    invoiceDate,
    dueDate,
    items,
    subtotal,
    manualDiscount = 0,
    schemeDiscount = 0,
    totalDiscount = 0,
    totalTax = 0,
    total,
    status = 'draft'
  } = req.body;

  try {
    const result = db.transaction(() => {
      // Create invoice
      const invoiceStmt = db.prepare(`
        INSERT INTO invoices (
          invoice_number, customer_id, invoice_date, due_date,
          subtotal, manual_discount, scheme_discount, total_discount,
          total_tax, total, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const invoiceResult = invoiceStmt.run(
        generateInvoiceNumber(),
        customerId,
        invoiceDate,
        dueDate,
        subtotal,
        manualDiscount,
        schemeDiscount,
        totalDiscount,
        totalTax,
        total,
        status
      );

      // Insert invoice items
      const itemStmt = db.prepare(`
        INSERT INTO invoice_items (
          invoice_id, product_id, unit_id, quantity, rate, discount, total
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      items.forEach(item => {
        itemStmt.run(
          invoiceResult.lastInsertRowid,
          item.productId,
          item.unitId,
          item.quantity,
          item.rate,
          item.discount || 0,
          item.total
        );
      });

      return invoiceResult;
    })();

    res.json({ id: result.lastInsertRowid });
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAllInvoices = (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT 
        i.*,
        c.name as customer_name,
        c.phone as customer_phone
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      ORDER BY i.created_at DESC
    `);
    const invoices = stmt.all();
    res.json(invoices);
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getInvoiceById = (req, res) => {
  const { id } = req.params;
  try {
    // Get invoice details
    const invoiceStmt = db.prepare(`
      SELECT 
        i.*,
        c.name as customer_name,
        c.email as customer_email,
        c.phone as customer_phone,
        c.address as customer_address
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE i.id = ?
    `);
    const invoice = invoiceStmt.get(id);

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Get invoice items
    const itemsStmt = db.prepare(`
      SELECT 
        ii.*,
        p.name as product_name,
        p.code as product_code,
        u.name as unit_name
      FROM invoice_items ii
      LEFT JOIN products p ON ii.product_id = p.id
      LEFT JOIN units u ON ii.unit_id = u.id
      WHERE ii.invoice_id = ?
    `);
    const items = itemsStmt.all(id);
    invoice.items = items;

    res.json(invoice);
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateInvoiceStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const stmt = db.prepare('UPDATE invoices SET status = ? WHERE id = ?');
    stmt.run(status, id);
    res.json({ id: parseInt(id), status });
  } catch (error) {
    console.error('Update invoice status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateInvoice = (req, res) => {
  const { id } = req.params;
  const {
    customerId,
    invoiceDate,
    dueDate,
    items,
    subtotal,
    manualDiscount = 0,
    schemeDiscount = 0,
    totalDiscount = 0,
    totalTax = 0,
    total,
    status
  } = req.body;

  try {
    const result = db.transaction(() => {
      // Update invoice
      const invoiceStmt = db.prepare(`
        UPDATE invoices SET
          customer_id = ?, invoice_date = ?, due_date = ?,
          subtotal = ?, manual_discount = ?, scheme_discount = ?,
          total_discount = ?, total_tax = ?, total = ?, status = ?
        WHERE id = ?
      `);

      invoiceStmt.run(
        customerId,
        invoiceDate,
        dueDate,
        subtotal,
        manualDiscount,
        schemeDiscount,
        totalDiscount,
        totalTax,
        total,
        status,
        id
      );

      // Delete existing items
      const deleteItemsStmt = db.prepare('DELETE FROM invoice_items WHERE invoice_id = ?');
      deleteItemsStmt.run(id);

      // Insert new items
      const itemStmt = db.prepare(`
        INSERT INTO invoice_items (
          invoice_id, product_id, unit_id, quantity, rate, discount, total
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      items.forEach(item => {
        itemStmt.run(
          id,
          item.productId,
          item.unitId,
          item.quantity,
          item.rate,
          item.discount || 0,
          item.total
        );
      });

      return { id: parseInt(id) };
    })();

    res.json(result);
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteInvoice = (req, res) => {
  const { id } = req.params;
  try {
    db.transaction(() => {
      // Delete invoice items first
      const deleteItemsStmt = db.prepare('DELETE FROM invoice_items WHERE invoice_id = ?');
      deleteItemsStmt.run(id);

      // Delete invoice
      const deleteInvoiceStmt = db.prepare('DELETE FROM invoices WHERE id = ?');
      deleteInvoiceStmt.run(id);
    })();

    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Delete invoice error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

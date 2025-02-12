import db from '../config/database.js';

const generateInvoiceNumber = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const yearShort = year.toString().slice(-2);
  const monthPadded = month.toString().padStart(2, '0');

  // Get or create counter in a transaction to ensure atomicity
  const result = db.transaction(() => {
    // Try to get existing counter
    const getCounter = db.prepare(
      'SELECT counter FROM invoice_counter WHERE year = ? AND month = ?'
    );
    let counter = getCounter.get(year, month);

    if (!counter) {
      // Create new counter if not exists
      const insertCounter = db.prepare(
        'INSERT INTO invoice_counter (year, month, counter) VALUES (?, ?, 1)'
      );
      insertCounter.run(year, month);
      counter = { counter: 1 };
    } else {
      // Increment existing counter
      const updateCounter = db.prepare(
        'UPDATE invoice_counter SET counter = counter + 1 WHERE year = ? AND month = ? RETURNING counter'
      );
      counter = updateCounter.get(year, month);
    }

    return counter.counter;
  })();

  // Format: YYMMXXXXXX where XXXXXX is the padded counter
  const counterPadded = result.toString().padStart(6, '0');
  return `${yearShort}${monthPadded}${counterPadded}`;
};

export const createInvoice = (req, res) => {
  const {
    customerId,
    invoiceDate,
    dueDate,
    items,
    subtotal,
    manualDiscount = 0,
    previousBalance = 0,
    totalDiscount = 0,
    totalTax = 0,
    charges = 0,
    paid_amount = 0,
    total,
    status = 'draft'
  } = req.body;

  try {
    const result = db.transaction(() => {
      // Create invoice
      const invoiceStmt = db.prepare(`
        INSERT INTO invoices (
          invoice_number, customer_id, invoice_date, due_date,
          subtotal, manual_discount, previous_balance, total_discount,
          total_tax, charges, paid_amount, total, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const invoiceResult = invoiceStmt.run(
        generateInvoiceNumber(),
        customerId,
        invoiceDate,
        dueDate,
        subtotal,
        manualDiscount,
        previousBalance,
        totalDiscount,
        totalTax,
        charges,
        paid_amount,
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
    previousBalance = 0,
    totalDiscount = 0,
    totalTax = 0,
    charges = 0,
    paid_amount = 0,
    total,
    status
  } = req.body;

  try {
    const result = db.transaction(() => {
      // Update invoice
      const invoiceStmt = db.prepare(`
        UPDATE invoices SET
          customer_id = ?, invoice_date = ?, due_date = ?,
          subtotal = ?, manual_discount = ?, previous_balance = ?,
          total_discount = ?, total_tax = ?, charges = ?, 
          paid_amount = ?, total = ?, status = ?
        WHERE id = ?
      `);

      invoiceStmt.run(
        customerId,
        invoiceDate,
        dueDate,
        subtotal,
        manualDiscount,
        previousBalance,
        totalDiscount,
        totalTax,
        charges,
        paid_amount,
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

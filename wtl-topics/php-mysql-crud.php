<?php
// ============================================================
// WTL Topic 13: PHP-MySQL CRUD using PDO & Prepared Statements
// ============================================================

$host = 'localhost';
$dbname = 'stockpulse_lite';
$user = 'root';
$pass = '';

$message = '';
$message_type = 'success';

try {
    // 1. PDO DATABASE CONNECTION
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 2. CREATE (INSERT) OPERATION
    if (isset($_POST['action']) && $_POST['action'] === 'add') {
        $symbol = strtoupper(trim($_POST['symbol'] ?? ''));
        $company = trim($_POST['company_name'] ?? '');
        $price = floatval($_POST['price'] ?? 0);
        $change = floatval($_POST['change_percent'] ?? 0);

        if ($symbol && $company && $price > 0) {
            // PREPARED STATEMENT
            $stmt = $pdo->prepare("INSERT INTO stocks (symbol, company_name, price, change_percent) VALUES (?, ?, ?, ?)");
            $stmt->execute([$symbol, $company, $price, $change]);
            $message = "Added stock '$symbol' via PHP PDO prepared statement!";
        } else {
            $message = "Invalid input for adding stock.";
            $message_type = "error";
        }
    }

    // 3. UPDATE OPERATION
    if (isset($_POST['action']) && $_POST['action'] === 'update') {
        $id = intval($_POST['id'] ?? 0);
        $new_price = floatval($_POST['price'] ?? 0);

        if ($id > 0 && $new_price > 0) {
            // PREPARED STATEMENT
            $stmt = $pdo->prepare("UPDATE stocks SET price = ? WHERE id = ?");
            $stmt->execute([$new_price, $id]);
            $message = "Updated stock ID #$id price to $$new_price!";
        }
    }

    // 4. DELETE OPERATION
    if (isset($_GET['delete_id'])) {
        $delete_id = intval($_GET['delete_id']);
        // PREPARED STATEMENT
        $stmt = $pdo->prepare("DELETE FROM stocks WHERE id = ?");
        $stmt->execute([$delete_id]);
        $message = "Deleted stock record #$delete_id!";
    }

    // 5. READ (SELECT) OPERATION
    $stmt = $pdo->query("SELECT * FROM stocks ORDER BY id ASC");
    $stocks = $stmt->fetchAll(PDO::FETCH_ASSOC);

} catch (PDOException $e) {
    $message = "Database Error: " . $e->getMessage();
    $message_type = "error";
    $stocks = [];
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>WTL Topic 13: PHP-MySQL CRUD (PDO)</title>
  <link rel="stylesheet" href="../style.css">
</head>
<body style="padding: 2rem;">

  <div style="max-width: 900px; margin: 0 auto;">
    <header style="margin-bottom: 2rem; text-align: center;">
      <h1>WTL Topic 13: PHP & MySQL CRUD</h1>
      <p style="color: var(--text-muted);">
        Demonstrates Database Connectivity, PDO, Prepared Statements (<code>?</code> placeholders), and full CRUD.
      </p>
    </header>

    <?php if (!empty($message)): ?>
      <div class="message-banner <?php echo $message_type; ?>">
        <?php echo htmlspecialchars($message); ?>
      </div>
    <?php endif; ?>

    <!-- ADD STOCK FORM (CREATE) -->
    <section class="form-section" style="margin-bottom: 2rem;">
      <h3>Create: Insert Stock (Prepared Statement)</h3>
      <form action="php-mysql-crud.php" method="POST" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; align-items: end; margin-top: 1rem;">
        <input type="hidden" name="action" value="add">
        
        <div class="form-group">
          <label>Symbol</label>
          <input type="text" name="symbol" placeholder="e.g. NFLX" required>
        </div>

        <div class="form-group">
          <label>Company</label>
          <input type="text" name="company_name" placeholder="e.g. Netflix Inc." required>
        </div>

        <div class="form-group">
          <label>Price ($)</label>
          <input type="number" step="0.01" name="price" placeholder="620.00" required>
        </div>

        <div class="form-group">
          <label>Change (%)</label>
          <input type="number" step="0.01" name="change_percent" placeholder="1.80" required>
        </div>

        <button type="submit" class="btn primary-btn">Add Record</button>
      </form>
    </section>

    <!-- LIST STOCKS (READ, UPDATE, DELETE) -->
    <section class="watchlist-section">
      <h3>Read: Stock Records in MySQL (<code>stockpulse_lite.stocks</code>)</h3>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 1rem; text-align: left;">
        <thead>
          <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-muted); font-size: 0.9rem;">
            <th style="padding: 0.75rem;">ID</th>
            <th style="padding: 0.75rem;">Symbol</th>
            <th style="padding: 0.75rem;">Company Name</th>
            <th style="padding: 0.75rem;">Price ($)</th>
            <th style="padding: 0.75rem;">Change (%)</th>
            <th style="padding: 0.75rem;">Quick Update Price</th>
            <th style="padding: 0.75rem;">Action</th>
          </tr>
        </thead>
        <tbody>
          <?php if (empty($stocks)): ?>
            <tr>
              <td colspan="7" style="padding: 1.5rem; text-align: center; color: var(--text-muted);">
                No records found or MySQL not connected.
              </td>
            </tr>
          <?php else: ?>
            <?php foreach ($stocks as $s): ?>
              <tr style="border-bottom: 1px solid #1e293b;">
                <td style="padding: 0.75rem;"><?php echo htmlspecialchars($s['id']); ?></td>
                <td style="padding: 0.75rem; font-weight: bold;"><?php echo htmlspecialchars($s['symbol']); ?></td>
                <td style="padding: 0.75rem;"><?php echo htmlspecialchars($s['company_name']); ?></td>
                <td style="padding: 0.75rem;">$<?php echo number_format($s['price'], 2); ?></td>
                <td style="padding: 0.75rem; color: <?php echo $s['change_percent'] >= 0 ? '#34d399' : '#f87171'; ?>">
                  <?php echo ($s['change_percent'] >= 0 ? '+' : '') . number_format($s['change_percent'], 2); ?>%
                </td>
                
                <!-- UPDATE FORM -->
                <td style="padding: 0.75rem;">
                  <form action="php-mysql-crud.php" method="POST" style="display: flex; gap: 0.5rem;">
                    <input type="hidden" name="action" value="update">
                    <input type="hidden" name="id" value="<?php echo $s['id']; ?>">
                    <input type="number" step="0.01" name="price" value="<?php echo $s['price']; ?>" style="width: 80px; padding: 0.25rem 0.5rem; background: #0f172a; color: white; border: 1px solid var(--border-color); border-radius: 4px;">
                    <button type="submit" class="btn secondary-btn" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">Save</button>
                  </form>
                </td>

                <!-- DELETE LINK -->
                <td style="padding: 0.75rem;">
                  <a href="php-mysql-crud.php?delete_id=<?php echo $s['id']; ?>" 
                     class="btn delete-btn" 
                     style="padding: 0.25rem 0.5rem; font-size: 0.75rem; text-decoration: none;"
                     onclick="return confirm('Delete this record from MySQL?');">
                    Delete
                  </a>
                </td>
              </tr>
            <?php endforeach; ?>
          <?php endif; ?>
        </tbody>
      </table>
    </section>

    <div style="margin-top: 2rem; text-align: center;">
      <a href="../index.html" class="btn secondary-btn">← Back to Main Dashboard</a>
    </div>
  </div>

</body>
</html>

<?php
// ============================================================
// WTL Topic 12: PHP Forms, Validation, Strings & Sessions
// ============================================================

// 1. SESSION START
session_start();

$message = '';
$message_type = '';

// 2. LOGOUT HANDLER
if (isset($_GET['action']) && $_GET['action'] === 'logout') {
    // Unset all session variables and destroy session
    $_SESSION = array();
    session_destroy();
    header("Location: php-session-demo.php");
    exit;
}

// 3. FORM SUBMISSION & VALIDATION
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $raw_name = $_POST['username'] ?? '';
    $raw_role = $_POST['role'] ?? '';

    // STRING MANIPULATION: trim whitespace
    $clean_name = trim($raw_name);
    $clean_role = trim($raw_role);

    // FORM VALIDATION
    if (empty($clean_name)) {
        $message = "Validation Error: Username cannot be empty.";
        $message_type = "error";
    } elseif (strlen($clean_name) < 3) { // STRING FUNCTION: strlen
        $message = "Validation Error: Username must be at least 3 characters long.";
        $message_type = "error";
    } else {
        // STRING FUNCTION: strtoupper to format role nicely
        $formatted_role = strtoupper($clean_role);
        
        // STORE IN SESSION
        $_SESSION['username'] = htmlspecialchars($clean_name);
        $_SESSION['role'] = htmlspecialchars($formatted_role);
        $_SESSION['login_time'] = date("Y-m-d H:i:s");

        $message = "Login successful! Session started.";
        $message_type = "success";
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>WTL Topic 12: PHP Forms, Validation, & Sessions</title>
  <link rel="stylesheet" href="../style.css">
  <style>
    .php-container {
      max-width: 600px;
      margin: 3rem auto;
      background: var(--card-color);
      border: 1px solid var(--border-color);
      padding: 2rem;
      border-radius: var(--radius);
    }
  </style>
</head>
<body style="padding: 2rem;">

  <div class="php-container">
    <header style="text-align: center; margin-bottom: 2rem;">
      <h1>WTL Topic 12: PHP Demonstration</h1>
      <p style="color: var(--text-muted); font-size: 0.95rem;">
        Covers PHP forms, POST processing, validation, string functions (<code>trim</code>, <code>strlen</code>, <code>strtoupper</code>), and session management.
      </p>
    </header>

    <?php if (!empty($message)): ?>
      <div class="message-banner <?php echo $message_type; ?>">
        <?php echo htmlspecialchars($message); ?>
      </div>
    <?php endif; ?>

    <!-- CHECK IF USER HAS ACTIVE SESSION -->
    <?php if (isset($_SESSION['username'])): ?>
      
      <div style="background: #0f172a; padding: 1.5rem; border-radius: 6px; border: 1px solid var(--border-color); margin-bottom: 1.5rem;">
        <h3 style="color: #34d399; margin-bottom: 0.5rem;">Active Session Found!</h3>
        <p><strong>Username:</strong> <?php echo $_SESSION['username']; ?></p>
        <p><strong>Role:</strong> <?php echo $_SESSION['role']; ?></p>
        <p><strong>Session Started:</strong> <?php echo $_SESSION['login_time']; ?></p>
        <p><strong>Session ID:</strong> <code><?php echo session_id(); ?></code></p>
      </div>

      <a href="php-session-demo.php?action=logout" class="btn delete-btn" style="display: inline-block; text-align: center; width: 100%;">
        Log Out (Destroy Session)
      </a>

    <?php else: ?>

      <!-- LOGIN / SESSION FORM -->
      <form action="php-session-demo.php" method="POST" style="display: flex; flex-direction: column; gap: 1rem;">
        <div class="form-group">
          <label for="username">Enter Trader Username:</label>
          <input type="text" id="username" name="username" placeholder="e.g. Reyyan" required>
        </div>

        <div class="form-group">
          <label for="role">Select Role:</label>
          <select id="role" name="role" style="padding: 0.65rem; background: #0f172a; color: white; border: 1px solid var(--border-color); border-radius: var(--radius);">
            <option value="analyst">Market Analyst</option>
            <option value="trader">Swing Trader</option>
            <option value="student">WTL Student</option>
          </select>
        </div>

        <button type="submit" class="btn primary-btn" style="margin-top: 0.5rem;">
          Start PHP Session
        </button>
      </form>

    <?php endif; ?>

    <div style="margin-top: 2rem; text-align: center;">
      <a href="../index.html" class="btn secondary-btn">← Back to StockPulse Lite</a>
    </div>
  </div>

</body>
</html>

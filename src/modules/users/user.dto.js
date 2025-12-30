/**
 * 🛡️ USER DTO
 * Handles validation and data structuring for User operations.
 */
export class CreateUserDTO {
  constructor(data) {
    this.email = data.email;
    this.password = data.password;
    this.role = data.role || "student"; // Default role
    this.display_name = data.Display_name;

    // 'class' is a reserved keyword in JavaScript, so we map it to 'user_class' internally
    this.user_class = data.class || null;

    this.validate();
    this.sanitize();
  }

  validate() {
    if (!this.email) throw new Error("Missing required field: email");
    if (!this.password) throw new Error("Missing required field: password");

    // Basic email check
    if (!this.email.includes("@")) throw new Error("Invalid email format");
  }

  sanitize() {
    // Logic moved from Controller: Auto-generate name if missing
    if (!this.display_name) {
      this.display_name = this.email.split("@")[0];
    }
  }

  /**
   * Prepares the object for the database repository.
   * @param {string} hashedPassword - We pass the hash in, as the DTO shouldn't handle encryption logic itself.
   */
  toStorage(hashedPassword) {
    return {
      email: this.email,
      password_hash: hashedPassword,
      role: this.role,
      Display_name: this.display_name, // Matches DB column
      class: this.user_class, // Matches DB column
    };
  }
}

// Included for future use, since your Repo supports updates
export class UpdateUserDTO {
  constructor(data) {
    this.email = data.email;
    this.role = data.role;
    this.display_name = data.Display_name;
    this.user_class = data.class;
  }

  toPartialUpdate() {
    const fields = {};
    if (this.email !== undefined) fields.email = this.email;
    if (this.role !== undefined) fields.role = this.role;
    if (this.display_name !== undefined)
      fields.Display_name = this.display_name;
    if (this.user_class !== undefined) fields.class = this.user_class;

    if (Object.keys(fields).length === 0) {
      throw new Error("No valid fields provided for update");
    }
    return fields;
  }
}

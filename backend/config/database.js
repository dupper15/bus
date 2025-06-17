const { default: mongoose } = require("mongoose");

// Singleton Pattern
class DBConnection {
  constructor() {
    if (DBConnection.instance) return DBConnection.instance;
    this.connected = false;
    DBConnection.instance = this;
  }

  connect() {
    if (!this.connected) {
      mongoose
        .connect(`mongodb+srv://22520734:${process.env.MONGO_DB}@bus.cujvx.mongodb.net/?retryWrites=true&w=majority&appName=Bus`)
        .then(() => {
          console.log("Database connected successful!");
          this.connected = true;
        })
        .catch((err) => {
          console.error("Database connection error:", err);
        });
    }
  }
}

const db = new DBConnection();

module.exports = db;

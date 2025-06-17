class Flyweight {
  constructor(type, data) {
    this.type = type; 
    this.data = data; 
  }

  getRepeatingState() {
    return this.data;
  }
}

module.exports = Flyweight;

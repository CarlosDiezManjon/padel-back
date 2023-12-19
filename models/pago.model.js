class Pago {
    constructor({ id, reservaId, importe, métodoPago, fecha }) {
      this.id = id;
      this.reservaId = reservaId;
      this.importe = importe;
      this.métodoPago = métodoPago;
      this.fecha = fecha;
    }
  }
  
  module.exports = Pago;
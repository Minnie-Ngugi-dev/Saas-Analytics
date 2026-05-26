import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  plan: String,
  billingCycle: String,
  transactionId: {
    type: String,
    unique: true
  },
  mpesaReceipt: String,
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  failureReason: String,
  paymentDate: Date,
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

export default mongoose.model('Payment', paymentSchema);
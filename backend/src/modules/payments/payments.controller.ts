import { Request, Response } from 'express';
import crypto from 'crypto';
import { paymentVerificationSchema } from '../../shared/index.js';
import { store } from '../../database/index.js';
import { AppError } from '../../middleware/errorHandler.js';
import { verifyFileSignature, verifyBufferSignature } from '../../middleware/upload.js';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import { config } from '../../config/index.js';
import { storageService } from '../../services/storage.service.js';

export async function getPaymentInstructions(req: Request, res: Response) {
  const { orderNumber } = req.params;
  const generalSettings = store.storeSettings.get('general');
  const bankDetails = generalSettings?.bankDetails;

  let orderData = null;
  if (orderNumber) {
    const order = store.orders.find((o) => o.orderNumber === orderNumber);
    if (order) {
      orderData = {
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        currency: order.currency,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
      };
    }
  }

  return res.json({
    success: true,
    data: {
      bankDetails: bankDetails || {
        enabled: true,
        bankName: 'Zenith Bank PLC',
        accountName: 'Magnificent Luxury Retail Ltd',
        accountNumber: '1012345678',
        instructions: 'Please transfer the exact amount and quote your Order Reference in the narration.',
        deadlineHours: 24,
      },
      order: orderData,
    },
  });
}

export async function submitReceipt(req: Request, res: Response) {
  const file = req.file;
  if (!file || (!file.buffer && !file.path)) {
    throw new AppError('Payment receipt file is required (JPEG, PNG, WebP or PDF)', 400);
  }

  const { orderNumber, guestAccessToken, submittedAmount, paymentReference } = req.body;
  if (!orderNumber) {
    throw new AppError('Order number is required to associate payment receipt', 400);
  }

  const buffer = file.buffer || (file.path ? fs.readFileSync(file.path) : null);
  if (!buffer) {
    throw new AppError('Unable to read uploaded receipt content', 400);
  }

  // 1. Verify file content signature (magic bytes)
  const isValidSignature = verifyBufferSignature(buffer);
  if (!isValidSignature) {
    throw new AppError('File header inspection failed: the uploaded file is not a valid image or PDF document.', 400);
  }

  // 2. Find Order
  const order = store.orders.find((o) => o.orderNumber.toUpperCase() === orderNumber.trim().toUpperCase());
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // 3. Authorization check: must match guest token or logged-in customer or admin
  const isAuthorized =
    (guestAccessToken && order.guestAccessToken === guestAccessToken) ||
    (req.user && (req.user.id === order.customerId || req.user.role === 'admin'));

  if (!isAuthorized) {
    throw new AppError('You are not authorized to submit a payment receipt for this order.', 403);
  }

  const ext = (path.extname(file.originalname) || '.jpg').toLowerCase();
  const randomHex = crypto.randomBytes(16).toString('hex');
  const filename = file.filename || `rcpt_${Date.now()}_${randomHex}${ext}`;

  // 4. Upload receipt to S3/R2 bucket or Neon PostgreSQL media_files table
  const uploadResult = await storageService.uploadReceipt(buffer, filename, file.mimetype);

  // 5. Create submission record
  const submissionId = crypto.randomUUID();
  const submission = {
    id: submissionId,
    orderId: order.id,
    orderNumber: order.orderNumber,
    receiptStorageKey: uploadResult.key,
    originalFilename: file.originalname,
    mimeType: file.mimetype,
    fileSize: file.size,
    submittedAmount: submittedAmount ? Number(submittedAmount) : order.totalAmount,
    paymentReference: paymentReference || null,
    status: 'pending' as const,
    rejectionReason: null,
    reviewedBy: null,
    reviewedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await store.savePaymentSubmission(submission);

  // 5. Update Order Status
  const previousStatus = order.orderStatus;
  await store.updateOrderStatus(order.id, 'payment_review', 'pending_verification');

  // 6. Record Status History
  await store.saveOrderStatusHistory({
    id: crypto.randomUUID(),
    orderId: order.id,
    previousStatus,
    newStatus: 'payment_review',
    changedBy: req.user?.fullName || order.customerName,
    note: `Payment receipt submitted (${file.originalname}). Awaiting concierge ledger verification.`,
    createdAt: new Date(),
  });

  // 7. Store admin notification
  await store.saveNotification({
    id: crypto.randomUUID(),
    recipientRole: 'admin',
    title: `Receipt Uploaded: ${order.orderNumber}`,
    message: `${order.customerName} submitted a payment receipt of ₦${(submission.submittedAmount || order.totalAmount).toLocaleString()} for order ${order.orderNumber}.`,
    type: 'payment',
    isRead: false,
    orderId: order.orderNumber,
    createdAt: new Date(),
  });

  return res.status(201).json({
    success: true,
    message: 'Payment proof submitted successfully. Our concierge desk will verify your transfer shortly.',
    data: {
      submissionId,
      orderNumber: order.orderNumber,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
    },
  });
}

export async function getVerificationQueue(req: Request, res: Response) {
  await store.ensureFresh(0);
  const pendingSubmissions = store.paymentSubmissions
    .filter((s) => s.status === 'pending')
    .map((s) => {
      const order = store.orders.find((o) => o.id === s.orderId);
      // Generate secure signed review token
      const reviewToken = jwt.sign(
        { filename: s.receiptStorageKey, role: 'admin' },
        config.jwt.secret,
        { expiresIn: '2h' }
      );

      return {
        ...s,
        order,
        reviewToken,
        previewUrl: `/api/receipts/file/${reviewToken}`,
      };
    });

  return res.json({
    success: true,
    data: pendingSubmissions,
  });
}

export async function verifyPayment(req: Request, res: Response) {
  const validated = paymentVerificationSchema.parse(req.body);

  let submission = store.paymentSubmissions.find((s) => s.id === validated.submissionId);
  if (!submission) {
    await store.ensureFresh(0);
    submission = store.paymentSubmissions.find((s) => s.id === validated.submissionId);
  }
  if (!submission) {
    throw new AppError('Payment submission record not found', 404);
  }

  const order = store.orders.find((o) => o.id === submission.orderId);
  if (!order) {
    throw new AppError('Associated order not found', 404);
  }

  const reviewerName = req.user?.fullName || 'Concierge Admin';

  if (validated.action === 'approve') {
    submission.status = 'approved';
    submission.reviewedBy = reviewerName;
    submission.reviewedAt = new Date();
    submission.updatedAt = new Date();

    const previousStatus = order.orderStatus;
    await store.updateOrderStatus(order.id, 'confirmed', 'paid');
    await store.savePaymentSubmission(submission);

    await store.saveOrderStatusHistory({
      id: crypto.randomUUID(),
      orderId: order.id,
      previousStatus,
      newStatus: 'confirmed',
      changedBy: reviewerName,
      note: `Payment receipt verified against bank transaction. Order confirmed for fulfillment.`,
      createdAt: new Date(),
    });

    await store.saveAuditLog({
      id: crypto.randomUUID(),
      actorId: req.user?.id || 'admin',
      actorName: reviewerName,
      action: 'payment_approve',
      resourceType: 'payment_submission',
      resourceId: submission.id,
      metadata: { orderNumber: order.orderNumber, amount: submission.submittedAmount },
      createdAt: new Date(),
    });

    return res.json({
      success: true,
      message: `Payment for order ${order.orderNumber} successfully approved and order confirmed.`,
      data: { order, submission },
    });
  } else {
    // Reject
    submission.status = 'rejected';
    submission.rejectionReason = validated.rejectionReason || 'Receipt verification failed';
    submission.reviewedBy = reviewerName;
    submission.reviewedAt = new Date();
    submission.updatedAt = new Date();

    await store.updateOrderStatus(order.id, order.orderStatus, 'rejected');
    await store.savePaymentSubmission(submission);

    await store.saveOrderStatusHistory({
      id: crypto.randomUUID(),
      orderId: order.id,
      previousStatus: order.orderStatus,
      newStatus: order.orderStatus,
      changedBy: reviewerName,
      note: `Payment receipt rejected: ${submission.rejectionReason}. Customer requested to re-upload valid proof.`,
      createdAt: new Date(),
    });

    await store.saveAuditLog({
      id: crypto.randomUUID(),
      actorId: req.user?.id || 'admin',
      actorName: reviewerName,
      action: 'payment_reject',
      resourceType: 'payment_submission',
      resourceId: submission.id,
      metadata: { orderNumber: order.orderNumber, reason: submission.rejectionReason },
      createdAt: new Date(),
    });

    return res.json({
      success: true,
      message: `Payment receipt for order ${order.orderNumber} rejected. Customer will be notified to re-upload.`,
      data: { order, submission },
    });
  }
}

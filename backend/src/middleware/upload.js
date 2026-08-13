const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * File-type signatures ("magic bytes"). The client-supplied extension and
 * declared Content-Type are both attacker-controlled and never trusted —
 * every upload is classified by sniffing its actual bytes instead, and the
 * extension it's stored under (and therefore the Content-Type express.static
 * later serves it with) is always the *detected* type, never the claimed one.
 *
 * .doc/.docx checks confirm the container format (legacy OLE2 / OOXML-ZIP)
 * rather than parsing the document structure, so a renamed .xls/.xlsx would
 * also pass — full structural validation is out of scope here, but this
 * still blocks arbitrary/executable content from being uploaded as a "doc".
 */
const SIGNATURES = [
  { ext: '.pdf', mime: 'application/pdf', check: (b) => b.subarray(0, 5).toString('latin1') === '%PDF-' },
  { ext: '.png', mime: 'image/png', check: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { ext: '.jpg', mime: 'image/jpeg', check: (b) => b.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])) },
  { ext: '.doc', mime: 'application/msword', check: (b) => b.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])) },
  { ext: '.docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', check: (b) => b.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04])) },
];

function detectType(buffer) {
  return SIGNATURES.find((sig) => sig.check(buffer)) || null;
}

/**
 * Builds middleware that accepts a single multipart file field, verifies its
 * real content by magic bytes, and — only on a match — writes it to disk
 * under a random filename with the detected extension. Buffers in memory
 * first (rather than streaming straight to disk) specifically so invalid
 * content never touches disk at all. Fails closed with 400 on any problem,
 * never 500, since a rejected upload is a client error, not a server one.
 */
function contentVerifiedUpload(fieldName, allowedExts, maxSizeBytes) {
  const memoryUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxSizeBytes },
  }).single(fieldName);

  return (req, res, next) => {
    memoryUpload(req, res, (err) => {
      if (err) {
        const message = err.code === 'LIMIT_FILE_SIZE'
          ? `File too large. Maximum size is ${Math.floor(maxSizeBytes / (1024 * 1024))}MB.`
          : 'File upload failed.';
        return res.status(400).json({ message });
      }
      if (!req.file) return next(); // let the controller's own "no file" check respond

      const detected = detectType(req.file.buffer);
      if (!detected || !allowedExts.includes(detected.ext)) {
        return res.status(400).json({
          message: `Invalid file content. Only ${allowedExts.join(', ')} files are allowed.`,
        });
      }

      const filename = crypto.randomBytes(24).toString('hex') + detected.ext;
      const destPath = path.join(uploadDir, filename);
      try {
        fs.writeFileSync(destPath, req.file.buffer);
      } catch (writeErr) {
        console.error('[upload] Failed to persist uploaded file:', writeErr);
        return res.status(500).json({ message: 'Failed to store uploaded file.' });
      }

      // Reshape req.file to match what disk-storage multer used to produce,
      // so existing controllers reading req.file.filename keep working.
      req.file.filename = filename;
      req.file.path = destPath;
      req.file.mimetype = detected.mime;
      req.file.destination = uploadDir;
      delete req.file.buffer;

      next();
    });
  };
}

// Healthmate registration documents — PDF, Word, or a scanned image.
const uploadDocument = contentVerifiedUpload('document', ['.pdf', '.doc', '.docx', '.png', '.jpg'], 10 * 1024 * 1024);

// Ops user profile pictures — images only, tighter size cap.
const uploadAvatar = contentVerifiedUpload('avatar', ['.png', '.jpg'], 5 * 1024 * 1024);

module.exports = { uploadDocument, uploadAvatar };

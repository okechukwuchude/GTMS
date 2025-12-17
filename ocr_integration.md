# GTMS Phase 6: OCR Integration Plan
## Bill of Lading Document Upload & Automatic Form Filling

**Goal**: Implement OCR (Optical Character Recognition) integration using Google Cloud Vision API to automatically extract information from bill of lading documents and pre-fill the container registration form, with user review/correction capability.

---

## Context

**Current State:**
- ✅ GTMS (Global Trade Monitoring System) MVP is ~95% complete
- ✅ Container registration form has 26 fields across 5 sections
- ✅ Database already has OCR tracking fields: `ocr_processed`, `ocr_confidence`, `ocr_data` (JSON)
- ✅ Form validation with Zod schemas in place
- ⏳ **Current Task**: Implement Phase 6 - OCR Integration for automatic form filling

**User Requirements:**
- OCR Service: Google Cloud Vision API (cloud-based, high accuracy)
- File Formats: PDF, JPG, PNG, TIFF (all common BOL document formats)
- User Experience: Auto-fill with review step (safest approach)
- Processing: Server-side (secure, better for cloud APIs)

**Form Fields to Extract (26 total):**
1. **Container Details** (4): container_number, bill_of_lading, seal_number, container_type
2. **Shipper Info** (3): shipper_name, shipper_address, shipper_country
3. **Consignee Info** (3): consignee_name, consignee_address, consignee_country
4. **Cargo Details** (12): cargo_description, commodity_type, hs_code, quantity, quantity_unit, weight_kg, volume_cbm, value_usd, currency, is_hazardous, hazard_class
5. **Ports & Schedule** (4): origin_port_id, destination_port_id, eta, temperature_celsius

**OCR Extraction Tiers** (by confidence level):
- **Tier 1** (High Confidence ≥95%): container_number, bill_of_lading, shipper_name, consignee_name, quantity, weight_kg
- **Tier 2** (Medium ≥85%): cargo_description, addresses, value_usd, ports, eta
- **Tier 3** (Low ≥75%): hs_code, commodity_type, quantity_unit, country fields
- **Tier 4** (Context-Dependent ≥60%): is_hazardous, hazard_class, temperature_celsius

---

## Implementation Approach

### Sprint 1: Google Cloud Vision API Setup & Environment Configuration (1-2 hours)

**Task 1.1: Set Up Google Cloud Vision API**
- Create Google Cloud project (or use existing)
- Enable Cloud Vision API in GCP Console
- Create service account with Vision API permissions
- Generate JSON key file
- Store credentials securely

**Task 1.2: Configure Environment Variables**
- File: `.env.local`
- Add environment variables:
  ```
  GOOGLE_CLOUD_PROJECT_ID=your-project-id
  GOOGLE_CLOUD_VISION_API_KEY=your-api-key
  # OR use service account JSON (recommended)
  GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
  ```
- Add to `.env.example` (without actual values)
- Update `.gitignore` to ensure credentials never committed

**Task 1.3: Install Google Cloud Vision Dependencies**
- Run: `pnpm add @google-cloud/vision`
- Run: `pnpm add @google-cloud/storage` (for document storage if needed)
- Run: `pnpm add pdf-parse` (for PDF text extraction)
- Run: `pnpm add sharp` (for image processing)
- Verify installation in `package.json`

**Task 1.4: Create OCR Utilities Folder Structure**
- Create folder: `/src/lib/ocr/`
- Files to create:
  - `/src/lib/ocr/vision-client.ts` - Vision API client wrapper
  - `/src/lib/ocr/field-extractors.ts` - Field extraction logic
  - `/src/lib/ocr/confidence-calculator.ts` - Confidence scoring
  - `/src/lib/ocr/port-lookup.ts` - Port code to UUID mapping
  - `/src/lib/ocr/types.ts` - OCR-specific TypeScript types

**Acceptance Criteria:**
- ✓ Google Cloud Vision API enabled and accessible
- ✓ Environment variables configured
- ✓ Dependencies installed
- ✓ OCR utilities folder structure created

---

### Sprint 2: File Upload Infrastructure (2-3 hours)

**Task 2.1: Create Document Upload API Route**
- File: `/src/app/api/ocr/upload/route.ts`
- Endpoint: `POST /api/ocr/upload`
- Accept: multipart/form-data with file
- Validate: file type (PDF, JPG, PNG, TIFF) and size (max 10MB)
- Store file temporarily in `/tmp` or cloud storage
- Return: uploadId, fileUrl for OCR processing

**Task 2.2: Install File Upload Dependencies**
- Run: `pnpm add formidable` (for multipart form parsing)
- Run: `pnpm add -D @types/formidable`
- Configure Next.js API route to disable bodyParser:
  ```ts
  export const config = {
    api: {
      bodyParser: false
    }
  }
  ```

**Task 2.3: Create File Validation Utility**
- File: `/src/lib/utils/file-validation.ts`
- Functions:
  - `validateFileType(file)` - Check if PDF/JPG/PNG/TIFF
  - `validateFileSize(file, maxMB)` - Check file size limit
  - `sanitizeFileName(name)` - Remove dangerous characters
  - `getFileExtension(name)` - Extract extension
- Export type: `SupportedFileType = 'pdf' | 'jpg' | 'png' | 'tiff'`

**Task 2.4: Create Document Storage Utility**
- File: `/src/lib/utils/document-storage.ts`
- Options:
  - **Option A**: Local filesystem storage in `/tmp` (simpler, for MVP)
  - **Option B**: Supabase Storage (recommended for production)
  - **Option C**: Google Cloud Storage (if already using GCP)
- Functions:
  - `saveDocument(file, userId)` - Store document, return URL
  - `getDocument(documentId)` - Retrieve document
  - `deleteDocument(documentId)` - Clean up after processing
- Return: `{ documentId, documentUrl, uploadedAt }`

**Acceptance Criteria:**
- ✓ File upload API route functional
- ✓ File type and size validation working
- ✓ Documents stored securely
- ✓ Temporary files cleaned up after processing

---

### Sprint 3: OCR Processing Engine (4-5 hours)

**Task 3.1: Create Vision API Client Wrapper**
- File: `/src/lib/ocr/vision-client.ts`
- Initialize Google Cloud Vision client with credentials
- Function: `async detectText(filePath: string)` - Main OCR function
- Uses: `textDetection` or `documentTextDetection` (better for structured docs)
- Return raw Vision API response
- Error handling for API failures, rate limits

**Task 3.2: Create OCR Processing API Route**
- File: `/src/app/api/ocr/process/route.ts`
- Endpoint: `POST /api/ocr/process`
- Input: `{ documentId: string, userId: string }`
- Steps:
  1. Retrieve document from storage
  2. Call Vision API to extract text
  3. Parse extracted text into structured data
  4. Calculate confidence scores
  5. Map to form fields
  6. Return structured OCR result
- Add: `export const dynamic = 'force-dynamic'`
- Add: `export const maxDuration = 60` (Vision API can be slow)

**Task 3.3: Create Field Extractor Functions**
- File: `/src/lib/ocr/field-extractors.ts`
- Implement extraction functions for each field category:

```typescript
// Example structure
export const extractors = {
  // Tier 1: High confidence structured fields
  extractContainerNumber: (text: string) => RegexPattern /[A-Z]{4}\d{7}/
  extractBillOfLading: (text: string) => Look for "BOL", "B/L", "BL No"
  extractShipperName: (text: string) => Section after "Shipper"
  extractConsigneeName: (text: string) => Section after "Consignee"

  // Tier 2: Moderate confidence
  extractCargoDescription: (text: string) => Extract paragraph after "Cargo", "Description of Goods"
  extractAddresses: (text: string) => Multi-line extraction under party names
  extractPorts: (text: string) => Look for port codes (e.g., USNYC, SGSIN)
  extractDates: (text: string) => Parse date formats for ETA

  // Tier 3: Lower confidence
  extractHSCode: (text: string) => Pattern /\d{4}\.\d{2}\.\d{2}/
  extractQuantity: (text: string) => Numbers near "Quantity", "Packages"
  extractWeight: (text: string) => Numbers near "Weight", "KG", "KGS"
  extractValue: (text: string) => Currency amounts near "Value"

  // Tier 4: Context-dependent
  extractHazardousIndicator: (text: string) => Look for "HAZMAT", "DANGEROUS", hazard symbols
  extractTemperature: (text: string) => Numbers near "°C", "Temperature"
}
```

**Task 3.4: Create Confidence Calculator**
- File: `/src/lib/ocr/confidence-calculator.ts`
- Function: `calculateFieldConfidence(field, extractedValue, visionConfidence)`
- Factors:
  - Vision API's built-in confidence score (0-1)
  - Field type (structured vs free-text)
  - Validation pass (does it match expected format?)
  - Keyword proximity (was field label found nearby?)
- Return: confidence score 0-100%
- Function: `calculateOverallConfidence(allFields)` - Average of all field confidences

**Task 3.5: Create Port Lookup Utility**
- File: `/src/lib/ocr/port-lookup.ts`
- Function: `async lookupPortByCode(portCode: string)` - Query ports table
- Port code formats: UN/LOCODE (e.g., USNYC, SGSIN, NLRTM)
- Fuzzy matching for slight variations
- Return: `{ portId: UUID, portName, code, confidence }`
- Handle: port not found → return null, require manual selection

**Task 3.6: Create OCR Types**
- File: `/src/lib/ocr/types.ts`
- Define TypeScript interfaces:

```typescript
export interface OCRField {
  value: string | number | boolean | null
  confidence: number // 0-100
  boundingBox?: BoundingBox
  source: 'ocr' | 'manual'
}

export interface OCRResult {
  documentId: string
  fields: {
    container_number?: OCRField
    bill_of_lading?: OCRField
    shipper_name?: OCRField
    // ... all 26 fields
  }
  overallConfidence: number
  rawText: string
  processedAt: string
  processingTimeMs: number
}

export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}
```

**Acceptance Criteria:**
- ✓ Vision API successfully processes documents
- ✓ Text extraction working for all supported formats
- ✓ Field extractors return sensible values
- ✓ Confidence scores calculated accurately
- ✓ Port codes mapped to port IDs

---

### Sprint 4: Frontend - Document Upload Component (3-4 hours)

**Task 4.1: Create Document Upload Component**
- File: `/src/components/ocr/DocumentUpload.tsx`
- Features:
  - Drag-and-drop zone (use shadcn/ui or react-dropzone)
  - File type icons (PDF, Image)
  - Upload progress indicator
  - File size and type validation client-side
  - Preview thumbnail for images
  - "Upload & Extract" button
- Props: `onUploadSuccess(ocrResult)`, `onUploadError(error)`
- State: uploading, processing, error, success

**Task 4.2: Install Upload UI Dependencies**
- Run: `pnpm add react-dropzone`
- Run: `pnpm add -D @types/react-dropzone`
- Or use shadcn/ui file input if available

**Task 4.3: Create Upload Hook**
- File: `/src/lib/hooks/useDocumentUpload.ts`
- React Query mutation for upload + OCR processing
- Functions:
  - `uploadDocument(file)` - Upload to /api/ocr/upload
  - `processDocument(documentId)` - Trigger OCR via /api/ocr/process
  - Combined: `uploadAndProcess(file)` - Do both in sequence
- Return: `{ data, isLoading, error, uploadProgress }`
- Handle: network errors, file validation errors, OCR failures

**Task 4.4: Create OCR Status Badge Component**
- File: `/src/components/ocr/OCRStatusBadge.tsx`
- Props: `confidence: number, status: 'processing' | 'success' | 'error'`
- Display:
  - Processing: Spinner + "Extracting data..."
  - Success High (≥85%): Green badge "High confidence"
  - Success Medium (70-84%): Yellow badge "Review recommended"
  - Success Low (<70%): Orange badge "Manual review required"
  - Error: Red badge "Extraction failed"

**Acceptance Criteria:**
- ✓ Users can drag-and-drop or click to upload
- ✓ Upload progress shown during processing
- ✓ Error messages displayed for invalid files
- ✓ OCR status communicated clearly

---

### Sprint 5: Frontend - OCR Review & Form Integration (4-5 hours)

**Task 5.1: Modify ContainerRegistrationForm for OCR**
- File: `/src/components/containers/ContainerRegistrationForm.tsx`
- Add new prop: `ocrData?: OCRResult` (optional)
- Add state: `showOCRReview: boolean`
- If `ocrData` provided:
  - Pre-fill form fields with OCR extracted values
  - Show confidence indicator next to each field
  - Highlight low-confidence fields (yellow background)
  - Allow user to edit any field
  - Show "OCR extracted" badge on pre-filled fields

**Task 5.2: Create OCR Review Panel Component**
- File: `/src/components/ocr/OCRReviewPanel.tsx`
- Display side-by-side:
  - Left: Document preview (PDF/image viewer)
  - Right: Extracted fields with confidence scores
- Features:
  - Click field to highlight in document (if bounding boxes available)
  - Edit button per field
  - "Accept All" button (for high confidence results)
  - "Review All" button (expand all low-confidence fields)
- Use shadcn Dialog or Sheet component

**Task 5.3: Add OCR Upload Button to Container Dialog**
- File: `/src/components/containers/ContainerDialog.tsx`
- Add tab or section: "Upload Bill of Lading"
- Include DocumentUpload component
- On successful OCR:
  - Switch to form view
  - Pass ocrData to ContainerRegistrationForm
  - Show OCR review panel (optional)
- Workflow:
  1. User opens "Register Container" dialog
  2. Option 1: Manual entry (existing)
  3. Option 2: Upload BOL document (new)
  4. After upload → form pre-filled → user reviews → submits

**Task 5.4: Create Field Confidence Indicator Component**
- File: `/src/components/ocr/FieldConfidenceIndicator.tsx`
- Props: `confidence: number, fieldName: string`
- Display: Small badge next to form field label
- Colors:
  - ≥95%: Green checkmark
  - 85-94%: Yellow warning "Review"
  - 70-84%: Orange warning "Low confidence"
  - <70%: Red warning "Verify"
- Tooltip: "OCR confidence: 87% - Please review"

**Task 5.5: Update ContainerDialog Tabs**
- Add two tabs:
  - Tab 1: "Manual Entry" (existing form)
  - Tab 2: "Upload Document" (new OCR flow)
- State management: switch between tabs
- Preserve form data when switching tabs (don't lose manual edits)

**Acceptance Criteria:**
- ✓ Form pre-filled with OCR data
- ✓ Confidence indicators visible on each field
- ✓ Low-confidence fields highlighted
- ✓ Users can review and edit before submission
- ✓ Workflow smooth: upload → review → submit

---

### Sprint 6: Database Integration & Metadata Storage (2-3 hours)

**Task 6.1: Update Container Creation to Store OCR Metadata**
- File: `/src/app/api/containers/route.ts` (POST handler)
- When creating container from OCR data:
  - Set `ocr_processed = true`
  - Set `ocr_confidence = overallConfidence`
  - Set `ocr_data = JSON.stringify(ocrResult)` - Store full OCR output
- This allows:
  - Auditing: Which fields came from OCR vs manual?
  - Analytics: Track OCR accuracy over time
  - Debugging: Review raw OCR output if field extraction fails

**Task 6.2: Create OCR History Table (Optional but Recommended)**
- Migration: Create `ocr_processing_history` table
- Columns:
  - `id` (UUID, PK)
  - `container_id` (UUID, FK to containers)
  - `user_id` (UUID, FK to profiles)
  - `document_url` (TEXT)
  - `ocr_result` (JSONB) - Full OCR output
  - `confidence_score` (FLOAT)
  - `processing_time_ms` (INT)
  - `created_at` (TIMESTAMP)
- Purpose: Track all OCR attempts, not just successful ones
- Useful for: debugging, improving extraction algorithms, compliance

**Task 6.3: Create OCR Analytics API Route**
- File: `/src/app/api/ocr/stats/route.ts`
- Endpoint: `GET /api/ocr/stats`
- Return:
  - Total OCR documents processed
  - Average confidence score
  - Success rate (confidence >80%)
  - Most commonly low-confidence fields
  - Processing time distribution
- Use for: Admin dashboard, system monitoring

**Task 6.4: Add RLS Policies for OCR History Table**
- Users can only view their own OCR history
- Staff can view all OCR history (for quality control)
- Policy:
  ```sql
  CREATE POLICY "Users can view own OCR history"
    ON ocr_processing_history FOR SELECT
    USING (auth.uid() = user_id)

  CREATE POLICY "Staff can view all OCR history"
    ON ocr_processing_history FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND user_type = 'staff'
      )
    )
  ```

**Acceptance Criteria:**
- ✓ OCR metadata saved to containers table
- ✓ OCR history tracked in separate table
- ✓ RLS policies enforced
- ✓ Analytics available for admin review

---

### Sprint 7: Error Handling & Edge Cases (2-3 hours)

**Task 7.1: Handle OCR Failures Gracefully**
- Scenarios:
  - Vision API rate limit exceeded → Show retry option
  - Document quality too poor → Show "Upload clearer document" message
  - No text detected → Fallback to manual entry
  - Partial extraction (only some fields) → Fill what's available, highlight missing fields
- Error UI:
  - Toast notification: "OCR failed, please enter manually"
  - Option to retry with different document
  - Option to proceed with manual entry

**Task 7.2: Implement Confidence Threshold Logic**
- File: `/src/lib/ocr/confidence-calculator.ts`
- Logic:
  - If overall confidence <60% → Don't auto-fill, show error
  - If overall confidence 60-79% → Fill, but require user review before submit
  - If overall confidence 80-94% → Fill, show review recommended
  - If overall confidence ≥95% → Fill with high confidence
- Disable form submit button until user has reviewed low-confidence fields

**Task 7.3: Add Field-Level Validation After OCR**
- After OCR extraction, validate each field:
  - `container_number`: ISO 6346 checksum validation
  - `bill_of_lading`: Not empty, reasonable length
  - `weight_kg`, `value_usd`: Positive numbers, realistic range
  - `eta`: Future date
  - `ports`: Valid port codes
- If validation fails → Set confidence to 0%, require manual correction
- Display validation errors next to field

**Task 7.4: Handle Large Documents**
- Vision API limits: Max 20MB per request
- If document >20MB:
  - Option 1: Compress image before upload
  - Option 2: Split PDF into pages, process separately
  - Option 3: Show error, ask for smaller file
- Implement: File compression using `sharp` library
- Function: `compressImage(file, maxSizeMB)` - Reduce quality until under limit

**Task 7.5: Add Loading States & Progress Indicators**
- Upload phase: "Uploading document... 45%"
- OCR phase: "Extracting text... this may take 10-30 seconds"
- Parsing phase: "Mapping fields..."
- Success: "Extraction complete! Review the form below."
- Use: Skeleton loaders for form fields during processing

**Acceptance Criteria:**
- ✓ OCR failures handled gracefully
- ✓ Confidence thresholds enforced
- ✓ Field validations prevent bad data
- ✓ Large files handled appropriately
- ✓ Clear loading states throughout process

---

### Sprint 8: Testing & Optimization (3-4 hours)

**Task 8.1: Test with Real Bill of Lading Documents**
- Obtain sample BOL documents (PDF and images):
  - Standard commercial BOL
  - Multi-page BOL
  - Handwritten BOL (will have low accuracy, expected)
  - Scanned BOL with varying quality
- Test extraction accuracy for each field
- Document: Which fields extract well, which need improvement
- Adjust extraction regexes and logic based on results

**Task 8.2: Optimize Field Extraction Algorithms**
- Based on testing, refine:
  - Regex patterns for structured fields
  - Keyword detection for section identification
  - Multi-line text extraction for addresses/descriptions
  - Date format parsing (multiple formats)
  - Number extraction with units (kg, cbm, USD)
- Goal: Achieve >90% accuracy for Tier 1 fields, >80% for Tier 2

**Task 8.3: Add OCR Feedback Mechanism**
- After user submits form with OCR data:
  - Optional: "Was the OCR extraction helpful?" (Yes/No)
  - Optional: "Which fields needed correction?" (checkboxes)
- Store feedback in database
- Use feedback to improve extraction algorithms over time
- Track: Field-specific accuracy rates

**Task 8.4: Performance Optimization**
- Measure: Vision API response time (typically 5-15 seconds)
- Optimize:
  - Use `documentTextDetection` instead of `textDetection` (faster for structured docs)
  - Process images in parallel if multi-page
  - Cache port lookups (ports table doesn't change often)
  - Lazy-load document preview (don't block form rendering)
- Goal: Total OCR time <30 seconds for typical document

**Task 8.5: Add OCR Usage Monitoring**
- Track in database:
  - Number of OCR requests per user
  - Total API costs (Vision API charges per request)
  - Success/failure rates
  - Average confidence scores
- Set up alerts:
  - If failure rate >20%, investigate
  - If costs exceed budget, notify admin
  - If confidence drops below baseline, review new documents

**Acceptance Criteria:**
- ✓ Tested with diverse BOL document types
- ✓ Extraction accuracy meets targets (>85% average)
- ✓ Performance within acceptable range (<30s)
- ✓ Usage monitoring in place
- ✓ Feedback mechanism for continuous improvement

---

### Sprint 9: Documentation & Polish (1-2 hours)

**Task 9.1: Create User Documentation**
- File: `/docs/ocr-user-guide.md`
- Sections:
  - How to upload a Bill of Lading document
  - Supported file formats (PDF, JPG, PNG, TIFF)
  - Tips for best OCR results (good lighting, clear scan, etc.)
  - How to review and correct extracted data
  - What to do if OCR fails
- Add link to docs from upload component

**Task 9.2: Create Developer Documentation**
- File: `/docs/ocr-technical-guide.md`
- Sections:
  - Architecture overview
  - Vision API setup and configuration
  - Field extraction logic
  - Adding new extraction patterns
  - Troubleshooting common issues
  - Cost estimation and monitoring

**Task 9.3: Update CHANGELOG**
- Add entry for Phase 6: OCR Integration
- List all new files created
- Document breaking changes (if any)
- Note feature flags or environment variables needed

**Task 9.4: Add Help Text to UI**
- In upload component:
  - Tooltip: "Upload your Bill of Lading to auto-fill the form"
  - Help icon with expanded explanation
  - Link to documentation
- In review panel:
  - Explain confidence scores
  - Encourage reviewing low-confidence fields

**Task 9.5: Final UI Polish**
- Ensure consistent styling with rest of app
- Add smooth transitions for OCR workflow
- Improve error messages (user-friendly, actionable)
- Add success animations after successful extraction
- Ensure mobile responsiveness (file upload on mobile)

**Acceptance Criteria:**
- ✓ User documentation complete and accessible
- ✓ Developer documentation for future maintenance
- ✓ CHANGELOG updated
- ✓ Help text throughout UI
- ✓ UI polished and consistent

---

## Critical Files to Create/Modify

### New Files (23 total)

**Backend - API Routes:**
1. `/src/app/api/ocr/upload/route.ts` - File upload endpoint
2. `/src/app/api/ocr/process/route.ts` - OCR processing endpoint
3. `/src/app/api/ocr/stats/route.ts` - OCR analytics endpoint

**Backend - OCR Utilities:**
4. `/src/lib/ocr/vision-client.ts` - Vision API wrapper
5. `/src/lib/ocr/field-extractors.ts` - Field extraction logic
6. `/src/lib/ocr/confidence-calculator.ts` - Confidence scoring
7. `/src/lib/ocr/port-lookup.ts` - Port code mapping
8. `/src/lib/ocr/types.ts` - OCR TypeScript types

**Backend - Utilities:**
9. `/src/lib/utils/file-validation.ts` - File type/size validation
10. `/src/lib/utils/document-storage.ts` - Document storage logic

**Frontend - Components:**
11. `/src/components/ocr/DocumentUpload.tsx` - Upload component
12. `/src/components/ocr/OCRStatusBadge.tsx` - Status indicator
13. `/src/components/ocr/OCRReviewPanel.tsx` - Review interface
14. `/src/components/ocr/FieldConfidenceIndicator.tsx` - Confidence badge

**Frontend - Hooks:**
15. `/src/lib/hooks/useDocumentUpload.ts` - Upload/OCR hook
16. `/src/lib/hooks/useOCRStats.ts` - Analytics hook

**Database:**
17. `/supabase/migrations/XXX_create_ocr_history_table.sql` - OCR history table

**Documentation:**
18. `/docs/ocr-user-guide.md` - User documentation
19. `/docs/ocr-technical-guide.md` - Developer documentation

**Configuration:**
20. `.env.local` - Add Vision API credentials
21. `.env.example` - Template for credentials
22. `.gitignore` - Ensure credentials excluded

**Testing:**
23. `/tests/ocr/field-extraction.test.ts` - Unit tests for extractors

### Modified Files (4 total)

1. `/src/components/containers/ContainerRegistrationForm.tsx` - Add OCR data support
2. `/src/components/containers/ContainerDialog.tsx` - Add upload tab
3. `/src/app/api/containers/route.ts` - Store OCR metadata
4. `/CHANGELOG.md` - Document Phase 6 changes

---

## Environment Variables Required

```bash
# Google Cloud Vision API
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

# Or use API key (less secure)
GOOGLE_CLOUD_VISION_API_KEY=your-api-key

# Document storage (choose one)
# Option A: Local filesystem (for development)
UPLOAD_DIR=/tmp/gtms-uploads

# Option B: Supabase Storage (recommended)
SUPABASE_STORAGE_BUCKET=bill-of-lading-documents

# Option C: Google Cloud Storage
GCS_BUCKET_NAME=gtms-documents

# OCR Configuration
MAX_FILE_SIZE_MB=10
OCR_TIMEOUT_SECONDS=60
MIN_CONFIDENCE_THRESHOLD=60
```

---

## Success Criteria

### Functional Requirements
- ✓ Users can upload BOL documents (PDF, JPG, PNG, TIFF)
- ✓ OCR extracts text using Google Cloud Vision API
- ✓ Form fields auto-filled with extracted data
- ✓ Confidence scores calculated for each field
- ✓ Low-confidence fields highlighted for review
- ✓ Users can edit any auto-filled field
- ✓ OCR metadata stored in database
- ✓ Error handling for failed uploads/OCR
- ✓ Works on mobile and desktop

### Performance Requirements
- ✓ OCR processing completes in <30 seconds (typical)
- ✓ File upload responsive with progress indicator
- ✓ UI remains interactive during processing
- ✓ No blocking operations on main thread

### Accuracy Requirements
- ✓ Tier 1 fields: >90% extraction accuracy
- ✓ Tier 2 fields: >80% extraction accuracy
- ✓ Tier 3 fields: >70% extraction accuracy
- ✓ Overall confidence score >85% for typical BOL documents

### Security Requirements
- ✓ API credentials never exposed to client
- ✓ File uploads validated (type, size)
- ✓ Uploaded documents accessible only to owner
- ✓ RLS policies enforced on OCR history
- ✓ No sensitive data logged

### User Experience Requirements
- ✓ Clear workflow: Upload → Extract → Review → Submit
- ✓ Helpful error messages
- ✓ Visual feedback during processing
- ✓ Confidence indicators intuitive
- ✓ Graceful fallback to manual entry

---

## Cost Estimation

**Google Cloud Vision API Pricing:**
- Text Detection: $1.50 per 1,000 images (first 1,000/month free)
- Document Text Detection: $1.50 per 1,000 images

**Estimated Monthly Costs** (based on usage):
- 100 containers/month: ~$0.15 (within free tier)
- 500 containers/month: $0.75
- 1,000 containers/month: $1.50
- 5,000 containers/month: $7.50
- 10,000 containers/month: $15.00

**Optimization Tips:**
- Cache OCR results (don't re-process same document)
- Batch process if multiple pages
- Use document text detection (more accurate, same cost)
- Monitor usage to stay within budget

---

## Timeline Estimate

- **Sprint 1** (Setup): 1-2 hours
- **Sprint 2** (Upload Infrastructure): 2-3 hours
- **Sprint 3** (OCR Processing): 4-5 hours
- **Sprint 4** (Upload UI): 3-4 hours
- **Sprint 5** (Form Integration): 4-5 hours
- **Sprint 6** (Database): 2-3 hours
- **Sprint 7** (Error Handling): 2-3 hours
- **Sprint 8** (Testing): 3-4 hours
- **Sprint 9** (Documentation): 1-2 hours

**Total Estimated Time**: 22-31 hours

**Realistic Total with Buffer**: 30-40 hours (accounts for debugging, API quirks, testing iterations)

---

## Risk Mitigation

**Risk 1: Low OCR Accuracy**
- Mitigation: Start with high-quality sample docs to train extractors
- Mitigation: Always allow manual correction
- Mitigation: Store raw OCR output for later improvement

**Risk 2: Vision API Costs Exceed Budget**
- Mitigation: Set up cost alerts in GCP Console
- Mitigation: Implement rate limiting (max uploads per user/day)
- Mitigation: Cache results, don't reprocess same document

**Risk 3: Poor Document Quality Uploads**
- Mitigation: Client-side file validation and compression
- Mitigation: Provide upload tips (good lighting, clear scan, etc.)
- Mitigation: Graceful fallback to manual entry

**Risk 4: API Rate Limits**
- Mitigation: Implement retry logic with exponential backoff
- Mitigation: Queue system for batch processing
- Mitigation: User notification if processing delayed

**Risk 5: Complex/Non-Standard BOL Formats**
- Mitigation: Test with diverse BOL formats
- Mitigation: Use flexible extraction patterns
- Mitigation: Allow user feedback to improve patterns over time

---

Ready to begin implementation!

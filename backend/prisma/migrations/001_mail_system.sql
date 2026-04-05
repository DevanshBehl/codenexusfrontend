-- ==========================================
-- SQL Migration: Code Nexus Internal Mail System
-- ==========================================

-- 1. Add CNID column to users table if not present
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS cnid VARCHAR(20) UNIQUE;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS cnid_role VARCHAR(20) CHECK (cnid_role IN ('student', 'university', 'company', 'recruiter'));

-- 2. Create mails table
CREATE TABLE IF NOT EXISTS "Mail" (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_cnid           VARCHAR(20) NOT NULL,
    recipient_cnid       VARCHAR(20) NOT NULL,
    subject               VARCHAR(200) NOT NULL,
    body                  TEXT NOT NULL,
    sent_at               TIMESTAMP DEFAULT NOW(),
    is_read               BOOLEAN DEFAULT FALSE,
    is_deleted_sender     BOOLEAN DEFAULT FALSE,
    is_deleted_recipient  BOOLEAN DEFAULT FALSE,
    thread_id             UUID NOT NULL,
    parent_mail_id        UUID REFERENCES "Mail"(id),
    created_at            TIMESTAMP DEFAULT NOW(),
    updated_at            TIMESTAMP DEFAULT NOW()
);

-- 3. Create indexes for mail queries
CREATE INDEX IF NOT EXISTS idx_mails_recipient ON "Mail"(recipient_cnid, is_read, is_deleted_recipient);
CREATE INDEX IF NOT EXISTS idx_mails_sender ON "Mail"(sender_cnid, is_deleted_sender);
CREATE INDEX IF NOT EXISTS idx_mails_thread ON "Mail"(thread_id);

-- 4. Add foreign key constraints (CNID references are enforced via application logic since cnid is not a PK)
-- Note: We use cnid as a business identifier, not a foreign key to users.id

-- 5. Create permission violation log table for security audit
CREATE TABLE IF NOT EXISTS "MailPermissionViolation" (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_cnid     VARCHAR(20) NOT NULL,
    attempted_recipient_cnid VARCHAR(20) NOT NULL,
    action          VARCHAR(50) NOT NULL,
    timestamp       TIMESTAMP DEFAULT NOW(),
    ip_address      VARCHAR(45),
    user_agent      TEXT
);

CREATE INDEX IF NOT EXISTS idx_permission_violations_sender ON "MailPermissionViolation"(sender_cnid, timestamp);
CREATE INDEX IF NOT EXISTS idx_permission_violations_time ON "MailPermissionViolation"(timestamp);

-- ==========================================
-- Rollback Script (if needed)
-- ==========================================
-- DROP TABLE IF EXISTS "MailPermissionViolation";
-- DROP TABLE IF EXISTS "Mail";
-- ALTER TABLE "User" DROP COLUMN IF EXISTS cnid;
-- ALTER TABLE "User" DROP COLUMN IF EXISTS cnid_role;
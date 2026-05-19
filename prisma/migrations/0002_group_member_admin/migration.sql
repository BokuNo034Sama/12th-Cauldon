-- Add group-level admin flag for invite and membership management workflows.
ALTER TABLE "group_members" ADD COLUMN "is_admin" BOOLEAN NOT NULL DEFAULT false;

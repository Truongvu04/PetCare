-- Add rejection_reason field to vendors table
ALTER TABLE vendors ADD COLUMN rejection_reason TEXT NULL AFTER status;


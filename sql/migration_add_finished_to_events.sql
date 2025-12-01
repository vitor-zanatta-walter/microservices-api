-- Migration: Add finished column to Events table
-- This column tracks whether an event has been marked as finished

ALTER TABLE `Events` 
ADD COLUMN `finished` BOOLEAN NOT NULL DEFAULT 0;

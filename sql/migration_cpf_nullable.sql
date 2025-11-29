-- Script de migração para tornar CPF opcional
-- Execute este script no banco de dados

ALTER TABLE `Users` 
MODIFY COLUMN `cpf` VARCHAR(20) NULL;

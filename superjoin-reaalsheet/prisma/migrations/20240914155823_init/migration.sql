-- CreateTable
CREATE TABLE `Sheet` (
    `id` VARCHAR(191) NOT NULL,
    `rowId` VARCHAR(191) NOT NULL,
    `column1` VARCHAR(191) NOT NULL,
    `column2` VARCHAR(191) NOT NULL,
    `column3` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

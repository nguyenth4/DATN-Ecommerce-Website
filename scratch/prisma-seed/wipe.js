const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function wipe() {
  await prisma.product_category_product.deleteMany({});
  await prisma.product.deleteMany({
    where: {
      handle: {
        in: ['iphone-15-pro-max', 'samsung-galaxy-s24-ultra', 'google-pixel-8-pro', 'xiaomi-14-pro', 'oneplus-12']
      }
    }
  });
  await prisma.product_category.deleteMany({
    where: { handle: 'dien-thoai' }
  });
  console.log("Deleted old raw products");
}
wipe().finally(() => prisma.$disconnect());

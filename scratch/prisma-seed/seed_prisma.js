const { PrismaClient } = require('@prisma/client');
const { ulid } = require('ulid');

const prisma = new PrismaClient();

async function main() {
  console.log('Bắt đầu thêm dữ liệu bằng Prisma...');

  // Lấy Sales Channel và Shipping Profile mặc định
  const defaultSalesChannel = await prisma.sales_channel.findFirst({
    where: { name: 'Default Sales Channel' }
  }) || await prisma.sales_channel.findFirst();

  const defaultShippingProfile = await prisma.shipping_profile.findFirst({
    where: { type: 'default' }
  }) || await prisma.shipping_profile.findFirst();

  if (!defaultSalesChannel || !defaultShippingProfile) {
    console.error('Không tìm thấy default sales channel hoặc shipping profile!');
    return;
  }
  console.log(`Dùng Sales Channel: ${defaultSalesChannel.name} (${defaultSalesChannel.id})`);
  console.log(`Dùng Shipping Profile: ${defaultShippingProfile.name} (${defaultShippingProfile.id})`);

  // 1. Tạo Category "Điện thoại"
  const catId = `pcat_${ulid()}`;
  const category = await prisma.product_category.create({
    data: {
      id: catId,
      name: 'Điện thoại',
      handle: 'dien-thoai',
      description: 'Các dòng điện thoại thông minh mới nhất',
      mpath: `${catId}.`,
      is_active: true,
      is_internal: false
    },
  });
  console.log(`Đã tạo danh mục: ${category.name} (${category.id})`);

  // 2. Tạo 5 Sản phẩm Điện thoại
  const phones = [
    { title: 'iPhone 15 Pro Max', handle: 'iphone-15-pro-max', description: 'Apple iPhone 15 Pro Max 256GB', basePrice: 1200 },
    { title: 'Samsung Galaxy S24 Ultra', handle: 'samsung-galaxy-s24-ultra', description: 'Samsung Galaxy S24 Ultra 5G', basePrice: 1100 },
    { title: 'Google Pixel 8 Pro', handle: 'google-pixel-8-pro', description: 'Google Pixel 8 Pro 128GB', basePrice: 999 },
    { title: 'Xiaomi 14 Pro', handle: 'xiaomi-14-pro', description: 'Xiaomi 14 Pro 5G 256GB', basePrice: 850 },
    { title: 'OnePlus 12', handle: 'oneplus-12', description: 'OnePlus 12 5G 512GB', basePrice: 800 },
  ];

  for (const p of phones) {
    const prodId = `prod_${ulid()}`;
    const product = await prisma.product.create({
      data: {
        id: prodId,
        title: p.title,
        handle: p.handle,
        description: p.description,
        status: 'published',
        // Thiết lập liên kết với category
        product_category_product: {
          create: {
            product_category_id: category.id,
          }
        }
      },
    });

    // Link Sales Channel
    await prisma.product_sales_channel.create({
      data: {
        id: `link_${ulid()}`,
        product_id: product.id,
        sales_channel_id: defaultSalesChannel.id
      }
    });

    // Link Shipping Profile
    await prisma.product_shipping_profile.create({
      data: {
        id: `link_${ulid()}`,
        product_id: product.id,
        shipping_profile_id: defaultShippingProfile.id
      }
    });

    // Tạo Options
    const optionId = `opt_${ulid()}`;
    await prisma.product_option.create({
      data: {
        id: optionId,
        title: 'Màu sắc',
        product_id: product.id
      }
    });

    const optVal1 = `optval_${ulid()}`;
    const optVal2 = `optval_${ulid()}`;
    await prisma.product_option_value.create({ data: { id: optVal1, value: 'Đen', option_id: optionId }});
    await prisma.product_option_value.create({ data: { id: optVal2, value: 'Trắng', option_id: optionId }});

    // Tạo Variants
    const variant1Id = `variant_${ulid()}`;
    const variant2Id = `variant_${ulid()}`;

    const vars = [
      { id: variant1Id, title: 'Đen', optId: optVal1 },
      { id: variant2Id, title: 'Trắng', optId: optVal2 }
    ];

    for (const v of vars) {
      await prisma.product_variant.create({
        data: {
          id: v.id,
          title: v.title,
          product_id: product.id,
          manage_inventory: false,
          allow_backorder: true
        }
      });

      // Link Option Value
      await prisma.product_variant_option.create({
        data: {
          variant_id: v.id,
          option_value_id: v.optId
        }
      });

      // Tạo Price Set
      const priceSetId = `pset_${ulid()}`;
      await prisma.price_set.create({
        data: { id: priceSetId }
      });

      // Link Price Set to Variant
      await prisma.product_variant_price_set.create({
        data: {
          id: `link_${ulid()}`,
          variant_id: v.id,
          price_set_id: priceSetId
        }
      });

      // Tạo Prices (USD và VND)
      await prisma.price.create({
        data: {
          id: `price_${ulid()}`,
          price_set_id: priceSetId,
          currency_code: 'usd',
          amount: p.basePrice,
          raw_amount: { value: p.basePrice.toString(), precision: 20 }
        }
      });

      await prisma.price.create({
        data: {
          id: `price_${ulid()}`,
          price_set_id: priceSetId,
          currency_code: 'vnd',
          amount: p.basePrice * 25000,
          raw_amount: { value: (p.basePrice * 25000).toString(), precision: 20 }
        }
      });
    }

    console.log(`Đã tạo sản phẩm hoàn chỉnh: ${product.title} (${product.id})`);
  }

  console.log('Hoàn thành việc tạo 5 điện thoại bằng Prisma!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

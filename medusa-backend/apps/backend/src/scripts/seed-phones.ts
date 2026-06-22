import { MedusaContainer } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createProductCategoriesWorkflow,
  createProductsWorkflow,
} from "@medusajs/medusa/core-flows";

export default async function seedPhones({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  logger.info("Bắt đầu tạo dữ liệu điện thoại...");

  // Lấy Default Sales Channel
  const { data: salesChannels } = await query.graph({
    entity: "sales_channel",
    fields: ["id"],
  });
  const defaultSalesChannel = salesChannels[0];

  if (!defaultSalesChannel) {
    throw new Error("Không tìm thấy Sales Channel. Vui lòng chạy npm run backend:seed trước.");
  }

  // Lấy Shipping Profile (mặc định)
  const { data: shippingProfiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  });
  const defaultShippingProfile = shippingProfiles[0];

  if (!defaultShippingProfile) {
    throw new Error("Không tìm thấy Shipping Profile. Vui lòng chạy npm run backend:seed trước.");
  }

  // Lấy Region cho giá trị tiền tệ
  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "currency_code"],
  });
  const region = regions[0];

  // Tạo Category "Điện thoại"
  const { result: categoryResult } = await createProductCategoriesWorkflow(
    container
  ).run({
    input: {
      product_categories: [
        {
          name: "Điện thoại",
          is_active: true,
        },
      ],
    },
  });

  const categoryId = categoryResult[0].id;

  // Dữ liệu 5 điện thoại
  const phones = [
    { title: "iPhone 15 Pro Max", handle: "iphone-15-pro-max", basePriceUsd: 1199 },
    { title: "Samsung Galaxy S24 Ultra", handle: "samsung-galaxy-s24-ultra", basePriceUsd: 1299 },
    { title: "Google Pixel 8 Pro", handle: "google-pixel-8-pro", basePriceUsd: 999 },
    { title: "Xiaomi 14 Pro", handle: "xiaomi-14-pro", basePriceUsd: 899 },
    { title: "OnePlus 12", handle: "oneplus-12", basePriceUsd: 799 },
  ];

  const productsInput = phones.map((p) => ({
    title: p.title,
    category_ids: [categoryId],
    description: `Sản phẩm ${p.title} chính hãng, cấu hình cực mạnh.`,
    handle: p.handle,
    weight: 200,
    status: ProductStatus.PUBLISHED,
    shipping_profile_id: defaultShippingProfile.id,
    options: [
      {
        title: "Dung lượng",
        values: ["256GB", "512GB"],
      },
      {
        title: "Màu sắc",
        values: ["Đen", "Trắng"],
      },
    ],
    variants: [
      {
        title: "256GB / Đen",
        sku: `${p.handle}-256-blk`,
        options: { "Dung lượng": "256GB", "Màu sắc": "Đen" },
        prices: [
          { amount: p.basePriceUsd, currency_code: "usd" },
          { amount: p.basePriceUsd, currency_code: "eur" },
          ...(region ? [{ region_id: region.id, amount: p.basePriceUsd }] : [])
        ],
      },
      {
        title: "256GB / Trắng",
        sku: `${p.handle}-256-wht`,
        options: { "Dung lượng": "256GB", "Màu sắc": "Trắng" },
        prices: [
          { amount: p.basePriceUsd, currency_code: "usd" },
          { amount: p.basePriceUsd, currency_code: "eur" },
          ...(region ? [{ region_id: region.id, amount: p.basePriceUsd }] : [])
        ],
      },
      {
        title: "512GB / Đen",
        sku: `${p.handle}-512-blk`,
        options: { "Dung lượng": "512GB", "Màu sắc": "Đen" },
        prices: [
          { amount: p.basePriceUsd + 100, currency_code: "usd" },
          { amount: p.basePriceUsd + 100, currency_code: "eur" },
          ...(region ? [{ region_id: region.id, amount: p.basePriceUsd + 100 }] : [])
        ],
      },
      {
        title: "512GB / Trắng",
        sku: `${p.handle}-512-wht`,
        options: { "Dung lượng": "512GB", "Màu sắc": "Trắng" },
        prices: [
          { amount: p.basePriceUsd + 100, currency_code: "usd" },
          { amount: p.basePriceUsd + 100, currency_code: "eur" },
          ...(region ? [{ region_id: region.id, amount: p.basePriceUsd + 100 }] : [])
        ],
      },
    ],
    sales_channels: [
      {
        id: defaultSalesChannel.id,
      },
    ],
  }));

  await createProductsWorkflow(container).run({
    input: {
      products: productsInput,
    },
  });

  logger.info("Đã tạo xong 5 sản phẩm điện thoại kèm variants, prices, sales channels và shipping profile!");
}

import { MedusaContainer } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  ModuleRegistrationName,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createInventoryLevelsWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";

export default async function seed_phones({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const storeModuleService = container.resolve(ModuleRegistrationName.STORE);

  logger.info("Starting phone and technology products seed...");

  // 1. Fetch Store and ensure VND is supported
  const stores = await storeModuleService.listStores();
  if (stores.length === 0) {
    logger.error("No store found! Cannot seed products.");
    return;
  }
  const store = stores[0];
  const currentCurrencies = store.supported_currencies || [];
  const hasVnd = currentCurrencies.some((c: any) => c.currency_code === "vnd");

  if (!hasVnd) {
    logger.info("Adding VND to store supported currencies...");
    try {
      await updateStoresWorkflow(container).run({
        input: {
          selector: { id: store.id },
          update: {
            supported_currencies: [
              ...currentCurrencies.map((c: any) => ({
                currency_code: c.currency_code,
                is_default: c.is_default,
              })),
              {
                currency_code: "vnd",
                is_default: false,
              },
            ],
          },
        },
      });
      logger.info("VND successfully added to store.");
    } catch (err: any) {
      logger.warn(`Failed to add VND currency: ${err.message}`);
    }
  }

  // 2. Fetch existing sales channel
  const { data: salesChannels } = await query.graph({
    entity: "sales_channel",
    fields: ["id", "name"],
  });
  if (salesChannels.length === 0) {
    logger.error("No sales channel found! Cannot seed products.");
    return;
  }
  const salesChannel = salesChannels[0];

  // 3. Fetch existing shipping profile
  const { data: shippingProfiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  });
  if (shippingProfiles.length === 0) {
    logger.error("No shipping profile found! Cannot seed products.");
    return;
  }
  const shippingProfile = shippingProfiles[0];

  // 4. Fetch existing stock location
  const { data: stockLocations } = await query.graph({
    entity: "stock_location",
    fields: ["id"],
  });
  const stockLocation = stockLocations[0];

  // 5. Create Vietnam Region if it doesn't exist
  const { data: existingRegions } = await query.graph({
    entity: "region",
    fields: ["id", "name", "currency_code"],
  });
  let vnRegion: any = existingRegions.find((r: any) => r.currency_code === "vnd");

  if (!vnRegion) {
    logger.info("Seeding Vietnam region...");
    try {
      const { result: regionResult } = await createRegionsWorkflow(container).run({
        input: {
          regions: [
            {
              name: "Vietnam",
              currency_code: "vnd",
              countries: ["vn"],
              payment_providers: ["pp_system_default"],
            },
          ],
        },
      });
      vnRegion = regionResult[0];
      logger.info("Finished seeding Vietnam region.");
    } catch (err: any) {
      logger.warn(`Failed to create Vietnam region: ${err.message}. Using Europe/EUR region instead.`);
      vnRegion = existingRegions[0];
    }
  } else {
    logger.info("Vietnam region already exists.");
  }

  // 6. Create categories
  logger.info("Checking product categories...");
  const { data: existingCategories } = await query.graph({
    entity: "product_category",
    fields: ["id", "name"],
  });

  let phoneCategory: any = existingCategories.find((c: any) => c.name === "Điện thoại");
  let laptopCategory: any = existingCategories.find((c: any) => c.name === "Laptop");

  if (!phoneCategory || !laptopCategory) {
    const categoriesToCreate: any[] = [];
    if (!phoneCategory) categoriesToCreate.push({ name: "Điện thoại", is_active: true });
    if (!laptopCategory) categoriesToCreate.push({ name: "Laptop", is_active: true });

    try {
      const { result: categoryResult } = await createProductCategoriesWorkflow(
        container
      ).run({
        input: {
          product_categories: categoriesToCreate,
        },
      });

      if (!phoneCategory) phoneCategory = categoryResult.find((c: any) => c.name === "Điện thoại");
      if (!laptopCategory) laptopCategory = categoryResult.find((c: any) => c.name === "Laptop");
      logger.info("Successfully created missing categories.");
    } catch (err: any) {
      logger.warn(`Failed to create categories: ${err.message}`);
    }
  } else {
    logger.info("Categories already exist.");
  }

  // 7. Create Phone Products
  logger.info("Checking products...");
  const { data: existingProducts } = await query.graph({
    entity: "product",
    fields: ["id", "title"],
  });

  const productsToSeed = [
    {
      title: "iPhone 16 Pro",
      category_id: phoneCategory?.id,
      handle: "iphone-16-pro",
      description: "iPhone 16 Pro sở hữu thiết kế bằng Titan cấp vũ trụ siêu nhẹ và bền bỉ. Sức mạnh vượt trội từ Chip A18 Pro.",
      thumbnail: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/i/p/iphone-16-pro-titan-sa-mac.png",
      options: [
        { title: "Màu sắc", values: ["Titan Sa Mạc", "Titan Đen", "Titan Trắng"] },
        { title: "Dung lượng", values: ["128GB", "256GB"] },
      ],
      variants: [
        { title: "Titan Sa Mạc / 128GB", sku: "IP16P-SD-128", Color: "Titan Sa Mạc", Storage: "128GB", price: 28999000 },
        { title: "Titan Sa Mạc / 256GB", sku: "IP16P-SD-256", Color: "Titan Sa Mạc", Storage: "256GB", price: 31999000 },
        { title: "Titan Đen / 128GB", sku: "IP16P-D-128", Color: "Titan Đen", Storage: "128GB", price: 28999000 },
        { title: "Titan Đen / 256GB", sku: "IP16P-D-256", Color: "Titan Đen", Storage: "256GB", price: 31999000 },
      ],
    },
    {
      title: "Samsung Galaxy S25 Ultra",
      category_id: phoneCategory?.id,
      handle: "samsung-galaxy-s25-ultra",
      description: "Samsung Galaxy S25 Ultra đỉnh cao công nghệ và AI quyền năng với bút S-Pen thế hệ mới.",
      thumbnail: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/s/a/samsung-s25-ultra-gray.png",
      options: [
        { title: "Màu sắc", values: ["Titan Xám", "Titan Đen"] },
        { title: "Dung lượng", values: ["256GB", "512GB"] },
      ],
      variants: [
        { title: "Titan Xám / 256GB", sku: "S25U-X-256", Color: "Titan Xám", Storage: "256GB", price: 31990000 },
        { title: "Titan Xám / 512GB", sku: "S25U-X-512", Color: "Titan Xám", Storage: "512GB", price: 35990000 },
        { title: "Titan Đen / 256GB", sku: "S25U-D-256", Color: "Titan Đen", Storage: "256GB", price: 31990000 },
      ],
    },
  ];

  for (const prodInfo of productsToSeed) {
    if (existingProducts.some((p: any) => p.title === prodInfo.title)) {
      logger.info(`Product "${prodInfo.title}" already exists. Skipping.`);
      continue;
    }

    logger.info(`Seeding product "${prodInfo.title}"...`);
    try {
      const formattedProduct = {
        title: prodInfo.title,
        description: prodInfo.description,
        handle: prodInfo.handle,
        thumbnail: prodInfo.thumbnail,
        status: "published" as any,
        categories: prodInfo.category_id ? [{ id: prodInfo.category_id }] : [],
        sales_channels: [{ id: salesChannel.id }],
        options: prodInfo.options.map((opt) => ({
          title: opt.title,
          values: opt.values,
        })),
        variants: prodInfo.variants.map((v) => ({
          title: v.title,
          sku: v.sku,
          options: {
            "Màu sắc": v.Color,
            "Dung lượng": v.Storage,
          },
          prices: [
            {
              amount: v.price,
              currency_code: vnRegion?.currency_code || "vnd",
            },
          ],
        })),
      };

      await createProductsWorkflow(container).run({
        input: {
          products: [formattedProduct],
        },
      });
      logger.info(`Product "${prodInfo.title}" seeded successfully.`);
    } catch (err: any) {
      logger.warn(`Failed to seed product "${prodInfo.title}": ${err.message}`);
    }
  }

  // 8. Seed inventory levels
  if (stockLocation) {
    logger.info("Seeding inventory levels for new products...");
    try {
      const { data: inventoryItems } = await query.graph({
        entity: "inventory_item",
        fields: ["id"],
      });

      const { data: existingLevels } = await query.graph({
        entity: "inventory_level",
        fields: ["inventory_item_id"],
      });

      const itemsToLevel = inventoryItems.filter(
        (item: any) => !existingLevels.some((l: any) => l.inventory_item_id === item.id)
      );

      if (itemsToLevel.length > 0) {
        await createInventoryLevelsWorkflow(container).run({
          input: {
            inventory_levels: itemsToLevel.map((item: any) => ({
              location_id: stockLocation.id,
              stocked_quantity: 1000,
              inventory_item_id: item.id,
            })),
          },
        });
        logger.info("Inventory levels seeded successfully.");
      } else {
        logger.info("No new inventory levels to seed.");
      }
    } catch (err: any) {
      logger.warn(`Failed to seed inventory levels: ${err.message}`);
    }
  }

  logger.info("Seeding process completed!");
}

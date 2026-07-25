import { MedusaContainer } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";

export default async function createAdmin({ container }: { container: MedusaContainer }) {
  const userModuleService = container.resolve(Modules.USER);
  const authModuleService = container.resolve(Modules.AUTH);
  
  try {
    const user = await userModuleService.createUsers({
      email: "admin@gmail.com",
      first_name: "Admin",
      last_name: "User"
    });
    console.log("User created:", user.id);

    // In Medusa v2, you need to create auth identity with hashed password.
    // However, the best way in Medusa v2 is to use the create user workflow if we can, or just auth module.
    // Wait, authModuleService.register might be better? No, let's use the core workflow.
  } catch (err) {
    console.error("Error creating user:", err);
  }
}

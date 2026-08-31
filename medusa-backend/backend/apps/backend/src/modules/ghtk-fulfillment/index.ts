import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import GhtkFulfillmentProviderService from "./service"

export default ModuleProvider(Modules.FULFILLMENT, {
  services: [GhtkFulfillmentProviderService],
})

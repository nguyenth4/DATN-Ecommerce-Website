import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import GhnFulfillmentProviderService from "./service"

export default ModuleProvider(Modules.FULFILLMENT, {
  services: [GhnFulfillmentProviderService],
})

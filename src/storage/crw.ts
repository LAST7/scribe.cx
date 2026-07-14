import { storage } from "wxt/utils/storage";

import { CRWConfig } from "@/types/crw";

export const CRWConfigStorage = storage.defineItem<CRWConfig, {}>("local:crw_config",{
    fallback: {
        endpoint: "",
        apiKey: ""
    }
})

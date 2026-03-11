import {
  createSystem,
  defaultConfig,
  defineConfig,
  defineRecipe,
} from "@chakra-ui/react"

const buttonRecipe = defineRecipe({
  base: {
    borderRadius: "full",
  },
})

const customThemeConfig = defineConfig({
  globalCss: {
    html: {
      colorPalette: "teal",
    },
  },
  theme: {
    recipes: {
      button: buttonRecipe,
    },
  },
})

export const system = createSystem(defaultConfig, customThemeConfig)

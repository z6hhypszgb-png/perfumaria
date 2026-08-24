/**
 * Configuração central da experiência.
 * Tudo o que pode mudar com o tempo (contato, fontes de dados, links)
 * fica concentrado aqui — nenhuma credencial privada é necessária.
 */
export const CONFIG = {
  brand: {
    name: "João Gabriel Gomes",
    tagline: "Perfumaria além do óbvio.",
  },

  // Número em formato internacional, somente dígitos (país + DDD + número).
  whatsapp: {
    number: "5516993198821",
    // [NOME] e [VOLUME] são substituídos automaticamente.
    productMessage:
      "Olá! Tenho interesse no [NOME] [VOLUME]. Gostaria de receber mais informações.",
    genericMessage:
      "Olá! Tenho interesse nos perfumes da curadoria. Gostaria de receber mais informações.",
  },

  // Planilha pública (somente leitura). O site consome o endpoint gviz,
  // que devolve JSON sem exigir chave de API.
  sheet: {
    id: "1HK-8fpyJaVFsMW0oZn3Se0q8UVijOvSofD_aBbbeYJc",
    gid: "0",
    // Cache local (sessionStorage) para navegação fluida. Em milissegundos.
    cacheTtl: 10 * 60 * 1000,
  },

  youtube: {
    channelUrl: "https://www.youtube.com/@Jo%C3%A3oGabrielGomes",
    channelName: "João Gabriel Gomes",
  },

  simulator: {
    url: "https://simulador-parcelamento-operadoras.joaogabrielgpt.chatgpt.site",
  },
};

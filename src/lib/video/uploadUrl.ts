// Отдельно от streamApi.ts: нужен и браузеру (загрузка в админке), а там
// серверный код с токеном тянуть нельзя.

// uid стоит в пути tus-ссылки: https://upload.cloudflarestream.com/tus/<uid>?tusv2=true
export const uidFromUploadUrl = (uploadUrl: string | null | undefined) =>
  uploadUrl?.match(/\/([0-9a-f]{32})(?:[/?]|$)/)?.[1] ?? null;

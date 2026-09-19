// Тизер — публичное видео в Stream (без Require signed URLs), поэтому ссылка
// без токена. Подписывать нельзя: страница курса кэшируется ISR и может
// отдаваться дольше, чем живёт подписанный токен (30 мин) — тизер бы «умирал».
export const getTeaserEmbedUrl = (videoId: null | string | undefined): null | string => {
  const customerCode = process.env.CF_STREAM_CUSTOMER_CODE;

  if (!videoId || !customerCode) {
    return null;
  }

  return `https://customer-${customerCode}.cloudflarestream.com/${videoId}/iframe`;
};

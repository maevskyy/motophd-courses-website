import { ConsentClient } from './ConsentClient';
import { getTrackingConfig } from './consentConfig';

// Куку согласия здесь читать нельзя: маркетинг раздаётся статикой и один
// рендер уходит всем посетителям. Решение по куке принимает ConsentClient.
export function Consent() {
  const trackingConfig = getTrackingConfig();

  if (!trackingConfig) {
    return null;
  }

  return <ConsentClient trackingConfig={trackingConfig} />;
}

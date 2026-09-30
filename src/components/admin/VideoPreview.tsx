import { getPlaybackUrl } from '@/lib/video/getPlaybackUrl';

interface Props {
  data?: { status?: string | null; streamUid?: string | null; title?: string | null };
}

// Плеер в карточке видео: посмотреть, то ли залили. Ссылка подписана, как у
// купившего; играет, только если admin.motophd.com есть в allowed origins
// видео — «Подтянуть из Stream» дописывает его старым видео.
export function VideoPreview({ data }: Props) {
  if (!data?.streamUid || data.status !== 'ready') {
    return null;
  }

  const src = getPlaybackUrl(data.streamUid, { free: false });

  if (!src) {
    return null;
  }

  return (
    <div className="field-type" style={{ marginBottom: 24, maxWidth: 720 }}>
      <iframe
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
        allowFullScreen
        src={src}
        style={{ aspectRatio: '16 / 9', border: 0, width: '100%' }}
        title={data.title || data.streamUid}
      />
    </div>
  );
}

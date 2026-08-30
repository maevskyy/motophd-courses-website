FROM postgres:16-alpine

RUN apk add --no-cache curl rclone tzdata

COPY backup.sh /usr/local/bin/backup
COPY crontab /etc/crontabs/root

RUN chmod 0755 /usr/local/bin/backup

CMD ["crond", "-f", "-l", "2"]

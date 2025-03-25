FROM python:3.13-rc-bookworm

WORKDIR /files


COPY --chmod=644 tools/req.txt /tmp/

RUN pip install -r /tmp/req.txt

COPY --chmod=755 tools/script.sh /bin/

ENTRYPOINT ["/bin/script.sh" ]

CMD ["watchfiles", "daphne auth.asgi:application --bind 0.0.0.0 --port 80"]


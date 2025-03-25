# ---> old file:   nginx/Dockerfile


# FROM nginx:1.27.1-bookworm

# COPY ./nginx.conf /etc/nginx/nginx.conf

# ENTRYPOINT ["nginx", "-g", "daemon off;"]


# ---> deprecated

# FROM owasp/modsecurity-crs:3.3.4-nginx-alpine-202301110601@sha256:46c78b60dff1c3767782d147657ff1058f99b3e538eeb6149b1ccd76bf582a34

# COPY tools/nginx.conf /etc/nginx/templates/conf.d/nginx.conf.template

# COPY tools/script.sh /bin/

# RUN chmod +x /bin/script.sh

# ENTRYPOINT ["/bin/script.sh"]


# ---> new file:   nginx/Dockerfile



FROM owasp/modsecurity-crs:4-nginx-202502270602

# Switch to root user for setup
USER root

# Copy nginx configuration
COPY tools/nginx.conf /etc/nginx/nginx.conf

# Create SSL directory, set permissions, and generate self-signed SSL certificate
RUN mkdir -p /etc/nginx/ssl && \
    chmod 755 /etc/nginx/ssl && \
    openssl req -x509 -newkey rsa:4096 -keyout /etc/nginx/ssl/transc.key \
    -out /etc/nginx/ssl/transc.crt -sha256 -days 365 -nodes -subj \
    "/C=MA/ST=BG/L=BG/O=Transc/OU=Net/CN=www.Transc-Net.com" && \
    chmod 644 /etc/nginx/ssl/transc.crt /etc/nginx/ssl/transc.key

# Copy the script and make it executable
COPY --chmod=755 tools/script.sh /bin/script.sh


# Use the script as the entrypoint
ENTRYPOINT ["/bin/script.sh"]

HEALTHCHECK --interval=1m --timeout=10s --retries=3 \
    CMD curl -f https://localhost:5000 || exit 1
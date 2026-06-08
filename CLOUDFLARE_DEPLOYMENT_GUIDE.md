# Cloudflare Tunnel Deployment Guide

This guide outlines the end-to-end process for deploying the TechLap e-commerce platform on a Linux VPS using Cloudflare Tunnels (`cloudflared`). 

Using Cloudflare Tunnels allows you to securely expose the application to the internet without opening any inbound ports on your server's firewall, providing built-in DDoS protection and SSL/TLS certificates.

> [!IMPORTANT]
> **Prerequisites:**
> - A Linux VPS (Ubuntu/Debian recommended).
> - Docker and Docker Compose installed.
> - A domain name with its DNS managed by Cloudflare.

---

## 1. Prepare the Environment

Clone the repository to your VPS and navigate to the project directory:

```bash
git clone <your-repository-url> techlap
cd techlap
```

Create your production environment variables:

```bash
cp .env.example .env
nano .env
```

Ensure the following critical values are securely filled out in your `.env` file:

```ini
# Backend Configuration
SECRET_KEY=your_super_secret_random_string_here

# Frontend Configuration
# These MUST match the domains you plan to configure in Cloudflare
VITE_API_URL=https://api.techlap.id.vn/v1
FRONTEND_URL=https://techlap.id.vn

# Database (Leave as postgres unless externally hosted)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_db_password

# VNPay / Cloudinary / SMTP
# Fill these in with your actual production credentials
```

---

## 2. Start the Docker Services

The `docker-compose.yml` is pre-configured to bind the Frontend and API Gateway strictly to `127.0.0.1`. This means they are only accessible from within the VPS itself.

Build and start the services in detached mode:

```bash
docker compose up -d --build
```

Verify that all services are running and healthy:

```bash
docker compose ps
```

---

## 3. Install Cloudflared

Download and install the official Cloudflare Tunnel daemon (`cloudflared`) directly on the Linux host OS:

```bash
# Download the latest package (Ubuntu/Debian)
wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb

# Install the package
sudo dpkg -i cloudflared-linux-amd64.deb
```

---

## 4. Authenticate and Create the Tunnel

Login to your Cloudflare account to authorize the tunnel. This command will output a URL. Open that URL in your local browser and select the domain you want to use.

```bash
cloudflared tunnel login
```

Create a new tunnel for the TechLap application:

```bash
cloudflared tunnel create techlap-tunnel
```

> [!NOTE]
> Upon success, this command will output a Tunnel ID and the path to a `.json` credentials file. Save the **Tunnel ID**, as you will need it for the next steps.

---

## 5. Route DNS

Tell Cloudflare to route your desired subdomains to the tunnel you just created.

Route the Frontend (e.g., `techlap.id.vn` or `www.techlap.id.vn`):
```bash
cloudflared tunnel route dns techlap-tunnel techlap.id.vn
```

Route the API Gateway (e.g., `api.techlap.id.vn`):
```bash
cloudflared tunnel route dns techlap-tunnel api.techlap.id.vn
```

---

## 6. Configure the Tunnel

Create the configuration file that tells `cloudflared` how to map the incoming public domains to your local Docker services.

Create and open a new config file:
```bash
nano ~/.cloudflared/config.yml
```

Paste the following configuration, replacing `<YOUR_TUNNEL_ID>` and the domains with your actual values:

```yaml
tunnel: <YOUR_TUNNEL_ID>
credentials-file: /home/<YOUR_LINUX_USER>/.cloudflared/<YOUR_TUNNEL_ID>.json

ingress:
  # API Gateway Route
  - hostname: api.techlap.id.vn
    service: http://127.0.0.1:8080
  
  # Frontend Route
  - hostname: techlap.id.vn
    service: http://127.0.0.1:5173
  
  # Catch-all rule (Required by Cloudflare)
  - service: http_status:404
```

---

## 7. Install and Start the Tunnel as a Service

To ensure `cloudflared` survives server reboots and runs quietly in the background, install it as a system service.

```bash
sudo cloudflared service install ~/.cloudflared/config.yml
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
```

Check the status to ensure the tunnel connected successfully:
```bash
sudo systemctl status cloudflared
```

---

## 8. Verification Steps

> [!TIP]
> DNS propagation within Cloudflare is nearly instant when using Tunnels. You can verify your deployment immediately.

1. **Frontend Check:** Open a web browser and navigate to `https://techlap.id.vn`. The TechLap frontend should load with a valid SSL certificate.
2. **API Check:** Navigate to `https://api.techlap.id.vn/v1/products` (or any public endpoint) to verify the API Gateway is successfully routing traffic.
3. **CORS Check:** Attempt to log in or browse products on the frontend. If the API requests succeed without CORS errors in the browser console, the `FRONTEND_URL` environment variable is correctly configured.
4. **Firewall Check:** (Optional) Verify your VPS security by attempting to curl your raw server IP address (`curl http://<YOUR_VPS_IP>:8080`). The connection should be actively refused, proving your application is safely hidden behind Cloudflare.

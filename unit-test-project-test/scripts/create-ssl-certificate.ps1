# Description: Create a self-signed SSL certificate for local development.
# Usage: ./create-ssl-certificate.ps1
if (Get-Command openssl -ErrorAction SilentlyContinue) {
    openssl req `
        -nodes `
        -new `
        -x509 `
        -keyout ../src/api/assets/server.key `
        -out ../src/api/assets/server.cert `
        -days 825 `
        -subj "/C=AU/ST=ACT/L=Canberra/O=Department of Employment/CN=localhost"
}
else {
    Write-Host "OpenSSL is not installed."
}

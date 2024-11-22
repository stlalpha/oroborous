import http.server
import socketserver
import mimetypes

# Add WASM mime type
mimetypes.add_type('application/wasm', '.wasm')

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
    def end_headers(self):
        # Add CORS and security headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.send_header('Cross-Origin-Opener-Policy', 'same-origin')
        self.send_header('Cross-Origin-Embedder-Policy', 'require-corp')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def guess_type(self, path):
        if path.endswith('.wasm'):
            return 'application/wasm'
        if path.endswith('.mod'):
            return 'audio/mod'
        return super().guess_type(path)

PORT = 8000
Handler = CustomHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Serving at port {PORT}")
    print("MIME types:")
    print(f" - .wasm -> {Handler.guess_type(None, 'test.wasm')}")
    print(f" - .mod -> {Handler.guess_type(None, 'test.mod')}")
    httpd.serve_forever() 